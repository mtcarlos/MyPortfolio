// Character Controller Component
// Handles movement and smooth rotation
import { audioManager } from '../audio-manager.js';

export function registerCharacterController() {
    AFRAME.registerComponent('character-controller', {
        schema: {
            speed: { type: 'number', default: 0.1 },
            rotationSpeed: { type: 'number', default: 0.1 } // Factor for interpolation (0.1 = smooth, 1 = instant)
        },

        init: function () {
            this.keys = {
                KeyW: false, KeyA: false, KeyS: false, KeyD: false,
                ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false
            };

            this.isMoving = false;
            this.currentRotation = 180 * (Math.PI / 180); // Start facing forward (180 deg)
            this.targetRotation = this.currentRotation;

            // Audio State
            this.stepTimer = 0;
            this.stepInterval = 500; // ms between steps

            // Bind methods
            this.onKeyDown = this.onKeyDown.bind(this);
            this.onKeyUp = this.onKeyUp.bind(this);

            window.addEventListener('keydown', this.onKeyDown);
            window.addEventListener('keyup', this.onKeyUp);

            // Initialize Model Reference
            this.model = this.el.querySelector('#character');
        },

        remove: function () {
            window.removeEventListener('keydown', this.onKeyDown);
            window.removeEventListener('keyup', this.onKeyUp);
        },

        onKeyDown: function (e) {
            if (Object.keys(this.keys).includes(e.code)) {
                this.keys[e.code] = true;
            }
        },

        onKeyUp: function (e) {
            if (Object.keys(this.keys).includes(e.code)) {
                this.keys[e.code] = false;
            }
        },

        tick: function (time, timeDelta) {
            if (this.enabled === false) return; // Skip if disabled
            // Wait for body to be initialized


            // Keyboard Input
            let dx = 0;
            let dz = 0;

            if (this.keys.KeyW || this.keys.ArrowUp) dz -= 1;
            if (this.keys.KeyA || this.keys.ArrowLeft) dx -= 1;
            if (this.keys.KeyS || this.keys.ArrowDown) dz += 1;
            if (this.keys.KeyD || this.keys.ArrowRight) dx += 1;

            // Clone of original logic, assuming joystick is gone.
            // But if window.joystickInput exists (which is removed in styles.css but maybe referenced here?)
            // I'll keep it clean as per original.

            const isMoving = Math.abs(dx) > 0.1 || Math.abs(dz) > 0.1;

            if (isMoving) {
                // Animation
                if (!this.isMoving) {
                    this.model.setAttribute('animation-mixer', 'clip: Walking; crossFadeDuration: 0.2; loop: repeat');
                    this.isMoving = true;
                }

                // Audio: Footsteps
                this.stepTimer += timeDelta;
                if (this.stepTimer > this.stepInterval) {
                    audioManager.play('step', { volume: 0.4, variation: 0.2 });
                    this.stepTimer = 0;
                }

                // Calculate Camera Direction using explicit forward/right vectors
                const cameraEl = this.el.sceneEl.querySelector('[camera]');
                if (!cameraEl) return;

                const quaternion = new THREE.Quaternion();
                cameraEl.object3D.getWorldQuaternion(quaternion);

                // Forward direction relative to camera (0, 0, -1)
                const forward = new THREE.Vector3(0, 0, -1);
                forward.applyQuaternion(quaternion);
                forward.y = 0; // Flatten
                forward.normalize();

                // Right direction relative to camera (1, 0, 0)
                const right = new THREE.Vector3(1, 0, 0);
                right.applyQuaternion(quaternion);
                right.y = 0; // Flatten
                right.normalize();

                // Construct movement vector
                const moveDir = new THREE.Vector3();

                // dz is -1 for W (Forward), 1 for S (Backward)
                // We want W to move along 'forward' vector
                moveDir.addScaledVector(forward, -dz);

                // dx is -1 for A (Left), 1 for D (Right)
                // We want D to move along 'right' vector
                moveDir.addScaledVector(right, dx);

                if (moveDir.lengthSq() > 0) {
                    moveDir.normalize();

                    // Rotate character model to face moveDir
                    // We calculate the angle in world space. Since the rig doesn't rotate Y (we assume), 
                    // this angle applies directly to the child model.
                    this.targetRotation = Math.atan2(moveDir.x, moveDir.z);

                    // Movement Logic
                    const speed = 2.5;
                    if (this.el.body) {
                        // Physics-based movement
                        this.el.body.velocity.x = moveDir.x * speed;
                        this.el.body.velocity.z = moveDir.z * speed;
                    } else {
                        // Fallback: Direct Position Manipulation (No Physics)
                        const currentPos = this.el.object3D.position;
                        // Scale movement by delta time for smooth non-physics movement
                        const factor = speed * (timeDelta / 1000);
                        currentPos.x += moveDir.x * factor;
                        currentPos.z += moveDir.z * factor;
                    }
                }

                // Smooth Rotation of the MODEL
                if (this.model) {
                    let currentRotation = this.model.object3D.rotation.y;
                    let diff = this.targetRotation - currentRotation;
                    while (diff > Math.PI) diff -= 2 * Math.PI;
                    while (diff < -Math.PI) diff += 2 * Math.PI;

                    if (Math.abs(diff) > 0.001) {
                        this.model.object3D.rotation.y += diff * this.data.rotationSpeed;
                    }
                }
            } else {
                // Idle State (No Movement Input)
                if (this.isMoving) {
                    this.model.setAttribute('animation-mixer', 'clip: Idle; crossFadeDuration: 0.2; loop: repeat');
                    this.isMoving = false;
                    this.stepTimer = this.stepInterval;
                }

                // Stop movement
                if (this.el.body) {
                    this.el.body.velocity.x = 0;
                    this.el.body.velocity.z = 0;
                }
            }
        }
    });
}
