/**
 * Landing Audio — Procedural Zen Atmosphere Sound
 * 
 * Generates interactive ambient pads, hover bells, and confirmation chimes
 * procedurally using the Web Audio API. Zero asset loading overhead.
 */

export class LandingAudio {
    constructor() {
        this.ctx = null;
        this.enabled = false;
        
        this.masterGain = null;
        this.dryGain = null;
        this.reverbGain = null;
        this.convolver = null;
        
        this.ambientOscs = null;
        this.ambientGains = null;
        this.lfoInterval = null;
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
     * Creates a synthetic algorithmic convolution reverb impulse
     * giving sounds a high-end spatial metallic/glass glow.
     */
    _createReverb() {
        this.convolver = this.ctx.createConvolver();
        const rate = this.ctx.sampleRate;
        const length = rate * 1.5; // 1.5-second tail - lush and ambient
        const impulse = this.ctx.createBuffer(2, length, rate);

        for (let channel = 0; channel < 2; channel++) {
            const data = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                // Exponential decay white noise
                data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.5);
            }
        }

        this.convolver.buffer = impulse;

        this.dryGain = this.ctx.createGain();
        this.dryGain.gain.value = 0.7;
        this.dryGain.connect(this.masterGain);

        this.reverbGain = this.ctx.createGain();
        this.reverbGain.gain.value = 0.35;
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
        this.masterGain.gain.linearRampToValueAtTime(1.0, this.ctx.currentTime + 0.5);
        this.startAtmosphere();
    }

    disable() {
        if (!this.ctx) return;
        this.enabled = false;
        this.masterGain.gain.linearRampToValueAtTime(0.0, this.ctx.currentTime + 0.5);
        this.stopAtmosphere();
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
     * Start a procedurally generated open perfect fifth chord pad
     * simulating a slow breathing space-ambient drone.
     */
    startAtmosphere() {
        if (!this.ctx || this.ambientOscs) return;

        this.ambientOscs = [];
        this.ambientGains = [];

        // Open Perfect Fifth chord: A2 (110Hz), E3 (164.81Hz), A3 (220Hz), C#4 (277.18Hz)
        const freqs = [110.0, 164.81, 220.0, 277.18];

        freqs.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            
            gain.gain.setValueAtTime(0, this.ctx.currentTime);
            
            // Stagger volume level of each partial for balanced blend
            const targetVolume = (0.04 - idx * 0.008) * (idx === 3 ? 0.3 : 1.0);
            gain.gain.linearRampToValueAtTime(targetVolume, this.ctx.currentTime + 3.0);

            osc.connect(gain);
            this._connectWithReverb(gain);
            osc.start();

            this.ambientOscs.push(osc);
            this.ambientGains.push(gain);
        });

        // Run a slow low-frequency oscillator (LFO) simulation
        this.lfoInterval = setInterval(() => {
            if (!this.ctx || !this.ambientOscs) return;
            const now = this.ctx.currentTime;

            // Slowly drift frequencies slightly (chorusing effect)
            this.ambientOscs.forEach((osc, idx) => {
                const drift = Math.sin(now * 0.15 + idx * 0.5) * 1.2;
                osc.frequency.exponentialRampToValueAtTime(freqs[idx] + drift, now + 3.0);
            });

            // Volume modulation (simulating slow breathing)
            this.ambientGains.forEach((gain, idx) => {
                const baseVolume = (0.04 - idx * 0.008) * (idx === 3 ? 0.3 : 1.0);
                const volumeMod = Math.cos(now * 0.25 + idx * 0.7) * (baseVolume * 0.25);
                gain.gain.linearRampToValueAtTime(baseVolume + volumeMod, now + 2.5);
            });
        }, 3000);
    }

    /**
     * Fades out and shuts down the atmospheric drone.
     */
    stopAtmosphere() {
        if (this.lfoInterval) {
            clearInterval(this.lfoInterval);
            this.lfoInterval = null;
        }

        const now = this.ctx ? this.ctx.currentTime : 0;

        if (this.ambientGains) {
            this.ambientGains.forEach(gain => {
                gain.gain.cancelScheduledValues(now);
                gain.gain.linearRampToValueAtTime(0.0, now + 1.2);
            });
        }

        setTimeout(() => {
            if (this.ambientOscs) {
                this.ambientOscs.forEach(osc => {
                    try { osc.stop(); } catch (e) {}
                });
                this.ambientOscs = null;
                this.ambientGains = null;
            }
        }, 1300);
    }

    /**
     * High-pitched subtle tick (used on interactions)
     */
    playTick() {
        if (!this.ctx || !this.enabled) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.015, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.05);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
    }

    /**
     * Soft, crystalline bell tone triggered on button hover
     */
    playHover() {
        if (!this.ctx || !this.enabled) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        // Elegant high harmonic frequency (E6)
        osc.frequency.setValueAtTime(1318.51, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.012, this.ctx.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.6);

        osc.connect(gain);
        this._connectWithReverb(gain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.6);
    }

    /**
     * Grand crystalline confirmation chime when entering the portfolio
     */
    playChime() {
        if (!this.ctx || !this.enabled) return;

        const now = this.ctx.currentTime;
        // Pentatonic scale glass cascade: C5 (523.25), E5 (659.25), G5 (783.99), A5 (880.00), C6 (1046.50)
        const notes = [523.25, 659.25, 783.99, 880.00, 1046.50];

        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.value = freq;

            const start = now + idx * 0.08;
            gain.gain.setValueAtTime(0, start);
            gain.gain.linearRampToValueAtTime(0.025, start + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.0001, start + 1.2);

            osc.connect(gain);
            this._connectWithReverb(gain);
            osc.start(start);
            osc.stop(start + 1.2);
        });
    }

    destroy() {
        this.stopAtmosphere();
        if (this.ctx) {
            this.ctx.close();
        }
    }
}
