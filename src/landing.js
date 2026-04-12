/**
 * Landing Timeline Engine v3 — Cinematic Boot Sequence
 * 
 * Orchestrates the entire landing page experience:
 * Particle materialization → Per-letter name reveal → Typewriter subtitle
 * → Click to continue → Window ascent with 3D rotation → Typing boot sequence
 * with timestamps & checkmarks → SVG checkmark ready state → Launch warp
 * 
 * Also manages: draggable window, cursor trail system, live clock
 */

import { LandingBackground } from './landing-bg.js';
import { LandingAudio } from './landing-audio.js';

// Boot sequence lines
const BOOT_LINES = [
    { text: 'Initializing system kernel...', delay: 300 },
    { text: 'Loading portfolio metadata...', delay: 250 },
    { text: 'Mounting 3D environment...', delay: 400 },
    { text: 'Compiling shader programs...', delay: 200 },
    { text: 'Establishing WebGL context...', delay: 300 },
    { text: 'Indexing project archives...', delay: 250 },
    { text: 'Calibrating spatial audio...', delay: 200 },
    { text: 'System ready.', delay: 0 },
];

const SUBTITLE_TEXT = 'Telecommunications Engineer';

export class LandingTimeline {
    constructor() {
        this.bg = null;
        this.audio = new LandingAudio();
        this.isSkipped = false;
        this.isComplete = false;
        this.hasTriggered = false;
        this.timeouts = [];

        this._init();
    }

    _init() {
        // Initialize Three.js background
        const canvas = document.getElementById('bg-canvas');
        if (canvas) {
            try {
                this.bg = new LandingBackground(canvas);
            } catch (e) {
                console.warn('WebGL not available, falling back to CSS background');
            }
        }

        // Audio toggle button
        const audioBtn = document.getElementById('audio-toggle');
        if (audioBtn) {
            audioBtn.addEventListener('click', () => {
                const enabled = this.audio.toggle();
                audioBtn.querySelector('.material-symbols-outlined').textContent =
                    enabled ? 'volume_up' : 'volume_off';
                audioBtn.classList.toggle('active', enabled);
                if (enabled) {
                    this.audio.startDrone();
                }
            });
        }

        // Interaction handler — first click continues, second click skips
        this._interactionHandler = (e) => {
            if (e.target.closest('.launch-btn') ||
                e.target.closest('.launch-btn-wrapper') ||
                e.target.closest('#audio-toggle')) return;

            if (!this.hasTriggered) {
                this.hasTriggered = true;
                this._resumeSequence();
            } else if (!this.isSkipped && !this.isComplete) {
                this._skipToEnd();
            }
        };

        // Prepare per-letter hero name
        this._prepareHeroName();

        // Mark body as loaded for CSS transitions
        document.body.classList.add('loaded');

        // Start the timeline
        this._startSequence();
    }

    /**
     * Split hero name into individual letter spans for stagger animation
     */
    _prepareHeroName() {
        const heroName = document.getElementById('hero-name');
        if (!heroName) return;

        const text = heroName.textContent;
        heroName.innerHTML = '';

        text.split('').forEach((char, i) => {
            const span = document.createElement('span');
            if (char === ' ') {
                span.className = 'letter space';
                span.innerHTML = '&nbsp;';
            } else {
                span.className = 'letter';
                span.textContent = char;
            }
            span.style.transitionDelay = `${i * 0.05}s`;
            heroName.appendChild(span);
        });
    }

    _schedule(fn, delay) {
        const id = setTimeout(() => {
            if (!this.isSkipped) fn();
        }, delay);
        this.timeouts.push(id);
        return id;
    }

    // ========================================
    // PHASE 1 & 2: Hero Name + Subtitle
    // ========================================

    _startSequence() {
        const heroName = document.getElementById('hero-name');
        const heroLine = document.getElementById('hero-line');
        const heroSub = document.getElementById('hero-subtitle');
        const skipHint = document.getElementById('skip-hint');

        // Phase 1: Per-letter name reveal (1s)
        this._schedule(() => {
            if (heroName) {
                heroName.querySelectorAll('.letter').forEach(l => l.classList.add('visible'));
            }
        }, 1000);

        // Decorative line extends (1.5s)
        this._schedule(() => {
            if (heroLine) heroLine.classList.add('visible');
        }, 1500);

        // Phase 2: Typewriter subtitle (2.2s)
        this._schedule(() => {
            this._typewriterSubtitle(heroSub);
        }, 2200);

        // Show "click to continue" hint + enable interaction (3.5s)
        this._schedule(() => {
            if (skipHint) skipHint.classList.add('visible');
            document.addEventListener('click', this._interactionHandler);
            document.addEventListener('keydown', this._interactionHandler);
        }, 3500);
    }

