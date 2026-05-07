// Procedural background music via Web Audio API — zero external files.
// Each track is built from: a sustained chord pad + sequenced melody + bass line.

function midiToHz(m) { return 440 * Math.pow(2, (m - 69) / 12); }

// ─── Track definitions ────────────────────────────────────────────────────────
// pad:    MIDI notes for sustained chord pad (triangle/sawtooth, fade-in)
// bass:   MIDI notes for bass line (sine, every 2 melody beats)
// melody: MIDI notes for lead melody (plays every beat, loops)
// bpm:    tempo — controls melody/bass note spacing
const TRACKS = {
    menu: {
        bpm: 78,
        pad:       [45, 48, 52, 57],                          // Am: A2 C3 E3 A3
        bass:      [33, 40, 33, 40],                          // A1 E2 A1 E2
        melody:    [69, 71, 72, 76, 74, 72, 71, 69],          // A4 B4 C5 E5 D5 C5 B4 A4
        padWave:    'triangle',
        melodyWave: 'triangle',
    },
    village: {
        bpm: 100,
        pad:       [48, 52, 55, 60],                          // C major: C3 E3 G3 C4
        bass:      [36, 43, 36, 43],                          // C2 G2
        melody:    [72, 76, 79, 81, 79, 76, 74, 72],          // C5 E5 G5 A5 G5 E5 D5 C5
        padWave:    'triangle',
        melodyWave: 'sine',
    },
    meadows: {
        bpm: 88,
        pad:       [55, 59, 62, 67],                          // G major: G3 B3 D4 G4
        bass:      [43, 50, 43, 50],                          // G2 D3
        melody:    [67, 69, 71, 74, 71, 69, 67, 64],          // G4 A4 B4 D5 B4 A4 G4 E4
        padWave:    'triangle',
        melodyWave: 'sine',
    },
    forest: {
        bpm: 68,
        pad:       [50, 53, 57, 60],                          // Dm7: D3 F3 A3 C4
        bass:      [38, 45, 38, 45],                          // D2 A2
        melody:    [62, 65, 69, 72, 69, 67, 65, 62],          // D4 F4 A4 C5 A4 G4 F4 D4
        padWave:    'sawtooth',
        melodyWave: 'triangle',
    },
    plains: {
        bpm: 108,
        pad:       [53, 57, 60, 65],                          // F major: F3 A3 C4 F4
        bass:      [41, 48, 41, 48],                          // F2 C3
        melody:    [65, 67, 69, 72, 69, 67, 65, 67],          // F4 G4 A4 C5 A4 G4 F4 G4
        padWave:    'triangle',
        melodyWave: 'sine',
    },
    mountains: {
        bpm: 80,
        pad:       [52, 55, 59, 62],                          // Em7: E3 G3 B3 D4
        bass:      [40, 47, 40, 47],                          // E2 B2
        melody:    [64, 67, 71, 74, 71, 67, 64, 62],          // E4 G4 B4 D5 B4 G4 E4 D4
        padWave:    'triangle',
        melodyWave: 'sawtooth',
    },
    dungeon: {
        bpm: 58,
        pad:       [47, 50, 53, 56],                          // Bdim7: B2 D3 F3 Ab3
        bass:      [35, 42, 35, 39],                          // B1 F#2 B1 Eb2
        melody:    [59, 62, 65, 68, 65, 62, 59, 56],          // B3 D4 F4 Ab4 F4 D4 B3 Ab3
        padWave:    'sawtooth',
        melodyWave: 'square',
    },
    combat: {
        bpm: 138,
        pad:       [38, 41, 45, 50],                          // Dm: D2 F2 A2 D3
        bass:      [26, 26, 33, 26],                          // D1 D1 A1 D1 (driving)
        melody:    [62, 63, 65, 69, 65, 63, 62, 60],          // D4 Eb4 F4 A4 F4 Eb4 D4 C4
        padWave:    'sawtooth',
        melodyWave: 'square',
    },
};

// ─── Engine ───────────────────────────────────────────────────────────────────

class MusicEngine {
    constructor() {
        this._ctx      = null;
        this._master   = null;
        this._padNodes = [];   // { osc, gain | null } — persistent pad oscillators
        this._schedId  = null; // setInterval ID
        this._beat     = 0;
        this._nextTime = 0;
        this._track    = null;
        this._key      = null;
        this._wantKey  = null; // remembered key for re-enable
        this.enabled   = localStorage.getItem('meanfall_sound') !== 'off';
        this._volume   = 0.20;
    }

