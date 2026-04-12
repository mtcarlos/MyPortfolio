import { registerCharacterController } from './components/character-controller.js';
import { registerCameraRig } from './components/camera-rig.js';
import { fileSystem, getFolderContents, getFileContent } from './filesystem.js';
import { audioManager } from './audio-manager.js';

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

    // --- Window Logic ---

    // Open Window with Animation from Source
    function openWindow(path, sourceElement = null) {
        if (path === 'settings') return; // Safety check: Settings should be handled separately

        audioManager.play('open', { volume: 0.6 });

        // 1. Reset State
        uiLayer.classList.remove('active');
        macWindow.classList.remove('active');

        // 2. Set Transform Origin based on source
        if (sourceElement) {
            const rect = sourceElement.getBoundingClientRect();
            const sourceX = rect.left + rect.width / 2;
            const sourceY = rect.top + rect.height / 2;

            // Window is centered. Center of screen:
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;

            // Window dimensions (approx 800x500 or 100% on mobile, but let's assume desktop for this effect)
            const windowLeft = centerX - 400;
            const windowTop = centerY - 250;

            const relativeX = sourceX - windowLeft;
            const relativeY = sourceY - windowTop;

            macWindow.style.transformOrigin = `${relativeX}px ${relativeY}px`;
        } else {
            macWindow.style.transformOrigin = 'center center';
        }

        // 3. Activate
        requestAnimationFrame(() => {
            uiLayer.classList.add('active');
            macWindow.classList.add('active');
            navigateTo(path);

            // Exit Pointer Lock so user can use mouse
            if (document.pointerLockElement) {
                document.exitPointerLock();
            }
        });

        // Reset translation (in case it was dragged)
        currentX = 0; // Using currentX/Y as per existing drag logic
        currentY = 0;
        setTranslate(0, 0, macWindow);
    }

    function closeWindow() {
        audioManager.play('click', { volume: 0.4 });
        uiLayer.classList.remove('active');
        macWindow.classList.remove('active');
        previewPane.classList.remove('active');

        // Optional: Restore window size when closing if it was maximized
        if (isMaximized) {
            toggleMaximize();
        }

        // Request Pointer Lock to return to game
        const sceneEl = document.querySelector('a-scene');
        if (sceneEl) {
            sceneEl.canvas.requestPointerLock();
        }
    }

    document.getElementById('close-window').addEventListener('click', closeWindow);

    // Close when clicking outside window
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
            // Ensure we keep the last dragged position
            setTranslate(currentX, currentY, macWindow);
        }
    }

    // Minimize/Restore (Yellow Button)
    minimizeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isMaximized) {
            toggleMaximize(); // Restore to normal size
        }
    });

    // Language Toggle
    if (langToggleBtn) {
        langToggleBtn.addEventListener('click', () => {
            currentLanguage = currentLanguage === 'es' ? 'en' : 'es';
            langToggleBtn.textContent = currentLanguage.toUpperCase();

            // Re-render
            updateSidebar(currentPath); // Update sidebar text
            renderDirectory(currentPath); // Update file list

            // If preview is open, re-render preview
            if (previewPane.classList.contains('active')) {
                // Find currently selected file
                const selected = document.querySelector('.file-item.selected');
                if (selected) {
                    // Logic to find file ID from DOM or state would be needed, 
                    // but simpler to just close preview or implement "currentFileId" state.
                    // Let's add currentFileId state for better UX
                    if (currentFileId) {
                        renderPreview(currentFileId);
                    }
                }
            }
        });
    }

    // Dragging Logic
    titleBar.addEventListener('mousedown', dragStart);
    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('mousemove', drag);

    function dragStart(e) {
        // Prevent dragging if maximized or if clicking buttons
        if (isMaximized) return;
        if (e.target.closest('.control-btn')) return;

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

            // Calculate new position
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            setTranslate(currentX, currentY, macWindow);
        }
    }

    function setTranslate(xPos, yPos, el) {
        // We use translate instead of top/left to be more performant and work with scale
        // scale(1) used in .active state
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
            renderDirectory(pathId);
            updateSidebar(pathId);

            backBtn.style.opacity = pathHistory.length > 0 ? '1' : '0.3';
            backBtn.style.pointerEvents = pathHistory.length > 0 ? 'auto' : 'none';

        } else if (node.type === 'file') {
            audioManager.play('click', { volume: 0.3 });
            renderPreview(pathId);
        }
    }

    function goBack() {
        if (pathHistory.length === 0) return;
        const prevPath = pathHistory.pop();
        currentPath = prevPath;
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
        windowTitle.textContent = `Finder - ${folderName}`;
        finderContent.innerHTML = '';
        previewPane.classList.remove('active');
        currentFileId = null;

        contents.forEach(item => {
            const el = document.createElement('div');
            el.className = 'file-item';
            const itemName = currentLanguage === 'en' && item.nameEn ? item.nameEn : item.name;

            el.innerHTML = `
                <div class="material-symbols-outlined file-icon ${item.type}">
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

                if (item.type === 'file') {
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

            // Update Text
            if (node) {
                const itemName = currentLanguage === 'en' && node.nameEn ? node.nameEn : node.name;
                // Preserve Icon
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

        currentFileId = fileId;
        previewPane.classList.add('active');

        const fileName = currentLanguage === 'en' && file.nameEn ? file.nameEn : file.name;
        const fileContent = currentLanguage === 'en' && file.contentEn ? file.contentEn : file.content;

        document.getElementById('preview-icon').textContent = file.icon || 'description';
        document.getElementById('preview-title').textContent = fileName;
        document.getElementById('preview-content').innerHTML = fileContent;
    }

    // --- 3D Scene Interactions ---
    const crosshair = document.getElementById('crosshair');
    const clickables = document.querySelectorAll('.clickable');

    clickables.forEach(el => {
        el.addEventListener('click', function (evt) {
            const path = this.getAttribute('data-path');
            if (path) {
                if (path === 'settings') {
                    // Open Settings (Simulated)
                } else {
                    // Trigger Cinematic Transition if available, else open window
                    const anchorId = this.getAttribute('data-anchor');
                    if (anchorId) {
                        const anchorEl = document.getElementById(anchorId);
                        if (anchorEl) {
                            // Get world position/rotation of anchor
                            // Since anchors are likely children of scene (world space), getAttribute is fine.
                            const pos = anchorEl.getAttribute('position');
                            const rot = anchorEl.getAttribute('rotation');

                            moveCameraTo(pos, rot, () => {
                                openWindow(path);
                            });
                        } else {
                            openWindow(path);
                        }
                    } else {
                        // Fallback
                        openWindow(path);
                    }
                }
            }
        });

        el.addEventListener('mouseenter', function () {
            audioManager.play('hover', { volume: 0.3 });

            // Visual feedback on Object
            // this.setAttribute('scale', { x: 1.1, y: 1.1, z: 1.1 }); // Removed scaling

            // Show Label if exists
            const labelId = this.getAttribute('data-label');
            if (labelId) {
                const label = document.getElementById(labelId);
                if (label) label.setAttribute('visible', true);
            }

            if (this.components.material) {
                this.setAttribute('material', 'emissive', '#333');
            } else {
                // For GLTF models, we might need to traverse, but simple alternative:
                // Add a light or rely on the label.
                this.object3D.traverse((node) => {
                    if (node.isMesh) {
                        node.userData.originalEmissive = node.userData.originalEmissive || node.material.emissive.clone();
                        node.material.emissive.setHex(0x333333);
                    }
                });
            }

            // Visual feedback on Cursor
            if (crosshair) crosshair.classList.add('active-hover');
        });

        el.addEventListener('mouseleave', function () {
            // Reset Object
            // this.setAttribute('scale', { x: 1, y: 1, z: 1 }); // Removed scaling

            // Hide Label if exists
            const labelId = this.getAttribute('data-label');
            if (labelId) {
                const label = document.getElementById(labelId);
                if (label) label.setAttribute('visible', false);
            }

            if (this.components.material) {
                this.setAttribute('material', 'emissive', '#000');
            } else {
                // Reset GLTF emissive
                this.object3D.traverse((node) => {
                    if (node.isMesh && node.userData.originalEmissive) {
                        node.material.emissive.copy(node.userData.originalEmissive);
                    }
                });
            }

            // Reset Cursor
            if (crosshair) crosshair.classList.remove('active-hover');
        });
    });

    // --- OS Feel Logic ---

    // Dock Toggle Logic Removed (CSS Hover used instead)

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

        // Auto remove after 5s
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
});
