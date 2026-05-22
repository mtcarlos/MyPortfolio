import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

/**
 * Liquid Glass Sculpture — WebGL Engine v2
 *
 * A morphing iridescent chrome sphere rendered with Three.js's
 * physically-based MeshPhysicalMaterial, procedural studio environment
 * map (PMREM), orbiting colored lights, simplex noise vertex
 * displacement, floating dust particles, and cinematic bloom.
 */

/* ================================================================
   3D Simplex Noise — compact JS port
   Based on Stefan Gustavson's Java implementation (public domain)
   ================================================================ */

const _PERM = new Uint8Array([
    151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,
    69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,
    252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,
    168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,
    211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,
    216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,
    100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,
    82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,
    248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,
    98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,
    210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,
    199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,
    114,67,29,24,72,243,141,128,195,78,66,215,61,156,180
]);

const _p = new Uint8Array(512);
const _p12 = new Uint8Array(512);
for (let i = 0; i < 512; i++) {
    _p[i] = _PERM[i & 255];
    _p12[i] = _p[i] % 12;
}

// Gradient vectors for 3D simplex noise
const _G = new Float32Array([
    1,1,0, -1,1,0, 1,-1,0, -1,-1,0,
    1,0,1, -1,0,1, 1,0,-1, -1,0,-1,
    0,1,1, 0,-1,1, 0,1,-1, 0,-1,-1
]);

function noise3D(xin, yin, zin) {
    const F3 = 1 / 3, G3 = 1 / 6;
    const s = (xin + yin + zin) * F3;
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);
    const k = Math.floor(zin + s);
    const t = (i + j + k) * G3;
    const x0 = xin - (i - t), y0 = yin - (j - t), z0 = zin - (k - t);

    let i1, j1, k1, i2, j2, k2;
    if (x0 >= y0) {
        if (y0 >= z0)      { i1=1;j1=0;k1=0;i2=1;j2=1;k2=0; }
        else if (x0 >= z0) { i1=1;j1=0;k1=0;i2=1;j2=0;k2=1; }
        else               { i1=0;j1=0;k1=1;i2=1;j2=0;k2=1; }
    } else {
        if (y0 < z0)       { i1=0;j1=0;k1=1;i2=0;j2=1;k2=1; }
        else if (x0 < z0)  { i1=0;j1=1;k1=0;i2=0;j2=1;k2=1; }
        else               { i1=0;j1=1;k1=0;i2=1;j2=1;k2=0; }
    }

    const x1 = x0 - i1 + G3,     y1 = y0 - j1 + G3,     z1 = z0 - k1 + G3;
    const x2 = x0 - i2 + 2 * G3, y2 = y0 - j2 + 2 * G3, z2 = z0 - k2 + 2 * G3;
    const x3 = x0 - 1 + 0.5,     y3 = y0 - 1 + 0.5,     z3 = z0 - 1 + 0.5;

    const ii = i & 255, jj = j & 255, kk = k & 255;
    let n = 0, v;

    v = 0.6 - x0*x0 - y0*y0 - z0*z0;
    if (v > 0) { v *= v; const gi = _p12[ii + _p[jj + _p[kk]]] * 3; n += v*v * (_G[gi]*x0 + _G[gi+1]*y0 + _G[gi+2]*z0); }

    v = 0.6 - x1*x1 - y1*y1 - z1*z1;
    if (v > 0) { v *= v; const gi = _p12[ii+i1 + _p[jj+j1 + _p[kk+k1]]] * 3; n += v*v * (_G[gi]*x1 + _G[gi+1]*y1 + _G[gi+2]*z1); }

    v = 0.6 - x2*x2 - y2*y2 - z2*z2;
    if (v > 0) { v *= v; const gi = _p12[ii+i2 + _p[jj+j2 + _p[kk+k2]]] * 3; n += v*v * (_G[gi]*x2 + _G[gi+1]*y2 + _G[gi+2]*z2); }

    v = 0.6 - x3*x3 - y3*y3 - z3*z3;
    if (v > 0) { v *= v; const gi = _p12[ii+1 + _p[jj+1 + _p[kk+1]]] * 3; n += v*v * (_G[gi]*x3 + _G[gi+1]*y3 + _G[gi+2]*z3); }

    return 32 * n; // Range approx [-1, 1]
}


