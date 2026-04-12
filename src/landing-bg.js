import * as THREE from 'three';

/**
 * Landing Background — Dual-Layer Particle Nebula
 * 
 * Philosophy: Dust floating in light. A living, breathing cosmos.
 * Two layers: a slow far nebula for depth, a reactive close field for interaction.
 * No neon, no connecting lines — just organic, cinematic particles.
 */

const PARTICLE_COUNT = 3200;
const MOUSE_RADIUS = 2.0;
const MOUSE_PUSH = 0.012;
const MOUSE_ORBIT = 0.008;
const MATERIALIZATION_DURATION = 3.0; // seconds
const BREATH_PERIOD = 8.0; // seconds for luminance pulse cycle

export class LandingBackground {
    constructor(canvas) {
        this.canvas = canvas;
        this.mouseNDC = new THREE.Vector2(9999, 9999);
        this.startTime = null;
        this.isDestroyed = false;
        this.rafId = null;
        this.launchMode = false;
        this.launchStartTime = 0;

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

        // Create dual-layer particles
        this._createParticles();

        // Start
        this.startTime = performance.now();
        this._animate();
    }

    _createParticles() {
        const geometry = new THREE.BufferGeometry();

        const positions = new Float32Array(PARTICLE_COUNT * 3);
        const basePositions = new Float32Array(PARTICLE_COUNT * 3);
        const sizes = new Float32Array(PARTICLE_COUNT);
        const opacities = new Float32Array(PARTICLE_COUNT);
        const phases = new Float32Array(PARTICLE_COUNT);
        const speeds = new Float32Array(PARTICLE_COUNT);
        const layers = new Float32Array(PARTICLE_COUNT); // 0 = far nebula, 1 = close reactive

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const i3 = i * 3;

            // 60% far nebula, 40% close reactive
            const isClose = i >= PARTICLE_COUNT * 0.6;
            layers[i] = isClose ? 1.0 : 0.0;

            const spread = isClose ? 12 : 18;
            const depthSpread = isClose ? 4 : 8;

            const x = (Math.random() - 0.5) * spread;
            const y = (Math.random() - 0.5) * (spread * 0.7);
            const z = isClose
                ? (Math.random() - 0.5) * depthSpread
                : -2 - Math.random() * depthSpread; // Far layer sits behind

            basePositions[i3] = x;
            basePositions[i3 + 1] = y;
            basePositions[i3 + 2] = z;

            // Start at center (for materialization)
            positions[i3] = 0;
            positions[i3 + 1] = 0;
            positions[i3 + 2] = 0;

            // Far particles: larger but softer. Close particles: smaller, sharper
            if (isClose) {
                sizes[i] = 1.5 + Math.random() * 3.0;
                opacities[i] = 0.12 + Math.random() * 0.4;
            } else {
                sizes[i] = 2.5 + Math.random() * 4.0;
                opacities[i] = 0.04 + Math.random() * 0.15;
            }

            // Phase offset for organic motion
            phases[i] = Math.random() * Math.PI * 2;
            speeds[i] = isClose ? 0.15 + Math.random() * 0.35 : 0.05 + Math.random() * 0.1;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('aBasePosition', new THREE.BufferAttribute(basePositions, 3));
        geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute('aOpacity', new THREE.BufferAttribute(opacities, 1));
        geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
        geometry.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));
        geometry.setAttribute('aLayer', new THREE.BufferAttribute(layers, 1));

        // Custom shader material
        const material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uMouse: { value: new THREE.Vector2(9999, 9999) },
                uProgress: { value: 0 }, // Materialization progress 0→1
                uPixelRatio: { value: this.renderer.getPixelRatio() },
                uLaunch: { value: 0 }, // Launch warp 0→1
            },
            vertexShader: `
                attribute float aSize;
                attribute float aOpacity;
                attribute float aPhase;
                attribute float aSpeed;
                attribute vec3 aBasePosition;
                attribute float aLayer;
                
                uniform float uTime;
                uniform vec2 uMouse;
                uniform float uProgress;
                uniform float uPixelRatio;
                uniform float uLaunch;
                
                varying float vOpacity;
                varying float vLayer;
                varying float vDepth;
                
                void main() {
                    // Ring-wave materialization: particles expand outward in a ring
                    float distFromCenter = length(aBasePosition.xy);
                    float maxDist = 9.0;
                    float normDist = distFromCenter / maxDist;
                    float localProgress = smoothstep(normDist - 0.2, normDist + 0.15, uProgress);
                    
                    vec3 pos = mix(vec3(0.0), aBasePosition, localProgress);
                    
                    // Organic floating motion
                    float t = uTime * aSpeed;
                    float amp = aLayer > 0.5 ? 1.0 : 0.5; // Close layer moves more
                    pos.x += sin(t + aPhase) * 0.06 * amp;
                    pos.y += cos(t * 0.7 + aPhase * 1.3) * 0.08 * amp;
                    pos.z += sin(t * 0.5 + aPhase * 0.7) * 0.04 * amp;
                    
                    // Mouse interaction: push + orbit
                    vec4 viewPos = modelViewMatrix * vec4(pos, 1.0);
                    vec4 projected = projectionMatrix * viewPos;
                    vec2 screenPos = projected.xy / projected.w;
                    
                    vec2 toMouse = screenPos - uMouse;
                    float dist = length(toMouse);
                    
                    // Far layer barely reacts to mouse
                    float mouseReactivity = aLayer > 0.5 ? 1.0 : 0.15;
                    
                    if (dist < ${MOUSE_RADIUS.toFixed(1)}) {
                        float strength = 1.0 - dist / ${MOUSE_RADIUS.toFixed(1)};
                        strength = strength * strength * mouseReactivity;
                        
                        vec2 pushDir = normalize(toMouse);
                        vec2 tangent = vec2(-pushDir.y, pushDir.x);
                        
                        // Radial push + tangential orbit
                        pos.x += pushDir.x * strength * ${MOUSE_PUSH.toFixed(3)} * 3.0;
                        pos.y += pushDir.y * strength * ${MOUSE_PUSH.toFixed(3)} * 3.0;
                        pos.x += tangent.x * strength * ${MOUSE_ORBIT.toFixed(3)} * 4.0;
                        pos.y += tangent.y * strength * ${MOUSE_ORBIT.toFixed(3)} * 4.0;
                    }
                    
                    // Launch warp: particles rush toward center/behind camera
                    if (uLaunch > 0.0) {
                        pos = mix(pos, vec3(0.0, 0.0, -5.0), uLaunch * uLaunch);
                    }
                    
                    // Depth factor for color variation
                    float depthFactor = smoothstep(-6.0, 3.0, pos.z);
                    vDepth = depthFactor;
                    vLayer = aLayer;
                    
                    // Breathing luminance pulse
                    float breath = sin(uTime / ${BREATH_PERIOD.toFixed(1)} * 6.28318) * 0.5 + 0.5;
                    float breathFactor = 0.85 + breath * 0.15;
                    
                    vOpacity = aOpacity * localProgress * (0.7 + depthFactor * 0.3) * breathFactor;
                    
                    // Launch makes particles brighter as they converge
                    vOpacity *= 1.0 + uLaunch * 2.0;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_Position = projectionMatrix * mvPosition;
                    gl_PointSize = aSize * uPixelRatio * (1.0 / -mvPosition.z);
                    gl_PointSize = clamp(gl_PointSize, 0.5, 20.0);
                }
            `,
            fragmentShader: `
                varying float vOpacity;
                varying float vLayer;
                varying float vDepth;
                
                void main() {
                    float dist = length(gl_PointCoord - vec2(0.5));
                    if (dist > 0.5) discard;
                    
                    // Far particles have softer edges (depth-of-field simulation)
                    float edgeSoftness = vLayer > 0.5 ? 0.15 : 0.25;
                    float alpha = smoothstep(0.5, edgeSoftness, dist) * vOpacity;
                    
                    // Depth-based color: back → cool blue, front → warm amber-silver
                    vec3 colorCool = vec3(0.68, 0.72, 0.84);  // pale blue
                    vec3 colorWarm = vec3(0.82, 0.78, 0.72);  // warm amber
                    vec3 colorBase = vec3(0.74, 0.75, 0.80);  // silver
                    
                    vec3 color = mix(colorCool, colorBase, vDepth);
                    color = mix(color, colorWarm, vDepth * 0.3);
                    
                    gl_FragColor = vec4(color, alpha);
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
        this._onMouseMove = (e) => {
            // Convert to NDC (-1 to 1)
            this.mouseNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouseNDC.y = -(e.clientY / window.innerHeight) * 2 + 1;
        };

        this._onResize = () => {
            if (this.isDestroyed) return;
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.particles.material.uniforms.uPixelRatio.value = this.renderer.getPixelRatio();
        };

        window.addEventListener('mousemove', this._onMouseMove);
        window.addEventListener('resize', this._onResize);
    }

    /**
     * Trigger the launch warp effect — particles rush to center
     */
    triggerLaunch() {
        this.launchMode = true;
        this.launchStartTime = performance.now();
    }

    _animate() {
        if (this.isDestroyed) return;

        const elapsed = (performance.now() - this.startTime) / 1000;

        const uniforms = this.particles.material.uniforms;
        uniforms.uTime.value = elapsed;
        uniforms.uMouse.value.copy(this.mouseNDC);

        // Ring-wave materialization progress
        uniforms.uProgress.value = Math.min(elapsed / MATERIALIZATION_DURATION, 1);

        // Launch warp
        if (this.launchMode) {
            const launchElapsed = (performance.now() - this.launchStartTime) / 1000;
            uniforms.uLaunch.value = Math.min(launchElapsed / 0.8, 1);
        }

        this.renderer.render(this.scene, this.camera);
        this.rafId = requestAnimationFrame(() => this._animate());
    }

    destroy() {
        this.isDestroyed = true;
        if (this.rafId) cancelAnimationFrame(this.rafId);
        window.removeEventListener('mousemove', this._onMouseMove);
        window.removeEventListener('resize', this._onResize);
        this.renderer.dispose();
        this.particles.geometry.dispose();
        this.particles.material.dispose();
    }
}