    _ensureCtx() {
        if (this._ctx) {
            if (this._ctx.state === 'suspended') this._ctx.resume();
            return this._ctx;
        }
        try {
            this._ctx    = new (window.AudioContext || window.webkitAudioContext)();
            this._master = this._ctx.createGain();
            this._master.gain.value = this._volume;
            this._master.connect(this._ctx.destination);
        } catch (e) {
            this.enabled = false;
        }
        return this._ctx;
    }

    // ── Public API ────────────────────────────────────────────────────────────

    play(key) {
        this._wantKey = key;
        if (!this.enabled) return;
        if (this._key === key) return;
        this._halt(true);                     // crossfade: fade out old track
        this._key   = key;
        const track = TRACKS[key];
        if (!track) return;
        const ctx = this._ensureCtx();
        if (!ctx) return;
        this._track    = track;
        this._beat     = 0;
        this._nextTime = ctx.currentTime + 0.08;
        this._startPad(ctx, track);
        this._schedId = setInterval(() => this._tick(), 80);
    }

    stop() {
        this._wantKey = null;
        this._halt(true);
        this._key = null;
    }

    setEnabled(v) {
        this.enabled = v;
        if (!v) {
            this._halt(true);
            this._key = null;
        } else if (this._wantKey) {
            const k = this._wantKey;
            this._wantKey = null;
            this.play(k);
        }
    }

    // ── Internal: stop/crossfade ──────────────────────────────────────────────

    _halt(fade) {
        if (this._schedId) { clearInterval(this._schedId); this._schedId = null; }
        const now = this._ctx ? this._ctx.currentTime : 0;
        for (const { osc, gain } of this._padNodes) {
            if (gain && fade) {
                try { gain.gain.setTargetAtTime(0, now, 0.4); } catch (e) {}
            }
            const delay = fade ? 1800 : 0;
            setTimeout(() => { try { osc.stop(); } catch (e) {} }, delay);
        }
        this._padNodes = [];
        this._track    = null;
    }

    // ── Internal: sustained chord pad ─────────────────────────────────────────

    _startPad(ctx, track) {
        const count = track.pad.length;
        for (let i = 0; i < count; i++) {
            const freq = midiToHz(track.pad[i]);
            const osc  = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = track.padWave || 'triangle';
            osc.frequency.value = freq;
            gain.gain.value = 0;
            gain.gain.linearRampToValueAtTime(0.03 / count, ctx.currentTime + 1.6);

            // Subtle vibrato (LFO → frequency modulation)
            const lfo  = ctx.createOscillator();
            const lfog = ctx.createGain();
            lfo.frequency.value = 0.28 + i * 0.06;
            lfog.gain.value     = freq * 0.006;
            lfo.connect(lfog);
            lfog.connect(osc.frequency);

            osc.connect(gain);
            gain.connect(this._master);
            osc.start();
            lfo.start();

            this._padNodes.push({ osc, gain });
            this._padNodes.push({ osc: lfo, gain: null }); // LFO: no gain fade needed
        }
    }

    // ── Internal: transient note (melody + bass) ──────────────────────────────

    _note(freq, type, start, dur, peak) {
        const ctx  = this._ctx;
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(peak, start + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
        osc.connect(gain);
        gain.connect(this._master);
        osc.start(start);
        osc.stop(start + dur + 0.02);
    }

    // ── Internal: lookahead scheduler ─────────────────────────────────────────

    _tick() {
        const ctx   = this._ctx;
        const track = this._track;
        if (!ctx || !track) return;
        const beatLen = 60 / track.bpm;
        while (this._nextTime < ctx.currentTime + 0.15) {
            const t  = this._nextTime;
            // Melody: every beat
            const mi = this._beat % track.melody.length;
            this._note(midiToHz(track.melody[mi]), track.melodyWave || 'sine', t, beatLen * 0.78, 0.06);
            // Bass: every 2 beats
            if (this._beat % 2 === 0) {
                const bi = (this._beat / 2) % track.bass.length;
                this._note(midiToHz(track.bass[bi]), 'sine', t, beatLen * 1.5, 0.09);
            }
            this._beat++;
            this._nextTime += beatLen;
        }
    }
}

export const Music = new MusicEngine();
