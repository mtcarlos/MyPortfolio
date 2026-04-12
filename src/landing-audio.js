/**
 * Landing Audio — Procedural Cinematic Sound v3
 * 
 * Zero audio files. Everything generated with Web Audio API.
 * Features: reverb via convolution, sub-bass rumble, keystroke sounds,
 * pitch-bending hover, crystalline chime with shimmer harmonics.
 * Muted by default — user opts in.
 */

export class LandingAudio {
    constructor() {
        this.ctx = null;
        this.enabled = false;
        this.masterGain = null;
        this.dryGain = null;
        this.reverbGain = null;
        this.convolver = null;
        this.droneOsc = null;
        this.droneGain = null;
    }

    _ensureContext() {
        if (this.ctx) return;
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0;
        this.masterGain.connect(this.ctx.destination);

        // Create reverb chain
        this._createReverb();
    }

    /**
     * Generate a synthetic impulse response for spatial reverb
     */
    _createReverb() {
        this.convolver = this.ctx.createConvolver();
        const rate = this.ctx.sampleRate;
        const length = rate * 2; // 2-second reverb tail
        const impulse = this.ctx.createBuffer(2, length, rate);

        for (let channel = 0; channel < 2; channel++) {
            const data = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.8);
            }
        }

        this.convolver.buffer = impulse;

        // Dry path (direct signal)
        this.dryGain = this.ctx.createGain();
        this.dryGain.gain.value = 0.7;
        this.dryGain.connect(this.masterGain);

        // Wet path (reverb)
        this.reverbGain = this.ctx.createGain();
        this.reverbGain.gain.value = 0.3;
        this.convolver.connect(this.reverbGain);
        this.reverbGain.connect(this.masterGain);
    }

    /**
     * Route a node through both dry and reverb paths
     */
    _connectWithReverb(node) {
        node.connect(this.dryGain);
        node.connect(this.convolver);
    }

    enable() {
        this._ensureContext();
        this.enabled = true;
        this.masterGain.gain.linearRampToValueAtTime(1, this.ctx.currentTime + 0.3);
    }

    disable() {
        if (!this.ctx) return;
        this.enabled = false;
        this.masterGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3);
    }

    toggle() {
        if (this.enabled) {
            this.disable();
        } else {
            this.enable();
        }
        return this.enabled;
    }

    /**
     * Start ambient drone with sub-bass rumble
     */
    startDrone() {
        this._ensureContext();

        // Sub-bass rumble (30Hz)
        const sub = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        const subFilter = this.ctx.createBiquadFilter();

        sub.type = 'sine';
        sub.frequency.value = 30;
        subFilter.type = 'lowpass';
        subFilter.frequency.value = 50;

        subGain.gain.value = 0;
        subGain.gain.linearRampToValueAtTime(0.06, this.ctx.currentTime + 2);
        subGain.gain.linearRampToValueAtTime(0.02, this.ctx.currentTime + 4);

        sub.connect(subFilter);
        subFilter.connect(subGain);
        subGain.connect(this.masterGain);
        sub.start();

        // Main drone (A1 = 55Hz)
        this.droneOsc = this.ctx.createOscillator();
        this.droneGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        this.droneOsc.type = 'sine';
        this.droneOsc.frequency.value = 55;

        filter.type = 'lowpass';
        filter.frequency.value = 120;
        filter.Q.value = 1;

        this.droneGain.gain.value = 0;
        this.droneGain.gain.linearRampToValueAtTime(0.04, this.ctx.currentTime + 3);

        this.droneOsc.connect(filter);
        filter.connect(this.droneGain);
        this._connectWithReverb(this.droneGain);
        this.droneOsc.start();

        // Second harmonic for depth (perfect fifth above)
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.value = 82.5;
        gain2.gain.value = 0;
        gain2.gain.linearRampToValueAtTime(0.015, this.ctx.currentTime + 4);
        osc2.connect(gain2);
        this._connectWithReverb(gain2);
        osc2.start();
    }

    /**
     * Subtle mechanical keystroke for boot line typing
     */
    playKeystroke() {
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        // Randomized mechanical key click
        const types = ['square', 'sawtooth'];
        osc.type = types[Math.floor(Math.random() * types.length)];
        osc.frequency.value = 2500 + Math.random() * 3000;

        filter.type = 'highpass';
        filter.frequency.value = 1800;
        filter.Q.value = 0.5;

        const duration = 0.02 + Math.random() * 0.015;
        gain.gain.value = 0.012 + Math.random() * 0.008;
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.dryGain); // Keystrokes stay dry, no reverb
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    /**
     * Short tick/click for boot line start
     */
    playTick() {
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.value = 800 + Math.random() * 400;

        gain.gain.value = 0.06;
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.08);
    }

    /**
     * Hover tone with subtle pitch bend
     */
    playHover() {
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.value = 440;
        osc.frequency.linearRampToValueAtTime(480, this.ctx.currentTime + 0.1);

        gain.gain.value = 0.035;
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

        osc.connect(gain);
        this._connectWithReverb(gain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.2);
    }

    /**
     * Whoosh + rising tone for launch transition
     */
    playLaunch() {
        if (!this.ctx) return;

        // Rising tone
        const riseOsc = this.ctx.createOscillator();
        const riseGain = this.ctx.createGain();
        riseOsc.type = 'sine';
        riseOsc.frequency.value = 200;
        riseOsc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.7);
        riseGain.gain.value = 0.08;
        riseGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.8);
        riseOsc.connect(riseGain);
        this._connectWithReverb(riseGain);
        riseOsc.start();
        riseOsc.stop(this.ctx.currentTime + 0.8);

        // Whoosh noise
        const bufferSize = this.ctx.sampleRate * 0.8;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }

        const source = this.ctx.createBufferSource();
        source.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 300;
        filter.frequency.linearRampToValueAtTime(2000, this.ctx.currentTime + 0.6);
        filter.Q.value = 2;

        const gain = this.ctx.createGain();
        gain.gain.value = 0.12;
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.8);

        source.connect(filter);
        filter.connect(gain);
        this._connectWithReverb(gain);
        source.start();
    }

    /**
     * Crystalline confirmation chime with shimmer harmonics
     */
    playChime() {
        if (!this.ctx) return;

        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        const now = this.ctx.currentTime;

        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.value = freq;

            const start = now + i * 0.1;
            gain.gain.setValueAtTime(0, start);
            gain.gain.linearRampToValueAtTime(0.035, start + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.8);

            osc.connect(gain);
            this._connectWithReverb(gain);
            osc.start(start);
            osc.stop(start + 0.8);
        });

        // Gentle shimmer harmonic (C7)
        const shimmer = this.ctx.createOscillator();
        const shimmerGain = this.ctx.createGain();
        shimmer.type = 'sine';
        shimmer.frequency.value = 2093;
        shimmerGain.gain.setValueAtTime(0, now + 0.3);
        shimmerGain.gain.linearRampToValueAtTime(0.008, now + 0.4);
        shimmerGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
        shimmer.connect(shimmerGain);
        this._connectWithReverb(shimmerGain);
        shimmer.start(now + 0.3);
        shimmer.stop(now + 1.2);
    }

    destroy() {
        if (this.droneOsc) {
            try { this.droneOsc.stop(); } catch (e) { /* already stopped */ }
        }
        if (this.ctx) {
            this.ctx.close();
        }
    }
}
