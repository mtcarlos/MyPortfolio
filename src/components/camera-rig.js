// Camera Rig Component
// Prevents camera from clipping through walls by raycasting from target to camera position
export function registerCameraRig() {
    AFRAME.registerComponent('smart-camera', {
        schema: {
            target: { type: 'selector' },
            distance: { type: 'number', default: 2.5 },
            height: { type: 'number', default: 1.7 }
        },

        init: function () {
            // Find the actual camera entity (which might be a child of a boom)
            this.cameraEl = this.el.querySelector('[camera]');
            this.cameraBoom = this.el.querySelector('#camera-boom');
            this.raycaster = new THREE.Raycaster();
            this.direction = new THREE.Vector3();
            this.targetPos = new THREE.Vector3();
        },

        tick: function () {
            if (!this.data.target || !this.cameraEl) return;

            // Get target position (Character)
            this.data.target.object3D.getWorldPosition(this.targetPos);
            // Adjust for height (Look at the upper back/head area)
            this.targetPos.y += 1.4;

            const cameraWorldPos = new THREE.Vector3();
            this.cameraEl.object3D.getWorldPosition(cameraWorldPos);

            this.direction.subVectors(cameraWorldPos, this.targetPos).normalize();
            const distance = this.targetPos.distanceTo(cameraWorldPos);

            this.raycaster.set(this.targetPos, this.direction);

            // Intersect with walls
            // We only check objects that are explicitly marked as environment/collidable
            const els = document.querySelectorAll('.collidable, [static-body], a-plane, a-box[static-body]');
            const objects = Array.from(els).map(el => el.object3D);

            const intersects = this.raycaster.intersectObjects(objects, true);

            // Minimum distance to prevent clipping into character (1.0 meter)
            const minDistance = 0.5;
            // Maximum distance (the default offset)
            const maxDistance = this.data.distance;

            let targetDist = maxDistance;

            if (intersects.length > 0) {
                // Check if the wall is between character and camera
                const intersectDist = intersects[0].distance;
                if (intersectDist < maxDistance) {
                    // Pull camera in, but clamp to minDistance
                    targetDist = Math.max(minDistance, intersectDist - 0.2);
                }
            }

            // Smoothly interpolate current Z to target Z for less jitter
            const currentZ = this.cameraEl.object3D.position.z;
            this.cameraEl.object3D.position.z += (targetDist - currentZ) * 0.1;
        }
    });
}
