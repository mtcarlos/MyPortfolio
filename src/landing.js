/**
 * Landing Timeline Engine — Unified OS Boot Sequence
 * 
 * Orchestrates: Scramble name reveal → Subtitle fade → Click → 
 * Window boot sequence → Ready state → Clean fade transition
 * 
 * Also manages: draggable window, minimal cursor, live clock
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

// Characters used in the scramble effect — clean monospace aesthetic
const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&';

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

        // Audio toggle
        const audioBtn = document.getElementById('audio-toggle');
        if (audioBtn) {
            audioBtn.addEventListener('click', () => {
                const enabled = this.audio.toggle();
                audioBtn.querySelector('.material-symbols-outlined').textContent =
                    enabled ? 'volume_up' : 'volume_off';
                audioBtn.classList.toggle('active', enabled);
            });
        }

        // Interaction handler
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

        // Prepare hero name for scramble effect
        this._prepareHeroName();

        // Mark body as loaded
        document.body.classList.add('loaded');

        // Start the timeline
        this._startSequence();
    }

    /**
     * Split hero name into individual letter spans for scramble animation
     */
    _prepareHeroName() {
        const heroName = document.getElementById('hero-name');
        if (!heroName) return;

        const text = heroName.textContent;
        heroName.innerHTML = '';

        this.letterSpans = [];

        text.split('').forEach((char, i) => {
            const span = document.createElement('span');
            if (char === ' ') {
                span.className = 'letter space';
                span.innerHTML = '&nbsp;';
            } else {
                span.className = 'letter';
                span.textContent = char;
            }
            heroName.appendChild(span);
            this.letterSpans.push({ el: span, char, index: i, isSpace: char === ' ' });
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
    // PHASE 1: Scramble Name Reveal
    // ========================================

    _startSequence() {
        // Phase 1: Scramble name reveal after a brief pause
        this._schedule(() => {
            this._scrambleReveal();
        }, 600);
    }

    /**
     * Scramble reveal effect — each letter cycles through random characters
     * before settling on the correct one, staggered across the name.
     * Inspired by terminal/hacker aesthetics but with Apple cleanliness.
     */
    _scrambleReveal() {
        const heroName = document.getElementById('hero-name');
        if (!heroName || !this.letterSpans) return;

        const letters = this.letterSpans.filter(l => !l.isSpace);
        const totalLetters = letters.length;

        // Make spaces visible immediately
        this.letterSpans.filter(l => l.isSpace).forEach(l => {
            l.el.classList.add('revealed');
        });

        // Stagger reveal: each letter starts scrambling with a delay
        const staggerDelay = 50; // ms between each letter starting
        const scrambleDuration = 600; // ms each letter scrambles before settling
        const scrambleInterval = 40; // ms between character changes

        letters.forEach((letter, i) => {
            const startTime = i * staggerDelay;

            this._schedule(() => {
                letter.el.style.opacity = '1';
                letter.el.classList.add('scrambling');

                // Start cycling random characters
                let elapsed = 0;
                const cycleId = setInterval(() => {
                    if (this.isSkipped) {
                        clearInterval(cycleId);
                        return;
                    }

                    elapsed += scrambleInterval;

                    // As we get closer to the end, increase chance of showing correct char
                    const progress = elapsed / scrambleDuration;

                    if (progress >= 1) {
                        // Settle on correct character
                        clearInterval(cycleId);
                        letter.el.textContent = letter.char;
                        letter.el.classList.remove('scrambling');
                        letter.el.classList.add('revealed');

                        // Play subtle tick for settle
                        this.audio.playTick();
                    } else {
                        // Show random character — towards the end, bias towards correct char
                        if (Math.random() < progress * 0.4) {
                            letter.el.textContent = letter.char;
                        } else {
                            letter.el.textContent = SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
                        }
                    }
                }, scrambleInterval);

                this.timeouts.push(cycleId);
            }, startTime);
        });

        // After all letters revealed, show line and subtitle
        const totalRevealTime = totalLetters * staggerDelay + scrambleDuration + 200;

        this._schedule(() => {
            const heroLine = document.getElementById('hero-line');
            if (heroLine) heroLine.classList.add('visible');
        }, totalRevealTime);

        this._schedule(() => {
            const subtitle = document.getElementById('hero-subtitle');
            if (subtitle) {
                subtitle.textContent = SUBTITLE_TEXT;
                subtitle.classList.add('visible');
            }
        }, totalRevealTime + 500);

        this._schedule(() => {
            const skipHint = document.getElementById('skip-hint');
            if (skipHint) skipHint.classList.add('visible');
            document.addEventListener('click', this._interactionHandler);
            document.addEventListener('keydown', this._interactionHandler);
        }, totalRevealTime + 1200);
    }

    // ========================================
    // PHASE 2 & 3: Window + Boot Sequence
    // ========================================

    _resumeSequence() {
        const heroOverlay = document.getElementById('hero-overlay');
        const window_ = document.getElementById('setup-window');
        const skipHint = document.getElementById('skip-hint');
        const bootLog = document.getElementById('boot-log');
        const progressBar = document.getElementById('boot-progress-fill');
        const readyState = document.getElementById('ready-state');
        const bootSection = document.getElementById('boot-section');

        // Hero fades out
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

        // Window appears
        this._schedule(() => {
            if (window_) window_.classList.add('active');
            this._setupDraggable();
        }, 700);

        // Boot sequence starts after window settles
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
                    this._schedule(processNextLine, line.delay);
                }
            });
        };

        processNextLine();
    }

    /**
     * Type a single boot line character by character
     */
    _typeBootLine(bootLog, line, index, totalLines, progressBar, callback) {
        if (!bootLog || this.isSkipped) {
            if (callback) callback();
            return;
        }

        const now = new Date();
        const ts = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(now.getMilliseconds()).padStart(3, '0')}`;

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

        this.audio.playTick();

        let charIndex = 0;

        const typeChar = () => {
            if (this.isSkipped) return;

            if (charIndex < line.text.length) {
                textEl.textContent += line.text[charIndex];
                charIndex++;

                if (charIndex % 2 === 0) this.audio.playKeystroke();

                const delay = 12 + Math.random() * 18;
                const tid = setTimeout(typeChar, delay);
                this.timeouts.push(tid);
            } else {
                textEl.classList.remove('typing');
                statusEl.classList.add('visible');

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
                window_.style.transition = 'transform 0.3s ease';
            }
        });
    }

    // ========================================
    // SKIP TO END
    // ========================================

    _skipToEnd() {
        this.isSkipped = true;

        // Clear all pending timeouts/intervals
        this.timeouts.forEach(id => {
            clearTimeout(id);
            clearInterval(id);
        });
        this.timeouts = [];

        // Place all letters instantly
        if (this.letterSpans) {
            this.letterSpans.forEach(l => {
                l.el.textContent = l.isSpace ? '\u00A0' : l.char;
                l.el.style.opacity = '1';
                l.el.classList.remove('scrambling');
                l.el.classList.add('revealed');
            });
        }

        const heroOverlay = document.getElementById('hero-overlay');
        const window_ = document.getElementById('setup-window');
        const skipHint = document.getElementById('skip-hint');
        const bootLog = document.getElementById('boot-log');
        const progressBar = document.getElementById('boot-progress-fill');
        const readyState = document.getElementById('ready-state');
        const bootSection = document.getElementById('boot-section');
        const heroSub = document.getElementById('hero-subtitle');
        const heroLine = document.getElementById('hero-line');

        // Hide hero immediately
        if (heroOverlay) {
            heroOverlay.style.transition = 'opacity 0.3s ease';
            heroOverlay.classList.add('fade-out');
        }
        if (skipHint) skipHint.classList.remove('visible');
        if (heroSub) {
            heroSub.textContent = SUBTITLE_TEXT;
            heroSub.classList.add('visible');
        }
        if (heroLine) heroLine.classList.add('visible');

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

            if (progressBar) progressBar.style.width = '100%';

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
    // LAUNCH BUTTON — Clean fade transition
    // ========================================

    setupLaunchButton() {
        const launchBtn = document.querySelector('.launch-btn');
        if (!launchBtn) return;

        // Subtle magnetic hover
        launchBtn.addEventListener('mousemove', (e) => {
            const rect = launchBtn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            launchBtn.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px) scale(1.06)`;
        });

        launchBtn.addEventListener('mouseleave', () => {
            launchBtn.style.transform = '';
            launchBtn.style.transition = 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
        });

        launchBtn.addEventListener('mouseenter', () => {
            launchBtn.style.transition = 'none';
            this.audio.playHover();
        });

        // Launch — clean fade to black
        launchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.audio.playTick();

            // Fade the window out
            const window_ = document.getElementById('setup-window');
            if (window_) {
                window_.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                window_.style.opacity = '0';
                window_.style.transform = window_.style.transform.replace('scale(1)', 'scale(0.97)');
            }

            // Fade overlay to black
            const overlay = document.getElementById('transition-overlay');
            if (overlay) {
                setTimeout(() => {
                    overlay.classList.add('active');
                }, 200);
            }

            // Navigate after fade completes
            setTimeout(() => {
                window.location.href = 'scene.html';
            }, 850);
        });
    }

    destroy() {
        this.timeouts.forEach(id => {
            clearTimeout(id);
            clearInterval(id);
        });
        if (this.bg) this.bg.destroy();
        this.audio.destroy();
        document.removeEventListener('click', this._interactionHandler);
        document.removeEventListener('keydown', this._interactionHandler);
    }
}

// ========================================
// CURSOR SYSTEM — Minimal, matches scene crosshair
// ========================================

class CursorSystem {
    constructor() {
        this.cursor = document.getElementById('custom-cursor');
        if (!this.cursor) return;

        this.mouseX = 0;
        this.mouseY = 0;
        this.cursorX = 0;
        this.cursorY = 0;

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
        // Spring physics (lerp)
        this.cursorX += (this.mouseX - this.cursorX) * 0.18;
        this.cursorY += (this.mouseY - this.cursorY) * 0.18;

        if (this.cursor) {
            this.cursor.style.left = this.cursorX + 'px';
            this.cursor.style.top = this.cursorY + 'px';
        }

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
