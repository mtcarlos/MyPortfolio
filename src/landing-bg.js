import * as THREE from 'three';

/**
 * Landing Background — Minimal Floating Dust
 * 
 * Microscopic white particles floating slowly in the void.
 * Like dust caught in gallery lighting — barely perceptible but alive.
 * No mouse interaction, no materialization wave, no launch warp.
 */

const PARTICLE_COUNT = 500;
const BREATH_PERIOD = 10.0;

export class LandingBackground {
    constructor(canvas) {
        this.canvas = canvas;
        this.isDestroyed = false;
        this.rafId = null;

        this._init();
        this._bindEvents();
    }

    _init() {
        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: false,
            alpha: true,
        });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        // Scene
        this.scene = new THREE.Scene();

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            100
        );
        this.camera.position.z = 5;

        // Create dust particles
        this._createParticles();

        // Start
        this.startTime = performance.now();
        this._animate();
    }

    _createParticles() {
        const geometry = new THREE.BufferGeometry();

        const positions = new Float32Array(PARTICLE_COUNT * 3);
        const sizes = new Float32Array(PARTICLE_COUNT);
        const opacities = new Float32Array(PARTICLE_COUNT);
        const phases = new Float32Array(PARTICLE_COUNT);
        const speeds = new Float32Array(PARTICLE_COUNT);

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const i3 = i * 3;

            // Spread across the viewport
            positions[i3] = (Math.random() - 0.5) * 16;
            positions[i3 + 1] = (Math.random() - 0.5) * 10;
            positions[i3 + 2] = (Math.random() - 0.5) * 8 - 2;

            // Very small, very subtle
            sizes[i] = 1.0 + Math.random() * 2.5;
            opacities[i] = 0.03 + Math.random() * 0.07;

            // Phase offset for organic motion
            phases[i] = Math.random() * Math.PI * 2;
            speeds[i] = 0.03 + Math.random() * 0.08;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute('aOpacity', new THREE.BufferAttribute(opacities, 1));
        geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
        geometry.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));

        const material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uPixelRatio: { value: this.renderer.getPixelRatio() },
            },
            vertexShader: `
                attribute float aSize;
                attribute float aOpacity;
                attribute float aPhase;
                attribute float aSpeed;
                
                uniform float uTime;
                uniform float uPixelRatio;
                
                varying float vOpacity;
                
                void main() {
                    vec3 pos = position;
                    
                    // Slow organic floating
                    float t = uTime * aSpeed;
                    pos.x += sin(t + aPhase) * 0.04;
                    pos.y += cos(t * 0.7 + aPhase * 1.3) * 0.05;
                    pos.z += sin(t * 0.5 + aPhase * 0.7) * 0.03;
                    
                    // Breathing luminance
                    float breath = sin(uTime / ${BREATH_PERIOD.toFixed(1)} * 6.28318) * 0.5 + 0.5;
                    float breathFactor = 0.85 + breath * 0.15;
                    
                    // Fade in over first 2 seconds
                    float fadeIn = smoothstep(0.0, 2.0, uTime);
                    
                    vOpacity = aOpacity * breathFactor * fadeIn;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_Position = projectionMatrix * mvPosition;
                    gl_PointSize = aSize * uPixelRatio * (1.0 / -mvPosition.z);
                    gl_PointSize = clamp(gl_PointSize, 0.5, 12.0);
                }
            `,
            fragmentShader: `
                varying float vOpacity;
                
                void main() {
                    float dist = length(gl_PointCoord - vec2(0.5));
                    if (dist > 0.5) discard;
                    
                    // Soft edge
                    float alpha = smoothstep(0.5, 0.15, dist) * vOpacity;
                    
                    // Neutral white — no color tinting
                    gl_FragColor = vec4(0.85, 0.85, 0.88, alpha);
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    _bindEvents() {
        this._onResize = () => {
            if (this.isDestroyed) return;
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.particles.material.uniforms.uPixelRatio.value = this.renderer.getPixelRatio();
        };

        window.addEventListener('resize', this._onResize);
    }

    _animate() {
        if (this.isDestroyed) return;

        const elapsed = (performance.now() - this.startTime) / 1000;
        this.particles.material.uniforms.uTime.value = elapsed;

        this.renderer.render(this.scene, this.camera);
        this.rafId = requestAnimationFrame(() => this._animate());
    }

    destroy() {
        this.isDestroyed = true;
        if (this.rafId) cancelAnimationFrame(this.rafId);
        window.removeEventListener('resize', this._onResize);
        this.renderer.dispose();
        this.particles.geometry.dispose();
        this.particles.material.dispose();
    }
}
