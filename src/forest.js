/**
 * forest.js — Bosque al Atardecer
 * Escena 3D optimizada en Three.js con iluminación cálida de atardecer,
 * rendimiento fluido y control del caballero idéntico a scene.html.
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

// ─── CONSTANTES Y RENDIMIENTO OPTIMIZADO ──────────────────────────
const WORLD_SIZE = 95;
const TREE_COUNT = 55;
const FIREFLY_COUNT = 70;
const GRASS_COUNT = 320;
const MUSHROOM_COUNT = 12;
const ROCK_COUNT = 14;

// ─── SHADER DE VIÑETEADO SUAVE ────────────────────────────────────
const VignetteShader = {
    uniforms: {
        tDiffuse: { value: null },
        offset: { value: 1.05 },
        darkness: { value: 0.75 }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float offset;
        uniform float darkness;
        varying vec2 vUv;
        void main() {
            vec4 texel = texture2D(tDiffuse, vUv);
            vec2 uv = (vUv - 0.5) * 2.0;
            float vig = clamp(1.0 - dot(uv, uv) * darkness * 0.4, 0.0, 1.0);
            vig = mix(vig, 1.0, offset * 0.4);
            gl_FragColor = texel * vig;
        }
    `
};

// ─── CONFIGURACIÓN DE ESCENA Y RENDERER ────────────────────────────
const canvas = document.getElementById('forest-canvas');
const scene = new THREE.Scene();

// Calima dorada / niebla atmosférica estilo Golden Hour
const FOG_COLOR = 0xdf9b62;
scene.fog = new THREE.FogExp2(FOG_COLOR, 0.0095);

// ─── RIG DEL JUGADOR Y CÁMARA ─────────────────────────────────────
const rig = new THREE.Group();
rig.position.set(0, 0, 5);
scene.add(rig);

// Cámara en tercera persona (control suave cinemático)
const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 250);
scene.add(camera);

const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance'
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.32; // Alta luminosidad y claridad Golden Hour
renderer.outputColorSpace = THREE.SRGBColorSpace;

// ─── POST-PROCESADO LIGERO ────────────────────────────────────────
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.55, 0.45, 0.84
);
composer.addPass(bloomPass);

const vignettePass = new ShaderPass(VignetteShader);
vignettePass.uniforms.offset.value = 1.15;
vignettePass.uniforms.darkness.value = 0.45;
composer.addPass(vignettePass);

// ─── CIELO Y SOL GOLDEN HOUR ──────────────────────────────────────

function createSunsetSkyTexture() {
    const skyCanvas = document.createElement('canvas');
    skyCanvas.width = 128;
    skyCanvas.height = 256;
    const ctx = skyCanvas.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0.0, '#3a6696');  // Azul cerúleo luminoso en el cenit
    grad.addColorStop(0.25, '#76859e'); // Transición suave hacia tonos cálidos
    grad.addColorStop(0.5, '#d98b58');  // Melocotón dorado
    grad.addColorStop(0.75, '#f7a840'); // Naranja ámbar radiante
    grad.addColorStop(1.0, '#ffd87a');  // Horizonte bañado en oro intenso
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 256);
    const texture = new THREE.CanvasTexture(skyCanvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

function createSunsetDome() {
    const skyGeo = new THREE.SphereGeometry(140, 32, 16);
    const skyMat = new THREE.MeshBasicMaterial({
        map: createSunsetSkyTexture(),
        side: THREE.BackSide,
        depthWrite: false
    });
    return new THREE.Mesh(skyGeo, skyMat);
}
scene.add(createSunsetDome());

function createSunsetSun() {
    const group = new THREE.Group();

    // Núcleo solar resplandeciente
    const sunGeo = new THREE.SphereGeometry(4.8, 24, 24);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xfffaee });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    group.add(sun);

    // Halo cálido interno
    const haloGeo = new THREE.SphereGeometry(8.5, 24, 24);
    const haloMat = new THREE.MeshBasicMaterial({
        color: 0xffaf38,
        transparent: true,
        opacity: 0.42,
        side: THREE.BackSide
    });
    group.add(new THREE.Mesh(haloGeo, haloMat));

    // Corona exterior dorada
    const outerHaloGeo = new THREE.SphereGeometry(15, 24, 24);
    const outerHaloMat = new THREE.MeshBasicMaterial({
        color: 0xff8818,
        transparent: true,
        opacity: 0.2,
        side: THREE.BackSide
    });
    group.add(new THREE.Mesh(outerHaloGeo, outerHaloMat));

    group.position.set(-40, 20, -50);
    return group;
}
scene.add(createSunsetSun());

// ─── ILUMINACIÓN RADIANTE GOLDEN HOUR ─────────────────────────────

// Luz hemisférica: cielo dorado cálido y rebote en tierra fértil
const hemiLight = new THREE.HemisphereLight(0xffd5a8, 0x563e26, 1.35);
scene.add(hemiLight);

// Luz ambiental cálida (sin sombras excesivamente oscuras)
const ambientLight = new THREE.AmbientLight(0x9a7252, 0.65);
scene.add(ambientLight);

// Sol directo Golden Hour (rayos dorados potentes con sombras suaves)
const sunLight = new THREE.DirectionalLight(0xffad54, 4.0);
sunLight.position.set(-40, 28, -50);
sunLight.castShadow = true;
sunLight.shadow.mapSize.set(1024, 1024);
sunLight.shadow.camera.near = 1;
sunLight.shadow.camera.far = 130;
sunLight.shadow.camera.left = -38;
sunLight.shadow.camera.right = 38;
sunLight.shadow.camera.top = 38;
sunLight.shadow.camera.bottom = -38;
sunLight.shadow.bias = -0.0003;
scene.add(sunLight);

// Luz de relleno crepuscular suave
const fillLight = new THREE.DirectionalLight(0xa594b8, 0.75);
fillLight.position.set(35, 22, 35);
scene.add(fillLight);

// Punto de luz en el claro central (la espada en la roca)
const clearingLight = new THREE.PointLight(0xffbe66, 1.8, 18);
clearingLight.position.set(0, 2, 0);
scene.add(clearingLight);

// ─── SUELO DEL BOSQUE ─────────────────────────────────────────────

function createGround() {
    const groundGeo = new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE, 36, 36);
    groundGeo.rotateX(-Math.PI / 2);

    const pos = groundGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const z = pos.getZ(i);
        const y = Math.sin(x * 0.1) * Math.cos(z * 0.12) * 0.25
            + Math.sin(x * 0.05 + z * 0.08) * 0.15;
        pos.setY(i, y);
    }
    groundGeo.computeVertexNormals();

    const groundMat = new THREE.MeshStandardMaterial({
        color: 0x4d4c28,
        roughness: 0.82,
        metalness: 0.04
    });

    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.receiveShadow = true;
    return ground;
}
scene.add(createGround());

// ─── ÁRBOLES PROCEDURALES OPTIMIZADOS ─────────────────────────────

const sharedTrunkGeo = new THREE.CylinderGeometry(0.12, 0.26, 3.4, 7);
sharedTrunkGeo.translate(0, 1.7, 0);

const sharedTrunkMat = new THREE.MeshStandardMaterial({
    color: 0x5a3d24,
    roughness: 0.86,
    metalness: 0.0
});

const sharedCanopyGeoLower = new THREE.IcosahedronGeometry(1.3, 1);
const sharedCanopyGeoUpper = new THREE.IcosahedronGeometry(1.0, 1);

const canopyColors = [
    new THREE.Color(0x486e28),
    new THREE.Color(0x5a8630),
    new THREE.Color(0x6e9c38)
];

const sharedCanopyMats = canopyColors.map(c => new THREE.MeshStandardMaterial({
    color: c,
    roughness: 0.8,
    metalness: 0.0
}));

function createTree(x, z, scale) {
    const group = new THREE.Group();

    const trunk = new THREE.Mesh(sharedTrunkGeo, sharedTrunkMat);
    trunk.scale.set(scale, scale, scale);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    group.add(trunk);

    const matIndex = Math.floor(Math.random() * sharedCanopyMats.length);
    const canopy1 = new THREE.Mesh(sharedCanopyGeoLower, sharedCanopyMats[matIndex]);
    canopy1.position.y = 3.2 * scale;
    canopy1.scale.set(scale, scale * 0.85, scale);
    canopy1.castShadow = true;
    canopy1.receiveShadow = true;
    group.add(canopy1);

    const canopy2 = new THREE.Mesh(sharedCanopyGeoUpper, sharedCanopyMats[(matIndex + 1) % sharedCanopyMats.length]);
    canopy2.position.y = 4.3 * scale;
    canopy2.scale.set(scale * 0.85, scale * 0.75, scale * 0.85);
    canopy2.castShadow = true;
    group.add(canopy2);

    group.position.set(x, 0, z);
    group.rotation.y = Math.random() * Math.PI * 2;
    return group;
}

function placeForest() {
    const treeGroup = new THREE.Group();
    const clearingRadius = 6.5;
    const pathWidth = 3.5;

    for (let i = 0; i < TREE_COUNT; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = clearingRadius + Math.random() * (WORLD_SIZE * 0.44 - clearingRadius);
        const x = Math.cos(angle) * dist;
        const z = Math.sin(angle) * dist;

        if (Math.abs(x) < pathWidth && z > -1 && z < 15) continue;

        const scale = 0.75 + Math.random() * 0.65;
        treeGroup.add(createTree(x, z, scale));
    }
    return treeGroup;
}
scene.add(placeForest());

// ─── HIERBA OPTIMIZADA (InstancedMesh) ────────────────────────────

function createGrass() {
    const bladeGeo = new THREE.PlaneGeometry(0.06, 0.45);
    bladeGeo.translate(0, 0.22, 0);

    const bladeMat = new THREE.MeshStandardMaterial({
        color: 0x5b7330,
        roughness: 0.8,
        side: THREE.DoubleSide
    });

    const instMesh = new THREE.InstancedMesh(bladeGeo, bladeMat, GRASS_COUNT);
    const dummy = new THREE.Object3D();

    for (let i = 0; i < GRASS_COUNT; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 2 + Math.random() * (WORLD_SIZE * 0.42);
        const x = Math.cos(angle) * dist;
        const z = Math.sin(angle) * dist;

        dummy.position.set(x, 0, z);
        dummy.rotation.y = Math.random() * Math.PI;
        dummy.rotation.z = (Math.random() - 0.5) * 0.3;
        const s = 0.7 + Math.random() * 0.6;
        dummy.scale.set(s, s, s);
        dummy.updateMatrix();

        instMesh.setMatrixAt(i, dummy.matrix);
    }
    instMesh.instanceMatrix.needsUpdate = true;
    instMesh.receiveShadow = true;
    return instMesh;
}
scene.add(createGrass());

// ─── ROCAS OPTIMIZADAS ────────────────────────────────────────────

const sharedRockGeo = new THREE.DodecahedronGeometry(1, 0);
const sharedRockMat = new THREE.MeshStandardMaterial({
    color: 0x686058,
    roughness: 0.92,
    metalness: 0.05
});

function placeRocks() {
    const g = new THREE.Group();
    for (let i = 0; i < ROCK_COUNT; i++) {
        const scale = 0.35 + Math.random() * 0.55;
        const rock = new THREE.Mesh(sharedRockGeo, sharedRockMat);
        const angle = Math.random() * Math.PI * 2;
        const dist = 3 + Math.random() * 26;

        rock.position.set(Math.cos(angle) * dist, scale * 0.35, Math.sin(angle) * dist);
        rock.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
        rock.scale.set(scale * (0.8 + Math.random() * 0.4), scale * 0.6, scale * (0.8 + Math.random() * 0.4));
        rock.castShadow = true;
        rock.receiveShadow = true;
        g.add(rock);
    }
    return g;
}
scene.add(placeRocks());

// ─── SETAS DEL BOSQUE ─────────────────────────────────────────────

const sharedStemGeo = new THREE.CylinderGeometry(0.04, 0.06, 0.35, 6);
const sharedStemMat = new THREE.MeshStandardMaterial({ color: 0x998c77, roughness: 0.8 });
const sharedCapGeo = new THREE.SphereGeometry(0.16, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.6);

const mushroomMats = [
    new THREE.MeshStandardMaterial({
        color: 0xff7733,
        emissive: 0xff6622,
        emissiveIntensity: 0.7,
        roughness: 0.5
    }),
    new THREE.MeshStandardMaterial({
        color: 0xffaa33,
        emissive: 0xff9922,
        emissiveIntensity: 0.7,
        roughness: 0.5
    })
];

function placeMushrooms() {
    const g = new THREE.Group();
    for (let i = 0; i < MUSHROOM_COUNT; i++) {
        const cluster = new THREE.Group();
        const angle = Math.random() * Math.PI * 2;
        const dist = 3 + Math.random() * 22;

        const stem = new THREE.Mesh(sharedStemGeo, sharedStemMat);
        stem.position.y = 0.17;
        cluster.add(stem);

        const capMat = mushroomMats[i % mushroomMats.length];
        const cap = new THREE.Mesh(sharedCapGeo, capMat);
        cap.position.y = 0.34;
        cluster.add(cap);

        cluster.position.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
        const s = 0.8 + Math.random() * 0.6;
        cluster.scale.set(s, s, s);
        g.add(cluster);
    }
    return g;
}
scene.add(placeMushrooms());

// ─── ESPADA EN LA ROCA ───────────────────────────────────────────

const gltfLoader = new GLTFLoader();
gltfLoader.load('assets/models/espada_en_roca.glb', (gltf) => {
    const sword = gltf.scene;
    sword.scale.set(1.4, 1.4, 1.4);
    sword.position.set(0, 0, 0);
    sword.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    scene.add(sword);

    const auraGeo = new THREE.CylinderGeometry(0.4, 0.9, 2.5, 16, 1, true);
    const auraMat = new THREE.MeshBasicMaterial({
        color: 0xffaa44,
        transparent: true,
        opacity: 0.1,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const aura = new THREE.Mesh(auraGeo, auraMat);
    aura.position.set(0, 1.25, 0);
    scene.add(aura);
});

// ─── LUCIÉRNAGAS DORADAS ──────────────────────────────────────────

const ffPositions = new Float32Array(FIREFLY_COUNT * 3);
const ffSpeeds = new Float32Array(FIREFLY_COUNT * 3);
const ffPhases = new Float32Array(FIREFLY_COUNT);

for (let i = 0; i < FIREFLY_COUNT; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * 28;
    ffPositions[i * 3] = Math.cos(angle) * dist;
    ffPositions[i * 3 + 1] = 0.5 + Math.random() * 3.5;
    ffPositions[i * 3 + 2] = Math.sin(angle) * dist;

    ffSpeeds[i * 3] = (Math.random() - 0.5) * 0.3;
    ffSpeeds[i * 3 + 1] = (Math.random() - 0.5) * 0.15;
    ffSpeeds[i * 3 + 2] = (Math.random() - 0.5) * 0.3;

    ffPhases[i] = Math.random() * Math.PI * 2;
}

const fireflyGeo = new THREE.BufferGeometry();
fireflyGeo.setAttribute('position', new THREE.BufferAttribute(ffPositions, 3));

const fireflyMat = new THREE.PointsMaterial({
    color: 0xffe67b, // Motas de polvo solar suspendidas en la luz dorada
    size: 0.22,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true
});

const fireflies = new THREE.Points(fireflyGeo, fireflyMat);
scene.add(fireflies);

// ─── BRUMA DE SUELO ───────────────────────────────────────────────

function createMist() {
    const group = new THREE.Group();
    const count = 12;

    for (let i = 0; i < count; i++) {
        const size = 3.5 + Math.random() * 3.5;
        const geo = new THREE.PlaneGeometry(size, size);
        const mat = new THREE.MeshBasicMaterial({
            color: 0xefa26e, // Bruma iluminada por los rayos dorados del sol
            transparent: true,
            opacity: 0.025,
            side: THREE.DoubleSide,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });
        const plane = new THREE.Mesh(geo, mat);
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * 24;
        plane.position.set(Math.cos(angle) * dist, 0.4 + Math.random() * 0.8, Math.sin(angle) * dist);
        plane.rotation.x = -Math.PI / 2;
        plane.userData.speed = 0.0006 + Math.random() * 0.0008;
        group.add(plane);
    }
    return group;
}
const mistGroup = createMist();
scene.add(mistGroup);

// ─── PORTAL DE REGRESO AL ESTUDIO ─────────────────────────────────

function createPortal() {
    const group = new THREE.Group();

    const archMat = new THREE.MeshStandardMaterial({
        color: 0x3a2e36,
        roughness: 0.85,
        metalness: 0.1
    });

    const pillarGeo = new THREE.CylinderGeometry(0.24, 0.28, 3, 8);
    const leftPillar = new THREE.Mesh(pillarGeo, archMat);
    leftPillar.position.set(-1.2, 1.5, 0);
    leftPillar.castShadow = true;
    group.add(leftPillar);

    const rightPillar = new THREE.Mesh(pillarGeo, archMat);
    rightPillar.position.set(1.2, 1.5, 0);
    rightPillar.castShadow = true;
    group.add(rightPillar);

    const archGeo = new THREE.TorusGeometry(1.2, 0.24, 8, 16, Math.PI);
    const arch = new THREE.Mesh(archGeo, archMat);
    arch.position.set(0, 3, 0);
    arch.rotation.z = Math.PI;
    arch.castShadow = true;
    group.add(arch);

    const portalGeo = new THREE.CircleGeometry(1.1, 24);
    const portalMat = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uColor1: { value: new THREE.Color(0x882255) },
            uColor2: { value: new THREE.Color(0xff8833) }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float uTime;
            uniform vec3 uColor1;
            uniform vec3 uColor2;
            varying vec2 vUv;

            void main() {
                vec2 center = vUv - 0.5;
                float dist = length(center);
                float swirl = atan(center.y, center.x) + uTime * 0.6;
                float pattern = sin(swirl * 4.0 + dist * 9.0 - uTime * 2.0) * 0.5 + 0.5;
                vec3 color = mix(uColor1, uColor2, pattern);

                float edge = smoothstep(0.5, 0.3, dist);
                float alpha = edge * (0.55 + 0.25 * sin(uTime * 1.5));

                gl_FragColor = vec4(color * 1.6, alpha);
            }
        `,
        transparent: true,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const portalMesh = new THREE.Mesh(portalGeo, portalMat);
    portalMesh.position.set(0, 1.8, 0.05);
    portalMesh.userData.material = portalMat;
    group.add(portalMesh);

    const portalLight = new THREE.PointLight(0xff6633, 2, 8);
    portalLight.position.set(0, 2, 0.8);
    group.add(portalLight);

    group.position.set(0, 0, 12);
    group.rotation.y = Math.PI;

    return group;
}

const portal = createPortal();
scene.add(portal);

// ─── CARGA DEL CABALLERO (Como hijo del rig) ──────────────────────

let character = null;
let mixer = null;
let idleAction = null;
let walkAction = null;
let isMoving = false;

// Rotación del modelo relativa al rig
let targetRotation = 180 * (Math.PI / 180); // Inicia mirando hacia el frente (180 deg) igual que scene.html

function updateLoadingProgress(percent) {
    const fill = document.getElementById('forest-loader-fill');
    if (fill) fill.style.width = percent + '%';
}
updateLoadingProgress(35);

gltfLoader.load('assets/characters/caballero3.glb', (gltf) => {
    character = gltf.scene;
    character.scale.set(1, 1, 1);
    character.position.set(0, 0, 0);
    character.rotation.set(0, targetRotation, 0); // 180 grados igual que scene.html
    character.castShadow = true;
    character.receiveShadow = true;

    character.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    mixer = new THREE.AnimationMixer(character);
    const animations = gltf.animations;

    const idleClip = animations.find(a => a.name.toLowerCase().includes('idle')) || animations[0];
    const walkClip = animations.find(a => a.name.toLowerCase().includes('walk') || a.name.toLowerCase().includes('caminar')) || animations[1];

    if (idleClip) {
        idleAction = mixer.clipAction(idleClip);
        idleAction.play();
    }
    if (walkClip) {
        walkAction = mixer.clipAction(walkClip);
    }

    rig.add(character);
    updateLoadingProgress(100);

    const loader = document.getElementById('forest-loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => { loader.style.display = 'none'; }, 600);
    }
});

// ─── CONTROLES DE ENTRADA Y CÁMARA (Idénticos a scene.html) ───────

const keys = {
    KeyW: false, KeyA: false, KeyS: false, KeyD: false,
    ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false
};

window.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.code)) keys[e.code] = true;
});
window.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.code)) keys[e.code] = false;
});

// ─── CONTROL DE CÁMARA SUAVE Y NATURAL (Sin mareos ni ejes invertidos) ──
let isPointerLocked = false;
let isDragging = false;
let prevMouseX = 0;
let prevMouseY = 0;

let targetYaw = 0;          // 0 = mirando hacia el frente (-Z) desde atrás (+Z)
let currentYaw = 0;
let targetPitch = 0.18;     // Ángulo vertical inicial cómodo y agradable
let currentPitch = 0.18;

const CAM_DISTANCE = 3.0;   // Distancia óptima que da buena perspectiva sin marear
const LOOK_SENS_LOCKED = 0.0020;
const LOOK_SENS_DRAG = 0.0030;
const DAMPING = 0.09;       // Amortiguación fluida para eliminar micro-tirones y mareo

canvas.addEventListener('click', () => {
    if (!isPointerLocked) {
        canvas.requestPointerLock().catch(() => {});
    }
});

document.addEventListener('pointerlockchange', () => {
    isPointerLocked = (document.pointerLockElement === canvas);
});

canvas.addEventListener('mousedown', (e) => {
    if (!isPointerLocked) {
        isDragging = true;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
    }
});

window.addEventListener('mouseup', () => {
    isDragging = false;
});

window.addEventListener('mousemove', (e) => {
    let movementX = 0;
    let movementY = 0;

    if (isPointerLocked) {
        movementX = e.movementX;
        movementY = e.movementY;
    } else if (isDragging) {
        movementX = e.clientX - prevMouseX;
        movementY = e.clientY - prevMouseY;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
    } else {
        return;
    }

    const sens = isPointerLocked ? LOOK_SENS_LOCKED : LOOK_SENS_DRAG;

    // Ejes naturales y directos:
    // Mover a la derecha -> la vista gira a la derecha
    // Mover hacia arriba -> la vista mira hacia arriba (no al revés)
    targetYaw -= movementX * sens;
    targetPitch -= movementY * sens;

    // Rango vertical seguro: evita que la cámara se meta bajo el suelo o se desoriente
    targetPitch = Math.max(-0.25, Math.min(0.55, targetPitch));
});

// Soporte táctil móvil con la misma suavidad y ejes naturales
let lastTouchX = 0;
let lastTouchY = 0;
canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
    }
}, { passive: true });

canvas.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1) {
        const dx = e.touches[0].clientX - lastTouchX;
        const dy = e.touches[0].clientY - lastTouchY;
        const touchSens = 0.003;
        targetYaw -= dx * touchSens;
        targetPitch -= dy * touchSens;
        targetPitch = Math.max(-0.25, Math.min(0.55, targetPitch));
        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
    }
}, { passive: true });

// ─── MÚSICA DE FONDO (The Hush of the Game) ───────────────────────
const bgMusic = document.getElementById('forest-bg-music');
const soundBtn = document.getElementById('toggle-sound');
const soundIcon = document.getElementById('sound-icon');
let isMuted = false;
let musicStarted = false;

function playForestMusic() {
    if (!bgMusic || musicStarted || isMuted) return;
    bgMusic.volume = 0;
    const playPromise = bgMusic.play();
    if (playPromise !== undefined) {
        playPromise.then(() => {
            musicStarted = true;
            let vol = 0;
            const targetVol = 0.45;
            const fadeTimer = setInterval(() => {
                if (vol < targetVol) {
                    vol += 0.02;
                    bgMusic.volume = Math.min(vol, targetVol);
                } else {
                    clearInterval(fadeTimer);
                }
            }, 60);
        }).catch(() => {
            // Requiere interacción previa del usuario
        });
    }
}

// Iniciar música en la primera interacción si el navegador bloquea autoplay
['click', 'keydown', 'mousedown', 'touchstart'].forEach(evt => {
    window.addEventListener(evt, () => {
        playForestMusic();
    }, { once: true });
});

setTimeout(() => {
    playForestMusic();
}, 400);

if (soundBtn && bgMusic) {
    soundBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isMuted) {
            isMuted = false;
            bgMusic.muted = false;
            if (soundIcon) soundIcon.textContent = 'volume_up';
            playForestMusic();
        } else {
            isMuted = true;
            bgMusic.muted = true;
            if (soundIcon) soundIcon.textContent = 'volume_off';
        }
    });
}

function stopForestMusic() {
    if (!bgMusic) return;
    let vol = bgMusic.volume;
    const fadeOut = setInterval(() => {
        if (vol > 0.05) {
            vol -= 0.05;
            bgMusic.volume = Math.max(0, vol);
        } else {
            bgMusic.pause();
            clearInterval(fadeOut);
        }
    }, 40);
}

// ─── TRANSICIÓN DEL PORTAL AL ESTUDIO ─────────────────────────────

let portalTriggered = false;

function checkPortalProximity() {
    if (!character || portalTriggered) return;

    const dist = rig.position.distanceTo(portal.position);
    if (dist < 2.4) {
        portalTriggered = true;
        stopForestMusic();
        const overlay = document.getElementById('transition-overlay');
        if (overlay) {
            overlay.classList.add('active');
            setTimeout(() => {
                window.location.href = 'scene.html';
            }, 750);
        }
    }
}

const backBtn = document.getElementById('back-to-studio');
if (backBtn) {
    backBtn.addEventListener('click', () => {
        stopForestMusic();
        const overlay = document.getElementById('transition-overlay');
        if (overlay) {
            overlay.classList.add('active');
            setTimeout(() => {
                window.location.href = 'scene.html';
            }, 750);
        }
    });
}

// ─── BUCLE PRINCIPAL DE ANIMACIÓN ─────────────────────────────────

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const delta = Math.min(clock.getDelta(), 0.1);
    const elapsed = clock.elapsedTime;

    // ─── ACTUALIZACIÓN SUAVE DE LA CÁMARA (Amortiguación cinemática) ───
    currentYaw += (targetYaw - currentYaw) * DAMPING;
    currentPitch += (targetPitch - currentPitch) * DAMPING;

    const cosPitch = Math.cos(currentPitch);
    const sinPitch = Math.sin(currentPitch);

    // Punto focal en el caballero (torso/hombros)
    const focusX = rig.position.x;
    const focusY = rig.position.y + 1.35;
    const focusZ = rig.position.z;

    // Posición orbital suave de la cámara
    camera.position.x = focusX + Math.sin(currentYaw) * CAM_DISTANCE * cosPitch;
    camera.position.z = focusZ + Math.cos(currentYaw) * CAM_DISTANCE * cosPitch;
    camera.position.y = Math.max(0.45, focusY + CAM_DISTANCE * sinPitch * 0.7 + 0.35);

    // Punto de mira con inclinación vertical natural
    const lookAtY = focusY + sinPitch * 1.3;
    camera.lookAt(focusX, lookAtY, focusZ);

    // ─── MOVIMIENTO DEL CABALLERO ─────────────────────────────────────
    let dx = 0;
    let dz = 0;

    if (keys.KeyW || keys.ArrowUp) dz -= 1;
    if (keys.KeyA || keys.ArrowLeft) dx -= 1;
    if (keys.KeyS || keys.ArrowDown) dz += 1;
    if (keys.KeyD || keys.ArrowRight) dx += 1;

    const isMovingInput = Math.abs(dx) > 0.1 || Math.abs(dz) > 0.1;

    if (isMovingInput) {
        if (!isMoving) {
            isMoving = true;
            if (walkAction && idleAction) {
                walkAction.reset();
                walkAction.crossFadeFrom(idleAction, 0.2, true);
                walkAction.play();
            }
        }

        // Vector frontal hacia donde mira la cámara en el plano horizontal XZ
        const forward = new THREE.Vector3(focusX - camera.position.x, 0, focusZ - camera.position.z).normalize();
        const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

        // Vector de desplazamiento relativo a la vista
        const moveDir = new THREE.Vector3();
        moveDir.addScaledVector(forward, -dz);
        moveDir.addScaledVector(right, dx);

        if (moveDir.lengthSq() > 0) {
            moveDir.normalize();

            // Ángulo objetivo de rotación hacia el movimiento
            targetRotation = Math.atan2(moveDir.x, moveDir.z);

            // Velocidad constante idéntica a scene.html: 2.5
            const speed = 2.5;
            const factor = speed * delta;
            rig.position.x += moveDir.x * factor;
            rig.position.z += moveDir.z * factor;

            // Límites del mundo
            const bound = WORLD_SIZE / 2 - 2;
            rig.position.x = Math.max(-bound, Math.min(bound, rig.position.x));
            rig.position.z = Math.max(-bound, Math.min(bound, rig.position.z));
        }
    } else {
        if (isMoving) {
            isMoving = false;
            if (walkAction && idleAction) {
                idleAction.reset();
                idleAction.crossFadeFrom(walkAction, 0.2, true);
                idleAction.play();
            }
        }
    }

    // Rotación suave del modelo del personaje (rotationSpeed = 0.1 exacto a character-controller.js)
    if (character) {
        let currentRotation = character.rotation.y;
        let diff = targetRotation - currentRotation;
        while (diff > Math.PI) diff -= 2 * Math.PI;
        while (diff < -Math.PI) diff += 2 * Math.PI;

        if (Math.abs(diff) > 0.001) {
            character.rotation.y += diff * 0.1; // 0.1 = smooth interpolation
        }
    }

    if (mixer) mixer.update(delta);

    // Animación de luciérnagas doradas
    const ffPosArr = fireflies.geometry.attributes.position.array;
    for (let i = 0; i < FIREFLY_COUNT; i++) {
        const ph = ffPhases[i];
        ffPosArr[i * 3] += Math.sin(elapsed * 0.3 + ph) * ffSpeeds[i * 3] * delta;
        ffPosArr[i * 3 + 1] += Math.sin(elapsed * 0.5 + ph * 2) * ffSpeeds[i * 3 + 1] * delta;
        ffPosArr[i * 3 + 2] += Math.cos(elapsed * 0.4 + ph) * ffSpeeds[i * 3 + 2] * delta;

        if (ffPosArr[i * 3 + 1] < 0.3) ffPosArr[i * 3 + 1] = 0.3;
        if (ffPosArr[i * 3 + 1] > 5) ffPosArr[i * 3 + 1] = 5;
    }
    fireflies.geometry.attributes.position.needsUpdate = true;

    // Movimiento suave de la bruma
    mistGroup.children.forEach((m) => {
        m.rotation.z += m.userData.speed;
    });

    // Animación del portal
    portal.children.forEach((child) => {
        if (child.userData.material) {
            child.userData.material.uniforms.uTime.value = elapsed;
        }
    });

    // Comprobación de proximidad al portal
    checkPortalProximity();

    // Render con post-procesado
    composer.render();
}

setTimeout(() => {
    updateLoadingProgress(60);
    animate();
}, 80);

// ─── REDIMENSIÓN DE PANTALLA ──────────────────────────────────────

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});