    /**
     * Typewriter effect for the subtitle
     */
    _typewriterSubtitle(element) {
        if (!element) return;

        element.innerHTML = '<span class="typewriter-cursor"></span>';
        let charIndex = 0;
        const cursor = element.querySelector('.typewriter-cursor');

        const typeChar = () => {
            if (this.isSkipped || charIndex >= SUBTITLE_TEXT.length) {
                if (charIndex >= SUBTITLE_TEXT.length && cursor) {
                    // Keep cursor blinking briefly, then hide
                    const tid = setTimeout(() => {
                        if (cursor && cursor.parentNode) cursor.style.display = 'none';
                    }, 2000);
                    this.timeouts.push(tid);
                }
                return;
            }

            const textNode = document.createTextNode(SUBTITLE_TEXT[charIndex]);
            element.insertBefore(textNode, cursor);
            charIndex++;

            const delay = 40 + Math.random() * 30;
            const tid = setTimeout(typeChar, delay);
            this.timeouts.push(tid);
        };

        typeChar();
    }

    // ========================================
    // PHASE 3 & 4: Window + Boot Sequence
    // ========================================

    _resumeSequence() {
        const heroOverlay = document.getElementById('hero-overlay');
        const window_ = document.getElementById('setup-window');
        const skipHint = document.getElementById('skip-hint');
        const bootLog = document.getElementById('boot-log');
        const progressBar = document.getElementById('boot-progress-fill');
        const readyState = document.getElementById('ready-state');
        const bootSection = document.getElementById('boot-section');

        // Phase 3: Hero fades out
        if (heroOverlay) heroOverlay.classList.add('fade-out');

        // Update hint to "click to skip"
        if (skipHint) {
            skipHint.classList.remove('visible');
            setTimeout(() => {
                if (!this.isSkipped && !this.isComplete) {
                    const textSpan = skipHint.querySelector('span:first-child');
                    if (textSpan) textSpan.textContent = 'click to skip';
                    skipHint.classList.add('visible');
                }
            }, 800);
        }

        // Window appears with 3D entrance
        this._schedule(() => {
            if (window_) window_.classList.add('active');
            this._setupDraggable();
        }, 700);

        // Phase 4: Boot sequence starts after window settles
        this._schedule(() => {
            this._runBootSequence(bootLog, progressBar, bootSection, readyState, skipHint);
        }, 1400);
    }

    /**
     * Run boot lines sequentially with typing effect
     */
    _runBootSequence(bootLog, progressBar, bootSection, readyState, skipHint) {
        let lineIndex = 0;

        const processNextLine = () => {
            if (this.isSkipped || lineIndex >= BOOT_LINES.length) return;

            const line = BOOT_LINES[lineIndex];
            const currentIndex = lineIndex;
            lineIndex++;

            this._typeBootLine(bootLog, line, currentIndex, BOOT_LINES.length, progressBar, () => {
                if (currentIndex === BOOT_LINES.length - 1) {
                    // Last line — transition to ready state
                    this._schedule(() => {
                        this.audio.playChime();
                        if (bootSection) bootSection.classList.add('complete');
                        if (readyState) readyState.classList.add('visible');
                        if (skipHint) skipHint.classList.remove('visible');
                        this.isComplete = true;
                        document.removeEventListener('click', this._interactionHandler);
                        document.removeEventListener('keydown', this._interactionHandler);
                    }, 800);
                } else {
                    // Schedule next line after delay
                    this._schedule(processNextLine, line.delay);
                }
            });
        };

        processNextLine();
    }

