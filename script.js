document.addEventListener('DOMContentLoaded', () => {
    const uiLayer = document.getElementById('ui-layer');
    const closeBtn = document.getElementById('close-btn');
    const infoTitle = document.getElementById('info-title');
    const infoText = document.getElementById('info-text');

    // Close the UI overlay
    closeBtn.addEventListener('click', () => {
        uiLayer.classList.add('hidden');
    });

    // Add click event listeners to all interactive objects in the scene
    // We delegate this or attach to specific entities
    // A-Frame entities with class 'clickable'
    const clickables = document.querySelectorAll('.clickable');

    clickables.forEach(el => {
        el.addEventListener('click', function (evt) {
            // Get data attributes
            const title = this.getAttribute('data-title');
            const text = this.getAttribute('data-text');

            if (title && text) {
                // Update UI content
                infoTitle.textContent = title;
                infoText.textContent = text;

                // Show UI
                uiLayer.classList.remove('hidden');
            }
        });

        // Optional: Add hover animation or scale eeffect
        el.addEventListener('mouseenter', function () {
            this.setAttribute('scale', '1.1 1.1 1.1');
            this.setAttribute('material', 'opacity', 0.8);
        });

        el.addEventListener('mouseleave', function () {
            this.setAttribute('scale', '1 1 1');
            this.setAttribute('material', 'opacity', 1.0);
        });
    });
});

// Register custom component for character animation and rotation control
AFRAME.registerComponent('character-controller', {
    init: function () {
        this.el = this.el;
        this.keys = {
            w: false, a: false, s: false, d: false,
            ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false
        };

        this.isMoving = false;

        // Bind methods to access 'this'
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);

        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('keyup', this.onKeyUp);
    },

    remove: function () {
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('keyup', this.onKeyUp);
    },

    onKeyDown: function (e) {
        if (Object.keys(this.keys).includes(e.key)) {
            this.keys[e.key] = true;
        }
    },

    onKeyUp: function (e) {
        if (Object.keys(this.keys).includes(e.key)) {
            this.keys[e.key] = false;
        }
    },

    tick: function (time, timeDelta) {
        // Determine movement direction
        let dx = 0;
        let dz = 0;

        // In A-Frame/Three.js:
        // -Z is Forward (W)
        // +Z is Backward (S)
        // -X is Left (A)
        // +X is Right (D)

        if (this.keys.w || this.keys.ArrowUp) dz -= 1;
        if (this.keys.s || this.keys.ArrowDown) dz += 1;
        if (this.keys.a || this.keys.ArrowLeft) dx -= 1;
        if (this.keys.d || this.keys.ArrowRight) dx += 1;

        const isMoving = dx !== 0 || dz !== 0;

        if (isMoving) {
            // Apply rotation
            // atan2(dx, dz) gives angle in radians where 0 is +Z (Back), PI is -Z (Forward)
            // This matches the coordinate system where 0 rotation faces +Z.
            const targetRotation = Math.atan2(dx, dz);

            // Smoothly rotate or snap? User asked for "rotando", snapping is okay for now.
            this.el.object3D.rotation.y = targetRotation;

            if (!this.isMoving) {
                // Start walking animation
                this.el.setAttribute('animation-mixer', 'clip: Walking; crossFadeDuration: 0.3; loop: repeat');
                this.isMoving = true;
            }
        } else {
            if (this.isMoving) {
                // Stop walking animation
                this.el.setAttribute('animation-mixer', 'clip: Idle; crossFadeDuration: 0.3; loop: repeat');
                this.isMoving = false;
            }
        }
    }
});