/* ================================================================
   Landing Background — Main WebGL Engine
   ================================================================ */

export class LandingBackground {
    constructor(canvas) {
        this.canvas = canvas;
        this.isDestroyed = false;
        this.isTransitioning = false;
        this.rafId = null;

        // Mouse tracking
        this.mouse = { x: 0, y: 0 };
        this.smoothMouse = { x: 0, y: 0 };

        // Entry animation state
        this.scaleTarget = 1.0;
        this.currentScale = 0.001;
        this.transitionProgress = 0;

        this._init();
        this._bindEvents();
    }

    /* ---- Initialization ---- */

    _init() {
        // Renderer with cinematic tone mapping
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance'
        });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.1;

        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x030305);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            0.1,
            100
        );
        this.camera.position.set(0, 0, 5);

        // Build the scene
        this._createEnvironmentMap();
        this._createSculpture();
        this._createLights();
        this._createParticles();
        this._setupPostProcessing();

        // Start the render loop
        this.startTime = performance.now();
        this._animate();
    }

    /* ---- Procedural Environment Map (Virtual Studio) ---- */

    _createEnvironmentMap() {
        const envScene = new THREE.Scene();

        // Dark backdrop sphere (rendered inside-out)
        const bgGeo = new THREE.SphereGeometry(15, 32, 32);
        const bgMat = new THREE.MeshBasicMaterial({
            color: 0x050508,
            side: THREE.BackSide
        });
        envScene.add(new THREE.Mesh(bgGeo, bgMat));

        // Virtual studio "light panels" — HDR emissive surfaces that
        // create rich, colored reflections on the chrome sphere.
        // Uses color values > 1.0 for HDR intensity.
        const panels = [
            // Key light: warm amber/gold from upper-right
            { pos: [8, 5, 5],   size: [3, 2],   color: new THREE.Color(4.0, 1.8, 0.6) },
            // Fill light: cool blue from lower-left
            { pos: [-6, -3, 7], size: [2.5, 2],  color: new THREE.Color(0.4, 1.2, 3.5) },
            // Rim light: teal from above/behind
            { pos: [0, 8, -5],  size: [2, 1.5],  color: new THREE.Color(0.3, 2.5, 1.8) },
            // Accent: purple/magenta from below
            { pos: [4, -8, -3], size: [4, 2],    color: new THREE.Color(1.0, 0.15, 2.0) },
            // Edge fill: deep blue from far left
            { pos: [-7, 4, -6], size: [1.5, 3],  color: new THREE.Color(0.15, 0.4, 1.5) },
        ];

        const geos = [];
        const mats = [];

        for (const p of panels) {
            const geo = new THREE.PlaneGeometry(p.size[0], p.size[1]);
            const mat = new THREE.MeshBasicMaterial({
                color: p.color,
                side: THREE.DoubleSide
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(p.pos[0], p.pos[1], p.pos[2]);
            mesh.lookAt(0, 0, 0);
            envScene.add(mesh);
            geos.push(geo);
            mats.push(mat);
        }

        // Generate prefiltered mipmap environment map
        const pmrem = new THREE.PMREMGenerator(this.renderer);
        this.envMap = pmrem.fromScene(envScene, 0, 0.1, 100).texture;
        pmrem.dispose();

        // Set as scene environment (used by PBR materials)
        this.scene.environment = this.envMap;

        // Cleanup temporary resources
        bgGeo.dispose();
        bgMat.dispose();
        geos.forEach(g => g.dispose());
        mats.forEach(m => m.dispose());
    }

    /* ---- The Glass Sculpture ---- */

    _createSculpture() {
        const detail = 4; // ~2562 vertices — smooth enough for chrome, fast to morph
        const radius = 1.5;

        this.sculptureGeometry = new THREE.IcosahedronGeometry(radius, detail);

        // Store original vertex positions for displacement reference
        const posAttr = this.sculptureGeometry.attributes.position;
        this.originalPositions = new Float32Array(posAttr.array.length);
        this.originalPositions.set(posAttr.array);

        // MeshPhysicalMaterial — the crown jewel of Three.js PBR rendering
        this.sculptureMaterial = new THREE.MeshPhysicalMaterial({
            metalness: 1.0,
            roughness: 0.05,
            envMap: this.envMap,
            envMapIntensity: 2.5,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1,
            iridescence: 1.0,
            iridescenceIOR: 1.3,
            iridescenceThicknessRange: [100, 400],
            color: new THREE.Color(0x888899),
        });

        this.sculpture = new THREE.Mesh(this.sculptureGeometry, this.sculptureMaterial);
        this.scene.add(this.sculpture);
    }

    /* ---- Dynamic Lighting ---- */

    _createLights() {
        // Soft ambient fill
        this.scene.add(new THREE.AmbientLight(0x111122, 0.5));

        // Rim backlight for edge separation against dark background
        const rimLight = new THREE.DirectionalLight(0x6688aa, 2);
        rimLight.position.set(0, 2, -4);
        this.scene.add(rimLight);

        // Orbiting colored point lights — create shifting specular
        // highlights on the chrome surface as they move
        this.orbitLights = [
            {
                light: new THREE.PointLight(0xff7744, 12, 18),
                speed: 0.3, radius: 4.0, yFactor: 0.5, offset: 0
            },
            {
                light: new THREE.PointLight(0x4488ff, 10, 18),
                speed: 0.22, radius: 4.5, yFactor: 0.6, offset: Math.PI * 0.67
            },
            {
                light: new THREE.PointLight(0x44ffbb, 8, 15),
                speed: 0.18, radius: 3.5, yFactor: 0.4, offset: Math.PI * 1.33
            },
        ];

        for (const data of this.orbitLights) {
            this.scene.add(data.light);
        }
    }

    /* ---- Atmospheric Particles ---- */

    _createParticles() {
        const count = 120;
        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);
            const r = 2.5 + Math.random() * 6;

            positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const mat = new THREE.PointsMaterial({
            color: 0x99aabb,
            size: 0.018,
            transparent: true,
            opacity: 0.35,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true
        });

        this.particles = new THREE.Points(geo, mat);
        this.scene.add(this.particles);
    }

    /* ---- Post-Processing Pipeline ---- */

    _setupPostProcessing() {
        this.composer = new EffectComposer(this.renderer);

        // 1. Render the 3D scene
        this.composer.addPass(new RenderPass(this.scene, this.camera));

        // 2. Cinematic bloom (catches specular highlights)
        this.bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            0.6,   // strength — subtle, not overpowering
            0.5,   // radius — soft glow spread
            0.8    // threshold — only bright highlights bloom
        );
        this.composer.addPass(this.bloomPass);

        // 3. Output pass (handles tone mapping + sRGB encoding)
        this.composer.addPass(new OutputPass());
    }

    /* ---- Event Handlers ---- */

    _bindEvents() {
        this._onResize = () => {
            if (this.isDestroyed) return;
            const w = window.innerWidth;
            const h = window.innerHeight;

            this.camera.aspect = w / h;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(w, h);
            this.composer.setSize(w, h);
        };

        this._onMouseMove = (e) => {
            if (this.isDestroyed) return;
            // Normalized mouse coords: -1 to 1
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        };

        window.addEventListener('resize', this._onResize);
        window.addEventListener('mousemove', this._onMouseMove);
    }

    /* ---- Transition API (called from landing.js) ---- */

    triggerTransition() {
        this.isTransitioning = true;
        this.scaleTarget = 12.0;
    }

    /* ---- Vertex Morphing via Simplex Noise ---- */

    _updateVertices(time) {
        const posAttr = this.sculptureGeometry.attributes.position;
        const count = posAttr.count;
        const orig = this.originalPositions;

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            const ox = orig[i3], oy = orig[i3 + 1], oz = orig[i3 + 2];

            // Unit normal direction (outward from sphere center)
            const len = Math.sqrt(ox * ox + oy * oy + oz * oz);
            const nx = ox / len, ny = oy / len, nz = oz / len;

            // Layer 1: slow, large undulations (organic morphing)
            const d1 = noise3D(
                nx * 0.8 + time * 0.12,
                ny * 0.8 + time * 0.08,
                nz * 0.8
            ) * 0.22;

            // Layer 2: medium flowing detail
            const d2 = noise3D(
                nx * 1.6 - time * 0.06,
                ny * 1.6,
                nz * 1.6 + time * 0.1
            ) * 0.10;

            // Layer 3: fine surface ripple
            const d3 = noise3D(
                nx * 3.2 + time * 0.2,
                ny * 3.2 - time * 0.14,
                nz * 3.2
            ) * 0.035;

            const disp = d1 + d2 + d3;

            posAttr.setXYZ(
                i,
                ox + nx * disp,
                oy + ny * disp,
                oz + nz * disp
            );
        }

        posAttr.needsUpdate = true;
        this.sculptureGeometry.computeVertexNormals();
    }

    /* ---- Animation Loop ---- */

    _animate() {
        if (this.isDestroyed) return;

        const elapsed = (performance.now() - this.startTime) / 1000;

        // Smooth mouse interpolation (low-pass filter)
        this.smoothMouse.x += (this.mouse.x - this.smoothMouse.x) * 0.04;
        this.smoothMouse.y += (this.mouse.y - this.smoothMouse.y) * 0.04;

        // Entry scale animation (lerp from 0.001 → 1.0)
        this.currentScale += (this.scaleTarget - this.currentScale) * 0.035;
        this.sculpture.scale.setScalar(this.currentScale);

        // Morph the sphere vertices
        this._updateVertices(elapsed);

        // Sculpture rotation: slow autonomous drift + mouse influence
        this.sculpture.rotation.y = elapsed * 0.06 + this.smoothMouse.x * 0.4;
        this.sculpture.rotation.x = elapsed * 0.04 + this.smoothMouse.y * 0.25;

        // Camera parallax (subtle movement following mouse gaze)
        this.camera.position.x += (this.smoothMouse.x * 0.7 - this.camera.position.x) * 0.03;
        this.camera.position.y += (this.smoothMouse.y * 0.4 - this.camera.position.y) * 0.03;
        this.camera.lookAt(0, 0, 0);

        // Orbit lights around the sculpture
        for (const data of this.orbitLights) {
            const angle = elapsed * data.speed + data.offset;
            data.light.position.set(
                Math.cos(angle) * data.radius,
                Math.sin(angle * 0.7) * data.radius * data.yFactor,
                Math.sin(angle) * data.radius
            );
        }

        // Floating particles drift
        this.particles.rotation.y = elapsed * 0.015;
        this.particles.rotation.x = elapsed * 0.008;

        // Transition: ramp up bloom for a blinding exit effect
        if (this.isTransitioning) {
            this.transitionProgress = Math.min(1, this.transitionProgress + 0.012);
            this.bloomPass.strength = 0.6 + this.transitionProgress * 6;
        }

        // Render through post-processing pipeline
        this.composer.render();
        this.rafId = requestAnimationFrame(() => this._animate());
    }

    /* ---- Cleanup ---- */

    destroy() {
        this.isDestroyed = true;
        if (this.rafId) cancelAnimationFrame(this.rafId);
        window.removeEventListener('resize', this._onResize);
        window.removeEventListener('mousemove', this._onMouseMove);

        // Dispose Three.js resources
        this.sculptureGeometry.dispose();
        this.sculptureMaterial.dispose();
        this.particles.geometry.dispose();
        this.particles.material.dispose();
        if (this.envMap) this.envMap.dispose();

        this.renderer.dispose();
    }
}
