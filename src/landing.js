/**
 * Landing Timeline Engine — Liquid Glass Sculpture
 * 
 * Orchestrates: Entrance animations → Interactive custom cursor → 
 * Procedural ambient audio toggle → Entrance transition to the 3D scene.
 */

import { LandingBackground } from './landing-bg.js';
import { LandingAudio } from './landing-audio.js';

export class LandingTimeline {
    constructor() {
        this.bg = null;
        this.audio = new LandingAudio();
        this.isComplete = false;
        this.hasTriggered = false;

        this._init();
    }

    _init() {
        // Initialize Three.js glass background
        const canvas = document.getElementById('bg-canvas');
        if (canvas) {
            try {
                this.bg = new LandingBackground(canvas);
            } catch (e) {
                console.error('WebGL not available:', e);
            }
        }

        // Initialize Audio Toggle
        const audioBtn = document.getElementById('audio-toggle');
        if (audioBtn) {
            audioBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // prevent triggering other clicks
                const enabled = this.audio.toggle();
                audioBtn.querySelector('.material-symbols-outlined').textContent =
                    enabled ? 'volume_up' : 'volume_off';
                audioBtn.classList.toggle('active', enabled);
            });
        }

        // Initialize Transition trigger (hero button)
        const enterBtn = document.getElementById('enter-experience');
        if (enterBtn) {
            enterBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this._triggerEnterTransition();
            });
        }

        // Initialize Transition trigger (bottom CTA button)
        const enterBtnBottom = document.getElementById('enter-experience-bottom');
        if (enterBtnBottom) {
            enterBtnBottom.addEventListener('click', (e) => {
                e.preventDefault();
                this._triggerEnterTransition();
            });
        }
        
        // Trigger ambient sound on first user click anywhere to comply with browser autoplay policies
        const firstClickSound = () => {
            if (this.audio && !this.audio.enabled) {
                this.audio._ensureContext();
            }
            document.removeEventListener('click', firstClickSound);
        };
        document.addEventListener('click', firstClickSound);

        // Scroll-based HUD fade and reveal system
        this._initScrollEffects();

        // Mark body as loaded
        document.body.classList.add('loaded');
    }

    /**
     * Sets up scroll-based effects:
     * - HUD fades out as user scrolls past the hero
     * - .reveal elements animate in via IntersectionObserver
     */
    _initScrollEffects() {
        const hud = document.getElementById('hud-container');
        const scrollIndicator = document.querySelector('.scroll-indicator');

        // HUD parallax fade on scroll
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            const vh = window.innerHeight;
            const progress = Math.min(scrollY / (vh * 0.35), 1); // fade over top 35% of viewport

            if (hud) {
                hud.style.opacity = 1 - progress;
                hud.style.transform = `translateY(${-scrollY * 0.15}px)`;
            }

            if (scrollIndicator) {
                scrollIndicator.style.opacity = Math.max(0, 0.8 - progress * 2);
            }
        }, { passive: true });

        // IntersectionObserver for .reveal elements
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -40px 0px'
        });

        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
        
        // Reading Progress Line & Spatial Compass Animation
        const progressFill = document.getElementById('reading-progress');
        const narrative = document.querySelector('.scroll-narrative');
        const chapterDynamics = document.getElementById('chapter-dynamics');
        
        // Compass Layers
        const compassOuter = document.getElementById('compass-outer');
        const compassMiddle = document.getElementById('compass-middle');
        const compassInner = document.getElementById('compass-inner');
        const spatialCompass = document.getElementById('spatial-compass');
        
        if (narrative) {
            window.addEventListener('scroll', () => {
                const windowHeight = window.innerHeight;
                
                // 1. Overall reading progress
                if (progressFill) {
                    const rect = narrative.getBoundingClientRect();
                    const startScroll = rect.top - windowHeight / 2;
                    const endScroll = rect.bottom - windowHeight / 2;
                    const totalScroll = endScroll - startScroll;
                    
                    let progress = 0;
                    if (startScroll < 0) {
                        progress = Math.min(1, Math.max(0, Math.abs(startScroll) / totalScroll));
                    }
                    progressFill.style.height = `${progress * 100}%`;
                }

                // 2. Spatial Compass Scroll Rotation
                if (chapterDynamics && compassOuter) {
                    const chRect = chapterDynamics.getBoundingClientRect();
                    
                    // Start animation when chapter enters screen
                    const drawStart = chRect.top - windowHeight;
                    
                    if (window.scrollY > 0 && chRect.top < windowHeight && chRect.bottom > 0) {
                        // Continuous rotation based on pixel distance
                        const scrollDist = windowHeight - chRect.top;
                        
                        // Rotate layers at different speeds and directions
                        compassOuter.style.transform = `rotate(${scrollDist * 0.15}deg)`;
                        compassMiddle.style.transform = `rotate(${-scrollDist * 0.25}deg)`;
                        compassInner.style.transform = `rotate(${scrollDist * 0.05}deg)`;
                    }
                }

            }, { passive: true });
        }

        // 3. Spatial Compass Mouse Parallax (3D Tilt)
        if (spatialCompass && chapterDynamics) {
            window.addEventListener('mousemove', (e) => {
                const chRect = chapterDynamics.getBoundingClientRect();
                
                // Only compute if chapter is in view
                if (chRect.top < window.innerHeight && chRect.bottom > 0) {
                    const rect = spatialCompass.getBoundingClientRect();
                    // Center of the compass
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;
                    
                    // Calculate distance from center (-1 to 1)
                    const deltaX = (e.clientX - centerX) / (window.innerWidth / 2);
                    const deltaY = (e.clientY - centerY) / (window.innerHeight / 2);
                    
                    // Max tilt in degrees
                    const maxTilt = 25;
                    
                    // Apply 3D rotation (invert Y for natural tilt)
                    spatialCompass.style.transform = `rotateX(${-deltaY * maxTilt}deg) rotateY(${deltaX * maxTilt}deg)`;
                }
            }, { passive: true });
        }
    }

    /**
     * Triggers the fullscreen expansion of the glass sphere
     * and fades out the interface to black, navigating to the scene.
     */
    _triggerEnterTransition() {
        if (this.isComplete) return;
        this.isComplete = true;

        // Play crystal chime confirmation
        this.audio.playChime();

        // 1. Trigger the WebGL expansion (makes the glass sphere zoom and distort screen space coordinates)
        if (this.bg) {
            this.bg.triggerTransition();
        }

        // 2. Fade out UI overlay HUD
        const hud = document.getElementById('hud-container');
        if (hud) {
            hud.style.transition = 'opacity 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
            hud.style.opacity = '0';
            hud.style.pointerEvents = 'none';
        }

        // 3. Fade in transition overlay (blackout)
        const overlay = document.getElementById('transition-overlay');
        if (overlay) {
            setTimeout(() => {
                overlay.classList.add('active');
            }, 300); // Trigger just as the sphere expands to fill the view
        }

        // 4. Redirect to the 3D game scene
        setTimeout(() => {
            window.location.href = 'scene.html';
        }, 1200);
    }

    destroy() {
        if (this.bg) this.bg.destroy();
        this.audio.destroy();
    }
}

