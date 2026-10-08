import { registerCharacterController } from './components/character-controller.js';
import { registerCameraRig } from './components/camera-rig.js';
import { fileSystem, getFolderContents, getFileContent } from './filesystem.js';
import { audioManager } from './audio-manager.js';
import { snakeGame } from './games/snake.js';

// Initialize components
registerCharacterController();
registerCameraRig();

document.addEventListener('DOMContentLoaded', () => {
    // --- UI References ---
    const uiLayer = document.getElementById('ui-layer');
    const loadingScreen = document.getElementById('loading-screen');
    const finderContent = document.getElementById('finder-content');
    const previewPane = document.getElementById('preview-pane');

    // Settings Refs
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsBtn = document.getElementById('close-settings');
    const muteToggle = document.getElementById('mute-toggle');
    const windowTitle = document.querySelector('.window-title');
    const backBtn = document.getElementById('nav-back');
    const sidebarItems = document.querySelectorAll('.sidebar-item');

    // Window Management Refs
    const macWindow = document.querySelector('.mac-window');
    const maximizeBtn = document.querySelector('.maximize-btn');
    const minimizeBtn = document.querySelector('.minimize-btn'); // Yellow button
    const titleBar = document.querySelector('.title-bar');

    // State
    let currentPath = 'root';
    let pathHistory = [];
    let currentFileId = null;
    let activeGame = null; // Track mounted game for cleanup

    // Window State
    let isMaximized = false;
    let isDragging = false;
    let dragStartX, dragStartY;
    let initialX = 0, initialY = 0;
    let currentX = 0, currentY = 0;

    // Language State
    let currentLanguage = 'es'; // 'es' or 'en'
    const langToggleBtn = document.getElementById('lang-toggle');

    // --- Loading Screen ---
    const scene = document.querySelector('a-scene');
    if (scene) {
        scene.addEventListener('loaded', () => {
            setTimeout(() => {
                loadingScreen.classList.add('fade-out');
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }, 1000);
        });
    }

    // --- Game Management ---
    function mountGame(gameId, containerEl) {
        destroyActiveGame();
        if (gameId === 'snake') {
            snakeGame.mount(containerEl);
            activeGame = snakeGame;
        }
    }

    function destroyActiveGame() {
        if (activeGame) {
            activeGame.destroy();
            activeGame = null;
        }
    }

    // --- Window Logic ---

    function openWindow(path, sourceElement = null) {
        if (path === 'settings') return;

        uiLayer.classList.remove('active');
        macWindow.classList.remove('active');

        if (sourceElement) {
            const rect = sourceElement.getBoundingClientRect();
            const sourceX = rect.left + rect.width / 2;
            const sourceY = rect.top + rect.height / 2;
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            const windowLeft = centerX - 410;
            const windowTop = centerY - 260;
            const relativeX = sourceX - windowLeft;
            const relativeY = sourceY - windowTop;
            macWindow.style.transformOrigin = `${relativeX}px ${relativeY}px`;
        } else {
            macWindow.style.transformOrigin = 'center center';
        }

        requestAnimationFrame(() => {
            uiLayer.classList.add('active');
            macWindow.classList.add('active');
            navigateTo(path);

            if (document.pointerLockElement) {
                document.exitPointerLock();
            }

            // Language Hint Logic
            if (!localStorage.getItem('langHintSeen')) {
                const langHint = document.getElementById('lang-hint');
                if (langHint && langToggleBtn) {
                    setTimeout(() => {
                        langHint.classList.add('show');
                        langToggleBtn.classList.add('highlight');
                    }, 600); // Aparece suavemente después de abrir la ventana
                }
            }
        });

        currentX = 0;
        currentY = 0;
        setTranslate(0, 0, macWindow);
    }

    function closeWindow() {
        audioManager.play('click', { volume: 0.4 });
        uiLayer.classList.remove('active');
        macWindow.classList.remove('active');
        previewPane.classList.remove('active');
        destroyActiveGame();

        if (isMaximized) {
            toggleMaximize();
        }

        const sceneEl = document.querySelector('a-scene');
        if (sceneEl) {
            sceneEl.canvas.requestPointerLock();
        }
    }

    document.getElementById('close-window').addEventListener('click', closeWindow);

    uiLayer.addEventListener('click', (e) => {
        if (e.target === uiLayer) {
            closeWindow();
        }
    });

    // Maximize (Green Button)
    maximizeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMaximize();
    });

    function toggleMaximize() {
        if (!isMaximized) {
            macWindow.classList.add('maximized');
            isMaximized = true;
        } else {
            macWindow.classList.remove('maximized');
            isMaximized = false;
            setTranslate(currentX, currentY, macWindow);
        }
    }

    // Minimize/Restore (Yellow Button)
    minimizeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isMaximized) {
            toggleMaximize();
        }
    });

    // Language Toggle
    if (langToggleBtn) {
        langToggleBtn.addEventListener('click', () => {
            currentLanguage = currentLanguage === 'es' ? 'en' : 'es';
            langToggleBtn.textContent = currentLanguage.toUpperCase();

            updateSidebar(currentPath);
            renderDirectory(currentPath);

            if (previewPane.classList.contains('active')) {
                if (currentFileId) {
                    renderPreview(currentFileId);
                }
            }

            // Hide hint if it's visible
            const langHint = document.getElementById('lang-hint');
            if (langHint) {
                langHint.classList.remove('show');
                langToggleBtn.classList.remove('highlight');
                localStorage.setItem('langHintSeen', 'true');
            }
        });
    }

    const closeLangHintBtn = document.getElementById('close-lang-hint');
    if (closeLangHintBtn) {
        closeLangHintBtn.addEventListener('click', () => {
            const langHint = document.getElementById('lang-hint');
            if (langHint) {
                langHint.classList.remove('show');
                langToggleBtn.classList.remove('highlight');
                localStorage.setItem('langHintSeen', 'true');
            }
        });
    }

    // Dragging Logic
    titleBar.addEventListener('mousedown', dragStart);
    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('mousemove', drag);

    function dragStart(e) {
        if (isMaximized) return;
        if (e.target.closest('.control-btn')) return;
        if (e.target.closest('.nav-btn')) return;

        initialX = e.clientX - currentX;
        initialY = e.clientY - currentY;

        if (e.target === titleBar || titleBar.contains(e.target)) {
            isDragging = true;
            titleBar.style.cursor = 'grabbing';
        }
    }

    function dragEnd(e) {
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
        titleBar.style.cursor = 'grab';
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            setTranslate(currentX, currentY, macWindow);
        }
    }

    function setTranslate(xPos, yPos, el) {
        el.style.transform = `translate(${xPos}px, ${yPos}px) scale(1)`;
    }


    // --- File System Navigation ---

    function navigateTo(pathId) {
        const node = fileSystem[pathId];

        if (!node) {
            console.error('Path not found:', pathId);
            return;
        }

        if (node.type === 'folder') {
            if (currentPath !== pathId) {
                if (pathHistory[pathHistory.length - 1] !== currentPath) {
                    pathHistory.push(currentPath);
                }
            }

            currentPath = pathId;
            destroyActiveGame(); // Clean up any game when navigating folders
            renderDirectory(pathId);
            updateSidebar(pathId);

            backBtn.style.opacity = pathHistory.length > 0 ? '1' : '0.3';
            backBtn.style.pointerEvents = pathHistory.length > 0 ? 'auto' : 'none';

        } else if (node.type === 'file' || node.type === 'game') {
            audioManager.play('click', { volume: 0.3 });
            renderPreview(pathId);
        }
    }

    function goBack() {
        if (pathHistory.length === 0) return;
        const prevPath = pathHistory.pop();
        currentPath = prevPath;
        destroyActiveGame();
        renderDirectory(prevPath);
        updateSidebar(prevPath);

        backBtn.style.opacity = pathHistory.length > 0 ? '1' : '0.3';
        backBtn.style.pointerEvents = pathHistory.length > 0 ? 'auto' : 'none';

        previewPane.classList.remove('active');
    }

    backBtn.addEventListener('click', goBack);

    // Sidebar Navigation
    sidebarItems.forEach(item => {
        item.addEventListener('click', () => {
            const path = item.getAttribute('data-path');
            pathHistory.push(currentPath);
            navigateTo(path);
        });
    });

    // --- Rendering ---

    function renderDirectory(pathId) {
        const contents = getFolderContents(pathId);
        const node = fileSystem[pathId];

        const folderName = currentLanguage === 'en' && node.nameEn ? node.nameEn : node.name;
        windowTitle.textContent = `Finder — ${folderName}`;
        finderContent.innerHTML = '';
        previewPane.classList.remove('active');
        currentFileId = null;
        destroyActiveGame();

        contents.forEach(item => {
            const el = document.createElement('div');
            el.className = 'file-item';
            const itemName = currentLanguage === 'en' && item.nameEn ? item.nameEn : item.name;

            // Choose icon class: game items get a special style
            const iconClass = item.type === 'game' ? 'file' : item.type;

            el.innerHTML = `
                <div class="material-symbols-outlined file-icon ${iconClass}">
                    ${item.icon || (item.type === 'folder' ? 'folder' : 'description')}
                </div>
                <div class="file-name">${itemName}</div>
            `;

            // Hover Sound
            el.addEventListener('mouseenter', () => {
                audioManager.play('hover', { volume: 0.2 });
            });

            // Single Click - Select
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                document.querySelectorAll('.file-item').forEach(i => i.classList.remove('selected'));
                el.classList.add('selected');

                if (item.type === 'file' || item.type === 'game') {
                    renderPreview(item.id);
                }
            });

            // Double Click - Open Folder
            el.addEventListener('dblclick', () => {
                if (item.type === 'folder') {
                    navigateTo(item.id);
                }
            });

            finderContent.appendChild(el);
        });
    }

    function updateSidebar(activePath) {
        sidebarItems.forEach(item => {
            const path = item.getAttribute('data-path');
            const node = fileSystem[path];

            if (node) {
                const itemName = currentLanguage === 'en' && node.nameEn ? node.nameEn : node.name;
                const iconSpan = item.querySelector('.material-symbols-outlined').outerHTML;
                item.innerHTML = `${iconSpan} ${itemName}`;
            }

            if (path === activePath) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    function renderPreview(fileId) {
        const file = getFileContent(fileId);
        if (!file) return;

        // Clear any active game before rendering new preview
        destroyActiveGame();

        currentFileId = fileId;
        previewPane.classList.add('active');

        const fileName = currentLanguage === 'en' && file.nameEn ? file.nameEn : file.name;
        const fileContent = currentLanguage === 'en' && file.contentEn ? file.contentEn : file.content;

        document.getElementById('preview-icon').textContent = file.icon || 'description';
        document.getElementById('preview-title').textContent = fileName;

        // Preview metadata
        const metaEl = document.getElementById('preview-meta');
        if (metaEl) {
            const typeLabel = file.type === 'game'
                ? (currentLanguage === 'en' ? 'Interactive Game' : 'Juego Interactivo')
                : (file.type === 'folder'
                    ? (currentLanguage === 'en' ? 'Folder' : 'Carpeta')
                    : (currentLanguage === 'en' ? 'Document' : 'Documento'));
            metaEl.textContent = typeLabel;
        }

        const contentEl = document.getElementById('preview-content');
        contentEl.innerHTML = fileContent;

        // If it's a game, mount the game canvas into the preview content
        if (file.type === 'game' && file.gameId) {
            mountGame(file.gameId, contentEl);
        }
    }

    // --- 3D Scene Interactions ---
    const crosshair = document.getElementById('crosshair');
    const clickables = document.querySelectorAll('.clickable');

    clickables.forEach(el => {
        el.addEventListener('click', function (evt) {
            const path = this.getAttribute('data-path');
            if (path) {
                if (path === 'settings') {
                    // Open Settings
                } else if (path === 'music-player') {
                    openMusicPlayer();
                } else if (path === 'arcade-system') {
                    openArcadeSystem();
                } else {
                    const anchorId = this.getAttribute('data-anchor');
                    if (anchorId) {
                        const anchorEl = document.getElementById(anchorId);
                        if (anchorEl) {
                            const pos = anchorEl.getAttribute('position');
                            const rot = anchorEl.getAttribute('rotation');
                            moveCameraTo(pos, rot, () => {
                                openWindow(path);
                            });
                        } else {
                            openWindow(path);
                        }
                    } else {
                        openWindow(path);
                    }
                }
            }
        });

        el.addEventListener('mouseenter', function () {
            audioManager.play('hover', { volume: 0.3 });

            const labelId = this.getAttribute('data-label');
            if (labelId) {
                const label = document.getElementById(labelId);
                if (label) label.setAttribute('visible', true);
            }

            if (!this.classList.contains('poster')) {
                if (this.components.material) {
                    this.setAttribute('material', 'emissive', '#333');
                } else {
                    this.object3D.traverse((node) => {
                        if (node.isMesh) {
                            node.userData.originalEmissive = node.userData.originalEmissive || node.material.emissive.clone();
                            node.material.emissive.setHex(0x333333);
                        }
                    });
                }
            }

            if (crosshair) crosshair.classList.add('active-hover');
        });

        el.addEventListener('mouseleave', function () {
            const labelId = this.getAttribute('data-label');
            if (labelId) {
                const label = document.getElementById(labelId);
                if (label) label.setAttribute('visible', false);
            }

            if (!this.classList.contains('poster')) {
                if (this.components.material) {
                    this.setAttribute('material', 'emissive', '#000');
                } else {
                    this.object3D.traverse((node) => {
                        if (node.isMesh && node.userData.originalEmissive) {
                            node.material.emissive.copy(node.userData.originalEmissive);
                        }
                    });
                }
            }

            if (crosshair) crosshair.classList.remove('active-hover');
        });
    });

    // --- OS Feel Logic ---

    // Dock Interactions
    document.querySelectorAll('.dock-item').forEach(item => {
        item.addEventListener('mouseenter', () => {
            audioManager.play('hover', { volume: 0.3, variation: 0.1 });
        });

        item.addEventListener('click', function () {
            const path = this.getAttribute('data-path');
            if (path) {
                if (path === 'settings') {
                    openSettings();
                    audioManager.play('click');
                } else {
                    openWindow(path, this);
                }
            }
        });
    });

    // --- Settings Logic ---
    function openSettings() {
        uiLayer.classList.add('active');
        settingsModal.classList.add('active');
    }

    function closeSettings() {
        settingsModal.classList.remove('active');
        uiLayer.classList.remove('active');
    }

    if (closeSettingsBtn) {
        closeSettingsBtn.addEventListener('click', closeSettings);
    }

    if (muteToggle) {
        muteToggle.addEventListener('change', (e) => {
            audioManager.toggleMute();
            if (audioManager.enabled) {
                audioManager.play('click');
            }
        });
    }

    // Notification System
    function showNotification(title, message, icon = 'info') {
        const container = document.getElementById('notification-area');
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <div class="toast-icon">
                <span class="material-symbols-outlined">${icon}</span>
            </div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
        `;

        toast.addEventListener('click', () => {
            toast.classList.add('hiding');
            setTimeout(() => toast.remove(), 400);
        });

        container.appendChild(toast);

        setTimeout(() => {
            if (toast.isConnected) {
                toast.classList.add('hiding');
                setTimeout(() => toast.remove(), 400);
            }
        }, 5000);
    }

    // Welcome Notification
    setTimeout(() => {
        showNotification('Bienvenido', 'Explora mi portfolio.', 'handshake');
    }, 2000);

    // Initial Render
    renderDirectory('root');

    // --- Music Player ---
    const musicPlayerOverlay = document.getElementById('music-player-overlay');
    const musicAudio = document.getElementById('music-audio');
    const musicPlayPauseBtn = document.getElementById('music-play-pause');
    const musicPlayIcon = document.getElementById('music-play-icon');
    const musicProgressFill = document.getElementById('music-progress-fill');
    const musicProgressBar = document.getElementById('music-progress-bar');
    const musicCurrentTime = document.getElementById('music-current-time');
    const musicDuration = document.getElementById('music-duration');
    const closeMusicPlayerBtn = document.getElementById('close-music-player');

    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    function openMusicPlayer() {
        musicPlayerOverlay.classList.add('active');
        if (document.pointerLockElement) {
            document.exitPointerLock();
        }
    }

    function closeMusicPlayer() {
        audioManager.play('click', { volume: 0.4 });
        musicPlayerOverlay.classList.remove('active');
        const sceneEl = document.querySelector('a-scene');
        if (sceneEl) {
            sceneEl.canvas.requestPointerLock();
        }
    }

    if (closeMusicPlayerBtn) {
        closeMusicPlayerBtn.addEventListener('click', closeMusicPlayer);
    }

    if (musicPlayerOverlay) {
        musicPlayerOverlay.addEventListener('click', (e) => {
            if (e.target === musicPlayerOverlay) {
                closeMusicPlayer();
            }
        });
    }

    // --- Arcade System Logic ---
    const arcadeOverlay = document.getElementById('arcade-ui-layer');
    const arcadeContent = document.getElementById('arcade-content');
    const closeArcadeBtn = document.getElementById('close-arcade');

    // --- Arcade Particle System ---
    let arcadeParticlesRAF = null;

    function startArcadeParticles() {
        const canvas = document.getElementById('arcade-particles-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const particles = [];
        const PARTICLE_COUNT = 60;

        function resize() {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                r: Math.random() * 1.5 + 0.3,
                dx: (Math.random() - 0.5) * 0.3,
                dy: -(Math.random() * 0.4 + 0.1),
                hue: [340, 50, 190, 270][Math.floor(Math.random() * 4)],
                alpha: Math.random() * 0.5 + 0.2
            });
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (const p of particles) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${p.hue}, 100%, 70%, ${p.alpha})`;
                ctx.shadowBlur = 8;
                ctx.shadowColor = `hsla(${p.hue}, 100%, 60%, 0.4)`;
                ctx.fill();

                p.x += p.dx;
                p.y += p.dy;
                if (p.y < -5) { p.y = canvas.height + 5; p.x = Math.random() * canvas.width; }
                if (p.x < -5 || p.x > canvas.width + 5) p.x = Math.random() * canvas.width;
            }
            arcadeParticlesRAF = requestAnimationFrame(draw);
        }
        draw();
    }

    function stopArcadeParticles() {
        if (arcadeParticlesRAF) {
            cancelAnimationFrame(arcadeParticlesRAF);
            arcadeParticlesRAF = null;
        }
    }

    function renderArcadeMenu() {
        arcadeContent.innerHTML = `
            <div class="arcade-menu">
                <div class="arcade-menu-kanji">ゲームセンター</div>
                <div class="arcade-menu-title" data-text="ARCADE ZONE">ARCADE ZONE</div>
                <div class="arcade-menu-subtitle">── SELECT YOUR GAME ──</div>
                <div class="arcade-menu-divider"></div>
                
                <div class="arcade-carousel-container">
                    <div class="arcade-nav-hint arcade-nav-left" id="arcade-nav-left">❮</div>
                    
                    <div class="arcade-carousel" id="arcade-carousel">
                        <div class="arcade-carousel-item" data-index="0" id="play-snake-card">
                            <div class="arcade-game-icon">🐍</div>
                            <div class="arcade-game-name">SNAKE</div>
                            <div class="arcade-game-desc">Classic retro survival — eat & grow</div>
                            <span class="arcade-game-tag playable">PLAY</span>
                        </div>
                        <div class="arcade-carousel-item" data-index="1" id="play-coming-soon-1">
                            <div class="arcade-game-icon">👾</div>
                            <div class="arcade-game-name">SPACE RAIDERS</div>
                            <div class="arcade-game-desc">Defend Earth from pixel invaders</div>
                            <span class="arcade-game-tag soon">SOON</span>
                        </div>
                        <div class="arcade-carousel-item" data-index="2" id="play-coming-soon-2">
                            <div class="arcade-game-icon">🏎️</div>
                            <div class="arcade-game-name">NEON DRIFT</div>
                            <div class="arcade-game-desc">Synthwave racing through the grid</div>
                            <span class="arcade-game-tag soon">SOON</span>
                        </div>
                    </div>
                    
                    <div class="arcade-nav-hint arcade-nav-right" id="arcade-nav-right">❯</div>
                </div>
            </div>
        `;

        const carouselItems = document.querySelectorAll('.arcade-carousel-item');
        let currentIndex = 0;

        function updateCarousel() {
            carouselItems.forEach((item, index) => {
                item.className = 'arcade-carousel-item'; // Reset classes
                if (index === currentIndex) {
                    item.classList.add('active');
                } else if (index === (currentIndex - 1 + carouselItems.length) % carouselItems.length) {
                    item.classList.add('prev');
                } else if (index === (currentIndex + 1) % carouselItems.length) {
                    item.classList.add('next');
                }
            });
        }

        // Initialize Carousel
        updateCarousel();

        // Event Listeners for Navigation
        document.getElementById('arcade-nav-left').addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + carouselItems.length) % carouselItems.length;
            audioManager.play('click', { volume: 0.2 });
            updateCarousel();
        });

        document.getElementById('arcade-nav-right').addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % carouselItems.length;
            audioManager.play('click', { volume: 0.2 });
            updateCarousel();
        });

        // Click on items to select or play
        carouselItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                if (index === currentIndex) {
                    // It's the active item, play it
                    if (item.id === 'play-snake-card') {
                        audioManager.play('click', { volume: 0.4 });
                        arcadeContent.innerHTML = '';
                        mountGame('snake', arcadeContent);
                    } else {
                        audioManager.play('error', { volume: 0.2 }); // optional, just to signify "coming soon"
                    }
                } else {
                    // Bring to front
                    currentIndex = index;
                    audioManager.play('click', { volume: 0.2 });
                    updateCarousel();
                }
            });
        });
    }

    function openArcadeSystem() {
        if (!arcadeOverlay) return;

        window.arcadeCurrentX = 0;
        window.arcadeCurrentY = 0;
        if (arcadeWindow) {
            arcadeWindow.style.transform = `translate(0px, 0px)`;
        }

        arcadeOverlay.classList.add('active');
        if (document.pointerLockElement) {
            document.exitPointerLock();
        }

        renderArcadeMenu();
        startArcadeParticles();
    }

    function closeArcadeSystem() {
        audioManager.play('click', { volume: 0.4 });
        if (arcadeOverlay) {
            arcadeOverlay.classList.remove('active');
        }
        destroyActiveGame();
        stopArcadeParticles();

        const sceneEl = document.querySelector('a-scene');
        if (sceneEl) {
            sceneEl.canvas.requestPointerLock();
        }
    }

    if (closeArcadeBtn) {
        closeArcadeBtn.addEventListener('click', closeArcadeSystem);
    }

    // --- Arcade Window Dragging Logic ---
    const arcadeTitleBar = document.querySelector('.arcade-header');
    const arcadeWindow = document.querySelector('.arcade-screen-container');
    let isArcadeDragging = false;
    let arcadeInitialX = 0, arcadeInitialY = 0;
    
    // Using globals: let arcadeCurrentX = 0, arcadeCurrentY = 0; already declared above or implicitly.
    // Actually wait, let's declare them here if they aren't declared, but I'll make sure they exist globally
    // for openArcadeSystem to reset them.
    window.arcadeCurrentX = window.arcadeCurrentX || 0;
    window.arcadeCurrentY = window.arcadeCurrentY || 0;

    if (arcadeTitleBar && arcadeWindow) {
        arcadeTitleBar.addEventListener('mousedown', (e) => {
            if (e.target.closest('.control-btn')) return;
            arcadeInitialX = e.clientX - window.arcadeCurrentX;
            arcadeInitialY = e.clientY - window.arcadeCurrentY;
            isArcadeDragging = true;
        });

        document.addEventListener('mouseup', () => {
            if (isArcadeDragging) {
                arcadeInitialX = window.arcadeCurrentX;
                arcadeInitialY = window.arcadeCurrentY;
                isArcadeDragging = false;
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (isArcadeDragging) {
                e.preventDefault();
                window.arcadeCurrentX = e.clientX - arcadeInitialX;
                window.arcadeCurrentY = e.clientY - arcadeInitialY;
                arcadeWindow.style.transform = `translate(${window.arcadeCurrentX}px, ${window.arcadeCurrentY}px)`;
            }
        });
    }

    if (musicPlayPauseBtn && musicAudio) {
        musicPlayPauseBtn.addEventListener('click', () => {
            if (musicAudio.paused) {
                musicAudio.play();
                musicPlayIcon.textContent = 'pause';
            } else {
                musicAudio.pause();
                musicPlayIcon.textContent = 'play_arrow';
            }
        });
    }

    if (musicAudio) {
        musicAudio.addEventListener('loadedmetadata', () => {
            musicDuration.textContent = formatTime(musicAudio.duration);
        });

        musicAudio.addEventListener('timeupdate', () => {
            if (musicAudio.duration) {
                const pct = (musicAudio.currentTime / musicAudio.duration) * 100;
                musicProgressFill.style.width = pct + '%';
                musicCurrentTime.textContent = formatTime(musicAudio.currentTime);
            }
        });

        musicAudio.addEventListener('ended', () => {
            musicPlayIcon.textContent = 'play_arrow';
            musicProgressFill.style.width = '0%';
            musicCurrentTime.textContent = '0:00';
        });
    }

    if (musicProgressBar && musicAudio) {
        musicProgressBar.addEventListener('click', (e) => {
            const rect = musicProgressBar.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            if (musicAudio.duration) {
                musicAudio.currentTime = pct * musicAudio.duration;
            }
        });
    }
});
