/**
 * Landing Audio — Procedural OS Sound
 * 
 * Zero audio files. Everything generated with Web Audio API.
 * Clean, dry, Apple-like. No cinematic drone or sub-bass rumble.
 * Features: keystroke clicks, ticks, hover tones, crystalline chime.
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
    }

    _ensureContext() {
        if (this.ctx) return;
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0;
        this.masterGain.connect(this.ctx.destination);

        this._createReverb();
    }

    /**
     * Short, dry reverb — Apple-like spatial quality
     */
    _createReverb() {
        this.convolver = this.ctx.createConvolver();
        const rate = this.ctx.sampleRate;
        const length = rate * 0.6; // 0.6-second tail — short and dry
        const impulse = this.ctx.createBuffer(2, length, rate);

        for (let channel = 0; channel < 2; channel++) {
            const data = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3.5);
            }
        }

        this.convolver.buffer = impulse;

        // Dry path (direct signal) — dominant
        this.dryGain = this.ctx.createGain();
        this.dryGain.gain.value = 0.8;
        this.dryGain.connect(this.masterGain);

        // Wet path (reverb) — subtle
        this.reverbGain = this.ctx.createGain();
        this.reverbGain.gain.value = 0.15;
        this.convolver.connect(this.reverbGain);
        this.reverbGain.connect(this.masterGain);
    }

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
     * Subtle mechanical keystroke for boot line typing
     */
    playKeystroke() {
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

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
        gain.connect(this.dryGain);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    /**
     * Short tick for boot line start and letter settle
     */
    playTick() {
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.value = 900 + Math.random() * 300;

        gain.gain.value = 0.04;
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.06);
    }

    /**
     * Hover tone — very short, clean
     */
    playHover() {
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.value = 520;

        gain.gain.value = 0.025;
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

        osc.connect(gain);
        this._connectWithReverb(gain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }

    /**
     * Crystalline confirmation chime
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
            gain.gain.linearRampToValueAtTime(0.03, start + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.6);

            osc.connect(gain);
            this._connectWithReverb(gain);
            osc.start(start);
            osc.stop(start + 0.6);
        });

        // Gentle shimmer
        const shimmer = this.ctx.createOscillator();
        const shimmerGain = this.ctx.createGain();
        shimmer.type = 'sine';
        shimmer.frequency.value = 2093;
        shimmerGain.gain.setValueAtTime(0, now + 0.3);
        shimmerGain.gain.linearRampToValueAtTime(0.006, now + 0.4);
        shimmerGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        shimmer.connect(shimmerGain);
        this._connectWithReverb(shimmerGain);
        shimmer.start(now + 0.3);
        shimmer.stop(now + 0.8);
    }

    destroy() {
        if (this.ctx) {
            this.ctx.close();
        }
    }
}