// ========================================
// CURSOR SYSTEM — Minimal dual-ring cursor
// ========================================

class CursorSystem {
    constructor(audio) {
        this.audio = audio;
        this.cursor = document.getElementById('custom-cursor');
        this.ring = document.getElementById('custom-cursor-ring');
        if (!this.cursor || !this.ring) return;

        this.mouseX = 0;
        this.mouseY = 0;
        
        this.cursorX = 0;
        this.cursorY = 0;
        this.ringX = 0;
        this.ringY = 0;

        this._bindEvents();
        this._animate();
    }

    _bindEvents() {
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });

        // Toggle hover-active class on body when hovering clickable elements
        const updateHoverState = (active) => {
            if (active) {
                document.body.classList.add('hover-active');
                if (this.audio && this.audio.enabled) {
                    this.audio.playHover();
                }
            } else {
                document.body.classList.remove('hover-active');
            }
        };

        const setupHoverListeners = () => {
            const hoverables = document.querySelectorAll('a, button, #audio-toggle');
            hoverables.forEach(el => {
                // Remove previous listeners to avoid duplicates
                el.removeEventListener('mouseenter', el._hoverEnter);
                el.removeEventListener('mouseleave', el._hoverLeave);

                el._hoverEnter = () => updateHoverState(true);
                el._hoverLeave = () => updateHoverState(false);

                el.addEventListener('mouseenter', el._hoverEnter);
                el.addEventListener('mouseleave', el._hoverLeave);
            });
        };

        // Initial setup
        setupHoverListeners();

        // Re-run setup on DOM changes to catch dynamic elements
        const observer = new MutationObserver(setupHoverListeners);
        observer.observe(document.body, { childList: true, subtree: true });
    }

    _animate() {
        // Fast interpolation for the central dot (lerp = 0.3)
        this.cursorX += (this.mouseX - this.cursorX) * 0.3;
        this.cursorY += (this.mouseY - this.cursorY) * 0.3;

        // Slower interpolation for the outer ring (lerp = 0.08) to create lag trailing effect
        this.ringX += (this.mouseX - this.ringX) * 0.08;
        this.ringY += (this.mouseY - this.ringY) * 0.08;

        if (this.cursor) {
            this.cursor.style.left = `${this.cursorX}px`;
            this.cursor.style.top = `${this.cursorY}px`;
        }

        if (this.ring) {
            this.ring.style.left = `${this.ringX}px`;
            this.ring.style.top = `${this.ringY}px`;
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
        clockEl.textContent = now.toLocaleTimeString('es-ES', {
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
    new CursorSystem(timeline.audio);
    startClock();
});
