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
     * Split hero name into individual letter spans for shooting star animation
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
                // Pre-calculate randomized durations and offsets for zero-gravity and shine
                span.style.setProperty('--float-dur', `${3 + Math.random() * 2}s`);
                span.style.setProperty('--float-del', `-${Math.random() * 5}s`);
                span.style.setProperty('--shine-del', `-${Math.random() * 8}s`);
                span.style.setProperty('--float-x', `${(Math.random() - 0.5) * 6}px`);
                span.style.setProperty('--float-r', `${(Math.random() - 0.5) * 2}deg`);
            }
            heroName.appendChild(span);
            this.letterSpans.push({ el: span, char, index: i, isSpace: char === ' ' });
        });

        // Setup star trails canvas
        this._setupTrailCanvas();
    }

    /**
     * Initialize the canvas used for rendering shooting star trails
     */
    _setupTrailCanvas() {
        this.trailCanvas = document.getElementById('star-trails-canvas');
        if (!this.trailCanvas) return;

        this.trailCtx = this.trailCanvas.getContext('2d');
        this._resizeTrailCanvas();
        this._onTrailResize = () => this._resizeTrailCanvas();
        window.addEventListener('resize', this._onTrailResize);

        // Active shooting stars being animated
        this.activeStars = [];
        this.trailAnimating = false;
    }

    _resizeTrailCanvas() {
        if (!this.trailCanvas) return;
        const dpr = Math.min(window.devicePixelRatio, 2);
        this.trailCanvas.width = window.innerWidth * dpr;
        this.trailCanvas.height = window.innerHeight * dpr;
        this.trailCanvas.style.width = window.innerWidth + 'px';
        this.trailCanvas.style.height = window.innerHeight + 'px';
        if (this.trailCtx) this.trailCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    /**
     * Launch shooting star animation for all letters — 3D Cosmic Edition
     */
    _launchShootingStars() {
        const heroName = document.getElementById('hero-name');
        if (!heroName || !this.letterSpans) return;

        const letters = this.letterSpans.filter(l => !l.isSpace);
        const totalLetters = letters.length;

        // Make all letters layout-visible but invisible for position measurement
        this.letterSpans.forEach(l => {
            l.el.style.opacity = '0';
            l.el.style.visibility = 'visible';
        });

        // Let layout settle before measuring
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                letters.forEach((l, i) => {
                    const rect = l.el.getBoundingClientRect();
                    l.targetX = rect.left + rect.width / 2;
                    l.targetY = rect.top + rect.height / 2;

                    // Artistic origin generation — create a sense of convergence
                    // Letters from the first half come from the upper cosmos,
                    // letters from the second half from the lower depths
                    const spread = Math.PI * 0.6; // narrower cone per group
                    const baseAngle = i < totalLetters / 2
                        ? -Math.PI * 0.75 + Math.random() * spread  // upper-left quadrant
                        : -Math.PI * 0.25 + Math.random() * spread; // upper-right quadrant

                    // Varying distances — some close, some very far
                    const distance = 600 + Math.random() * 800;
                    l.startX = l.targetX + Math.cos(baseAngle) * distance;
                    l.startY = l.targetY + Math.sin(baseAngle) * distance;

                    // Z-depth: stars start far in 3D space
                    l.startZ = -800 - Math.random() * 1200;

                    // Initial rotation — tumbling through space
                    l.startRotX = (Math.random() - 0.5) * 120;
                    l.startRotY = (Math.random() - 0.5) * 90;
                    l.startRotZ = (Math.random() - 0.5) * 45;

                    // Stagger with slight acceleration — early letters faster gaps
                    const staggerDelay = i * 100 + (i > 0 ? Math.random() * 40 : 0);
                    const flightDuration = 900 + Math.random() * 300;

                    this._schedule(() => {
                        this._animateShootingStar3D(l, flightDuration, i);
                    }, staggerDelay);
                });

                // Start the trail rendering loop
                if (!this.trailAnimating) {
                    this.trailAnimating = true;
                    this._renderTrails3D();
                }

                // Calculate total timeline
                const totalAnimTime = totalLetters * 100 + 900 + 500;

                this._schedule(() => {
                    const heroLine = document.getElementById('hero-line');
                    if (heroLine) heroLine.classList.add('visible');
                }, totalAnimTime);

                this._schedule(() => {
                    this._typewriterSubtitle(document.getElementById('hero-subtitle'));
                }, totalAnimTime + 400);

                this._schedule(() => {
                    const skipHint = document.getElementById('skip-hint');
                    if (skipHint) skipHint.classList.add('visible');
                    document.addEventListener('click', this._interactionHandler);
                    document.addEventListener('keydown', this._interactionHandler);
                }, totalAnimTime + 1400);
            });
        });
    }

    /**
     * Animate a single letter as a 3D shooting star with tumbling rotation
     */
    _animateShootingStar3D(letter, duration, index) {
        const star = {
            letter,
            startX: letter.startX,
            startY: letter.startY,
            startZ: letter.startZ,
            targetX: letter.targetX,
            targetY: letter.targetY,
            currentX: letter.startX,
            currentY: letter.startY,
            currentZ: letter.startZ,
            prevX: letter.startX,
            prevY: letter.startY,
            startRotX: letter.startRotX,
            startRotY: letter.startRotY,
            startRotZ: letter.startRotZ,
            startTime: performance.now(),
            duration,
            trail: [],
            sparkles: [],
            landed: false,
            trailFadeStart: null,
            index,
        };

        this.activeStars.push(star);

        const animate = () => {
            if (this.isSkipped || star.landed) return;

            const now = performance.now();
            const elapsed = now - star.startTime;
            let t = Math.min(elapsed / duration, 1);

            // Artistic easing: dramatic entry → graceful deceleration
            // Combination of exponential rush with elastic settle
            const rush = 1 - Math.pow(1 - t, 5); // quintic ease-out for position
            const rotEase = 1 - Math.pow(1 - t, 3); // cubic for rotation (settles faster)

            // 3D position interpolation
            star.prevX = star.currentX;
            star.prevY = star.currentY;
            star.currentX = star.startX + (star.targetX - star.startX) * rush;
            star.currentY = star.startY + (star.targetY - star.startY) * rush;
            star.currentZ = star.startZ * (1 - rush); // Z converges to 0

            // Rotation dampens to zero
            const rotX = star.startRotX * (1 - rotEase);
            const rotY = star.startRotY * (1 - rotEase);
            const rotZ = star.startRotZ * (1 - rotEase);

            // Scale: far away = tiny, close = full size
            const depthScale = Math.max(0.05, 1 + star.currentZ / 800);
            const scale = 0.3 + (1 - 0.3) * rush; // from 30% to 100% size

            // Trail points — denser when moving fast
            const speed = Math.sqrt(
                Math.pow(star.currentX - star.prevX, 2) +
                Math.pow(star.currentY - star.prevY, 2)
            );

            if (speed > 0.5) {
                star.trail.push({
                    x: star.currentX,
                    y: star.currentY,
                    opacity: Math.min(1, speed / 20) * 0.9,
                    size: 1.5 + Math.min(1, speed / 15) * 4,
                    birth: now,
                    speed: speed
                });

                // Sparkle particles — ejected sideways from the trail
                if (Math.random() < 0.35 && speed > 3) {
                    const perpX = -(star.currentY - star.prevY);
                    const perpY = (star.currentX - star.prevX);
                    const perpLen = Math.sqrt(perpX * perpX + perpY * perpY) || 1;
                    const side = Math.random() > 0.5 ? 1 : -1;
                    const ejectSpeed = 0.5 + Math.random() * 1.5;

                    star.sparkles.push({
                        x: star.currentX,
                        y: star.currentY,
                        vx: (perpX / perpLen) * side * ejectSpeed + (Math.random() - 0.5) * 0.5,
                        vy: (perpY / perpLen) * side * ejectSpeed + (Math.random() - 0.5) * 0.5,
                        life: 1.0,
                        size: 1 + Math.random() * 2,
                        birth: now
                    });
                }
            }

            // Trim trails
            if (star.trail.length > 80) star.trail.shift();

            // CSS 3D transform on the letter element
            const dx = star.currentX - star.targetX;
            const dy = star.currentY - star.targetY;

            // Opacity: invisible far away, visible as it arrives
            const letterOpacity = Math.min(1, t * 3);
            // Motion blur proxy via CSS blur — stronger when fast
            const motionBlur = Math.max(0, (1 - t) * Math.min(8, speed * 0.3));

            letter.el.style.opacity = letterOpacity;
            letter.el.style.transform = `translate3d(${dx}px, ${dy}px, ${star.currentZ}px) rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg) scale(${scale})`;
            letter.el.style.filter = `blur(${motionBlur}px)`;

            // Glow intensifies as star approaches — warm white core
            const glowIntensity = Math.max(0, 1 - t) * 0.9;
            const glowSize = 20 * glowIntensity;
            letter.el.style.textShadow = glowIntensity > 0.05
                ? `0 0 ${glowSize}px rgba(200, 215, 255, ${glowIntensity}), 0 0 ${glowSize * 2}px rgba(140, 160, 220, ${glowIntensity * 0.3})`
                : 'none';

            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                // === LANDING IMPACT ===
                star.landed = true;
                star.trailFadeStart = performance.now();

                // Play impact sound
                this.audio.playTick();

                // Elastic bounce landing — small overshoot then settle
                letter.el.style.transition = 'none';
                letter.el.style.transform = 'translate3d(0, 0, 0) rotateX(0) rotateY(0) rotateZ(0) scale(1.08)';
                letter.el.style.opacity = '1';
                letter.el.style.filter = 'blur(0)';
                letter.el.style.textShadow = `0 0 25px rgba(200, 215, 255, 0.8), 0 0 50px rgba(140, 160, 220, 0.3)`;
                letter.el.classList.add('landed');

                // Settle bounce
                setTimeout(() => {
                    letter.el.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), text-shadow 2.5s ease';
                    letter.el.style.transform = 'translate3d(0, 0, 0) rotateX(0) rotateY(0) rotateZ(0) scale(1)';
                    letter.el.style.textShadow = '0 0 6px rgba(200, 215, 255, 0.15)';
                }, 50);

                // Final subtle persistent glow and Zero-Gravity Float initiation
                setTimeout(() => {
                    letter.el.style.textShadow = '0 0 6px rgba(200, 215, 255, 0.15)';
                    
                    // Clear inline transform and transition to let CSS animations take over
                    letter.el.style.transform = '';
                    letter.el.style.transition = '';
                    
                    // Add the class that triggers the material shine and the float
                    letter.el.classList.add('floating-stone');
                }, 2600);
            }
        };

        requestAnimationFrame(animate);
    }

    /**
     * Render 3D shooting star trails and sparkle particles on canvas
     */
    _renderTrails3D() {
        if (!this.trailCtx || !this.trailAnimating) return;

        const ctx = this.trailCtx;
        const w = window.innerWidth;
        const h = window.innerHeight;

        // Progressive fade — creates beautiful persistence
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.fillRect(0, 0, w, h);

        ctx.globalCompositeOperation = 'lighter';

        const now = performance.now();
        let hasActive = false;

        this.activeStars.forEach(star => {
            // Skip fully faded stars
            if (star.landed && star.trailFadeStart && now - star.trailFadeStart > 2000) return;

            hasActive = true;

            // === DRAW ELONGATED DIRECTIONAL STREAKS ===
            if (star.trail.length >= 2) {
                for (let i = 1; i < star.trail.length; i++) {
                    const p = star.trail[i];
                    const prev = star.trail[i - 1];
                    const age = (now - p.birth) / 1000;

                    let fadeFactor;
                    if (star.landed) {
                        fadeFactor = Math.max(0, 1 - (now - star.trailFadeStart) / 1200);
                    } else {
                        fadeFactor = Math.max(0, 1 - age * 1.5);
                    }
                    if (fadeFactor <= 0) continue;

                    const alpha = p.opacity * fadeFactor;
                    const width = p.size * fadeFactor;

                    // Draw line segment with gradient
                    ctx.beginPath();
                    ctx.moveTo(prev.x, prev.y);
                    ctx.lineTo(p.x, p.y);
                    ctx.strokeStyle = `rgba(200, 215, 255, ${alpha * 0.7})`;
                    ctx.lineWidth = width;
                    ctx.lineCap = 'round';
                    ctx.stroke();

                    // Inner brighter core line
                    ctx.beginPath();
                    ctx.moveTo(prev.x, prev.y);
                    ctx.lineTo(p.x, p.y);
                    ctx.strokeStyle = `rgba(240, 245, 255, ${alpha * 0.4})`;
                    ctx.lineWidth = width * 0.4;
                    ctx.stroke();
                }
            }

            // === STAR HEAD — Bright lens-flare-like point ===
            if (!star.landed) {
                // Outer halo
                const haloGrad = ctx.createRadialGradient(
                    star.currentX, star.currentY, 0,
                    star.currentX, star.currentY, 18
                );
                haloGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
                haloGrad.addColorStop(0.1, 'rgba(220, 230, 255, 0.7)');
                haloGrad.addColorStop(0.3, 'rgba(180, 200, 255, 0.25)');
                haloGrad.addColorStop(0.6, 'rgba(140, 170, 230, 0.06)');
                haloGrad.addColorStop(1, 'rgba(100, 130, 200, 0)');

                ctx.beginPath();
                ctx.arc(star.currentX, star.currentY, 18, 0, Math.PI * 2);
                ctx.fillStyle = haloGrad;
                ctx.fill();

                // Cross-flare (tiny horizontal + vertical lines through the star)
                const flareAlpha = 0.3;
                const flareLen = 14;
                ctx.beginPath();
                ctx.moveTo(star.currentX - flareLen, star.currentY);
                ctx.lineTo(star.currentX + flareLen, star.currentY);
                ctx.strokeStyle = `rgba(200, 220, 255, ${flareAlpha})`;
                ctx.lineWidth = 1;
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(star.currentX, star.currentY - flareLen * 0.7);
                ctx.lineTo(star.currentX, star.currentY + flareLen * 0.7);
                ctx.stroke();
            }

            // === SPARKLE PARTICLES — Tiny diamonds ejected from trail ===
            star.sparkles.forEach(sp => {
                const age = (now - sp.birth) / 1000;
                sp.x += sp.vx;
                sp.y += sp.vy;
                sp.vx *= 0.96; // friction
                sp.vy *= 0.96;
                sp.life = Math.max(0, 1 - age * 2.5);

                if (sp.life <= 0) return;

                const sparkAlpha = sp.life * 0.6;
                const sparkSize = sp.size * sp.life;

                // Tiny diamond shape
                ctx.save();
                ctx.translate(sp.x, sp.y);
                ctx.rotate(age * 3); // spin
                ctx.beginPath();
                ctx.moveTo(0, -sparkSize);
                ctx.lineTo(sparkSize * 0.5, 0);
                ctx.moveTo(0, sparkSize);
                ctx.lineTo(-sparkSize * 0.5, 0);
                ctx.strokeStyle = `rgba(220, 230, 255, ${sparkAlpha})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();

                // Center dot
                ctx.beginPath();
                ctx.arc(0, 0, sparkSize * 0.3, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${sparkAlpha * 0.8})`;
                ctx.fill();
                ctx.restore();
            });

            // Clean up dead sparkles
            star.sparkles = star.sparkles.filter(sp => {
                const age = (now - sp.birth) / 1000;
                return (1 - age * 2.5) > 0;
            });

            // Clean up old trail points
            star.trail = star.trail.filter(p => {
                const age = (now - p.birth) / 1000;
                return star.landed ? (now - star.trailFadeStart) < 2000 : age < 2;
            });
        });

        // Purge fully-faded stars
        this.activeStars = this.activeStars.filter(s => {
            if (s.landed && s.trailFadeStart && now - s.trailFadeStart > 2000 && s.sparkles.length === 0) {
                return false;
            }
            return true;
        });

        if (hasActive || this.activeStars.length > 0) {
            requestAnimationFrame(() => this._renderTrails3D());
        } else {
            this.trailAnimating = false;
            ctx.clearRect(0, 0, w, h);
        }
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
        // Phase 1: Shooting star name reveal (1s delay then stars begin)
        this._schedule(() => {
            this._launchShootingStars();
        }, 800);
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

        // Stop shooting star trails
        this.trailAnimating = false;
        this.activeStars = [];
        if (this.trailCtx) {
            this.trailCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        }

        // Place all letters instantly at their final positions
        if (this.letterSpans) {
            this.letterSpans.forEach(l => {
                l.el.style.opacity = '1';
                l.el.style.transform = 'translate(0, 0)';
                l.el.style.filter = 'blur(0)';
                l.el.style.textShadow = 'none';
                l.el.style.transition = 'none';
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
        this.trailAnimating = false;
        if (this._onTrailResize) window.removeEventListener('resize', this._onTrailResize);
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
