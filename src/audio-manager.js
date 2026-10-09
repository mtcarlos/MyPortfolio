
class AudioManager {
    constructor() {
        this.sounds = {};
        this.enabled = true;
        this.volume = 0.5;
        this.init();
    }

    init() {
        // Preload standard UI sounds using reliable CDN sources or Base64 if needed.
        // For now using placeholder URLs that are commonly used in examples or open source assets.
        // Ideally these should be local assets.

        // UI Sounds
        this.loadSound('hover', 'https://cdn.freesound.org/previews/240/240776_4107740-lq.mp3'); // A subtle blip
        this.loadSound('click', 'https://cdn.freesound.org/previews/256/256116_3263906-lq.mp3'); // A mechanical click
        this.loadSound('open', 'https://cdn.freesound.org/previews/171/171671_2437358-lq.mp3');  // Swoosh/Open

        // Footsteps (Funciona directo en el navegador)
        this.loadSound('step', 'assets/music/pasos.mp3');
    }

    loadSound(name, url) {
        const audio = new Audio(url);
        audio.preload = 'auto';
        this.sounds[name] = audio;
    }

    play(name, options = {}) {
        if (!this.enabled) return;

        const sound = this.sounds[name];
        if (!sound) return;

        // Clone to allow overlapping sounds (e.g. fast typing or rapid footsteps)
        const clone = sound.cloneNode();

        // Variation (Pitch/Volume) for "organic" feel
        // Note: HTML5 Audio doesn't support pitch shifting natively without Web Audio API context,
        // but we can vary volume slightly.

        const baseVolume = options.volume || this.volume;
        const variation = options.variation || 0;

        clone.volume = Math.max(0, Math.min(1, baseVolume + (Math.random() * variation - variation / 2)));

        // If we really wanted pitch shift, we'd need a full AudioContext setup. 
        // For now, volume variation is a good enough "organic" proxy for simple steps.

        clone.play().catch(e => {
            // Auto-play policies might block this until first interaction
            // We ignore errors here usually
            // console.warn("Audio play failed", e);
        });
    }

    toggleMute() {
        this.enabled = !this.enabled;
        
        // Stop any looping sounds if muted
        if (!this.enabled) {
            for (const key in this.sounds) {
                const sound = this.sounds[key];
                if (sound && !sound.paused && sound.loop) {
                    sound.pause();
                }
            }
        }
        
        return this.enabled;
    }

    startLoop(name, options = {}) {
        if (!this.enabled) return;
        const sound = this.sounds[name];
        if (!sound) return;

        sound.loop = true;
        sound.volume = options.volume || this.volume;
        if (sound.paused) {
            sound.play().catch(e => {});
        }
    }

    stopLoop(name) {
        const sound = this.sounds[name];
        if (!sound) return;
        
        sound.pause();
        sound.currentTime = 0; // reset to beginning
    }
}

// Export a singleton instance
export const audioManager = new AudioManager();