    /**
     * Type a single boot line character by character with timestamp and checkmark
     */
    _typeBootLine(bootLog, line, index, totalLines, progressBar, callback) {
        if (!bootLog || this.isSkipped) {
            if (callback) callback();
            return;
        }

        // Generate timestamp
        const now = new Date();
        const ts = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(now.getMilliseconds()).padStart(3, '0')}`;

        // Build line structure
        const lineEl = document.createElement('div');
        lineEl.className = 'boot-line visible';

        const timestampEl = document.createElement('span');
        timestampEl.className = 'boot-timestamp';
        timestampEl.textContent = `[${ts}]`;

        const prefixEl = document.createElement('span');
        prefixEl.className = 'boot-prefix';
        prefixEl.textContent = '▸';

        const textEl = document.createElement('span');
        textEl.className = 'boot-text typing';

        const statusEl = document.createElement('span');
        statusEl.className = 'boot-status';
        statusEl.textContent = '✓';

        lineEl.appendChild(timestampEl);
        lineEl.appendChild(prefixEl);
        lineEl.appendChild(textEl);
        lineEl.appendChild(statusEl);
        bootLog.appendChild(lineEl);

        // Play initial tick
        this.audio.playTick();

        // Type characters one by one
        let charIndex = 0;

        const typeChar = () => {
            if (this.isSkipped) return;

            if (charIndex < line.text.length) {
                textEl.textContent += line.text[charIndex];
                charIndex++;

                // Play keystroke sound every 2 chars (performance)
                if (charIndex % 2 === 0) this.audio.playKeystroke();

                const delay = 12 + Math.random() * 18;
                const tid = setTimeout(typeChar, delay);
                this.timeouts.push(tid);
            } else {
                // Typing complete — show checkmark
                textEl.classList.remove('typing');
                statusEl.classList.add('visible');

                // Update progress bar
                const progress = (index + 1) / totalLines;
                if (progressBar) progressBar.style.width = `${progress * 100}%`;

                if (callback) callback();
            }
        };

        typeChar();
    }

    // ========================================
    // DRAGGABLE WINDOW
    // ========================================

    _setupDraggable() {
        const titleBar = document.getElementById('title-bar');
        const window_ = document.getElementById('setup-window');
        if (!titleBar || !window_) return;

        let isDragging = false;
        let dragOffsetX = 0;
        let dragOffsetY = 0;

        titleBar.addEventListener('mousedown', (e) => {
            if (e.target.closest('.control-btn')) return;
            isDragging = true;
            window_.style.transition = 'none';
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            dragOffsetX += e.movementX;
            dragOffsetY += e.movementY;
            window_.style.transform = `translate(calc(-50% + ${dragOffsetX}px), calc(-50% + ${dragOffsetY}px)) scale(1)`;
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                // Restore smooth transition for future animations
                window_.style.transition = 'transform 0.3s var(--ease-out)';
            }
        });
    }

    // ========================================
    // SKIP TO END
    // ========================================

    _skipToEnd() {
        this.isSkipped = true;

        // Clear all pending timeouts
        this.timeouts.forEach(id => clearTimeout(id));
        this.timeouts = [];

        const heroOverlay = document.getElementById('hero-overlay');
        const window_ = document.getElementById('setup-window');
        const skipHint = document.getElementById('skip-hint');
        const bootLog = document.getElementById('boot-log');
        const progressBar = document.getElementById('boot-progress-fill');
        const readyState = document.getElementById('ready-state');
        const bootSection = document.getElementById('boot-section');
        const heroSub = document.getElementById('hero-subtitle');

        // Hide hero immediately
        if (heroOverlay) {
            heroOverlay.style.transition = 'opacity 0.3s ease';
            heroOverlay.classList.add('fade-out');
        }
        if (skipHint) skipHint.classList.remove('visible');

        // Fill subtitle instantly
        if (heroSub) {
            heroSub.innerHTML = SUBTITLE_TEXT;
        }

        // Show window with full boot log
        setTimeout(() => {
            if (window_) {
                window_.classList.add('active');
                this._setupDraggable();
            }

            // Populate all boot lines instantly
            if (bootLog) {
                bootLog.innerHTML = '';
                const now = new Date();
                BOOT_LINES.forEach((line, i) => {
                    const ms = Math.min(999, now.getMilliseconds() + i * 47);
                    const ts = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;

                    const lineEl = document.createElement('div');
                    lineEl.className = 'boot-line visible';
                    lineEl.innerHTML = `
                        <span class="boot-timestamp">[${ts}]</span>
                        <span class="boot-prefix">▸</span>
                        <span class="boot-text">${line.text}</span>
                        <span class="boot-status visible">✓</span>
                    `;
                    bootLog.appendChild(lineEl);
                });
            }

            // Fill progress
            if (progressBar) progressBar.style.width = '100%';

            // Show ready state
            setTimeout(() => {
                if (bootSection) bootSection.classList.add('complete');
                if (readyState) readyState.classList.add('visible');
                this.isComplete = true;
                document.removeEventListener('click', this._interactionHandler);
                document.removeEventListener('keydown', this._interactionHandler);
            }, 400);
        }, 350);
    }

    // ========================================
    // LAUNCH BUTTON
    // ========================================

    setupLaunchButton() {
        const launchBtn = document.querySelector('.launch-btn');
        if (!launchBtn) return;

        // Magnetic hover effect
        launchBtn.addEventListener('mousemove', (e) => {
            const rect = launchBtn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            launchBtn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
        });

        launchBtn.addEventListener('mouseleave', () => {
            launchBtn.style.transform = 'translate(0, 0)';
            launchBtn.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)';
        });

        launchBtn.addEventListener('mouseenter', () => {
            launchBtn.style.transition = 'none';
            this.audio.playHover();
        });

        // Launch click — cinematic warp transition
        launchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.audio.playLaunch();

            // Trigger particle warp
            if (this.bg) this.bg.triggerLaunch();

            // Window dissolves with blur
            const window_ = document.getElementById('setup-window');
            if (window_) {
                window_.style.transition = 'opacity 0.6s ease, transform 0.6s ease, filter 0.6s ease';
                window_.style.opacity = '0';
                window_.style.filter = 'blur(8px)';

                const currentTransform = window_.style.transform || 'translate(-50%, -50%) scale(1)';
                window_.style.transform = currentTransform.replace('scale(1)', 'scale(0.95)');
            }

            // White flash → black fade
            const flash = document.createElement('div');
            flash.style.cssText = `
                position: fixed; inset: 0; z-index: 10000;
                background: white; opacity: 0;
                transition: opacity 0.15s ease;
            `;
            document.body.appendChild(flash);

            setTimeout(() => {
                flash.style.opacity = '0.12';
                setTimeout(() => {
                    flash.style.background = '#08080a';
                    flash.style.transition = 'opacity 0.5s ease';
                    flash.style.opacity = '1';
                }, 200);
            }, 300);

            setTimeout(() => {
                window.location.href = 'scene.html';
            }, 1000);
        });
    }

    destroy() {
        this.timeouts.forEach(id => clearTimeout(id));
        if (this.bg) this.bg.destroy();
        this.audio.destroy();
        document.removeEventListener('click', this._interactionHandler);
        document.removeEventListener('keydown', this._interactionHandler);
    }
}

// ========================================
// CURSOR SYSTEM — Spring Physics + Trail
// ========================================

class CursorSystem {
    constructor() {
        this.cursor = document.getElementById('custom-cursor');
        this.glow = document.getElementById('cursor-glow');
        if (!this.cursor) return;

        this.mouseX = 0;
        this.mouseY = 0;
        this.cursorX = 0;
        this.cursorY = 0;

        // Create trail elements
        this.TRAIL_COUNT = 4;
        this.trails = [];
        for (let i = 0; i < this.TRAIL_COUNT; i++) {
            const trail = document.createElement('div');
            trail.className = 'cursor-trail';
            trail.style.opacity = 0.2 - i * 0.04;
            trail.style.width = (5 - i * 0.8) + 'px';
            trail.style.height = (5 - i * 0.8) + 'px';
            document.body.appendChild(trail);
            this.trails.push({ el: trail, x: 0, y: 0 });
        }

        this._bindEvents();
        this._animate();
    }

    _bindEvents() {
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });

        // Hover effects on interactive elements
        const hoverables = document.querySelectorAll(
            'a, button, .launch-btn, .launch-btn-wrapper, #audio-toggle, .control-btn'
        );
        hoverables.forEach(el => {
            el.addEventListener('mouseenter', () => this.cursor.classList.add('hover'));
            el.addEventListener('mouseleave', () => this.cursor.classList.remove('hover'));
        });
    }

    _animate() {
        // Spring physics for main cursor (lerp)
        this.cursorX += (this.mouseX - this.cursorX) * 0.18;
        this.cursorY += (this.mouseY - this.cursorY) * 0.18;

        if (this.cursor) {
            this.cursor.style.left = this.cursorX + 'px';
            this.cursor.style.top = this.cursorY + 'px';
        }

        if (this.glow) {
            this.glow.style.left = this.cursorX + 'px';
            this.glow.style.top = this.cursorY + 'px';
        }

        // Trail with cascading lag
        this.trails.forEach((t, i) => {
            const target = i === 0
                ? { x: this.cursorX, y: this.cursorY }
                : this.trails[i - 1];
            const lerp = 0.12 - i * 0.02;
            t.x += (target.x - t.x) * lerp;
            t.y += (target.y - t.y) * lerp;
            t.el.style.left = t.x + 'px';
            t.el.style.top = t.y + 'px';
        });

        requestAnimationFrame(() => this._animate());
    }
}

// ========================================
// LIVE CLOCK
// ========================================

function startClock() {
    const clockEl = document.getElementById('live-clock');
    if (!clockEl) return;

    const update = () => {
        const now = new Date();
        clockEl.textContent = now.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    update();
    setInterval(update, 1000);
}

// ========================================
// AUTO-INITIALIZE
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    const timeline = new LandingTimeline();
    timeline.setupLaunchButton();

    new CursorSystem();
    startClock();
});
