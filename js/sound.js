// 5051 8-bit sound system — procedural NES-style sounds for easter eggs
// Public API: window.Sound.play('eagle'|'rat'|'pigeon'|'ferry'|'liberty'|'logo')
//             window.Sound.isEnabled(), window.Sound.setEnabled(bool)
(function () {
    'use strict';

    const STORAGE_KEY = 'rs5051_sound_v1';
    let enabled = localStorage.getItem(STORAGE_KEY) !== '0'; // default ON
    let ctx = null;
    let btn = null;

    function ensureCtx() {
        if (ctx) return ctx;
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        try { ctx = new AC(); } catch (e) { return null; }
        return ctx;
    }

    // ── 8-bit primitives ────────────────────────────────────────────────
    function tone(freq, dur, type, vol, when) {
        const c = ctx;
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, when);
        gain.gain.setValueAtTime(vol, when);
        gain.gain.exponentialRampToValueAtTime(0.0001, when + dur);
        osc.connect(gain).connect(c.destination);
        osc.start(when);
        osc.stop(when + dur + 0.02);
    }

    function sweep(f1, f2, dur, type, vol, when) {
        const c = ctx;
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(f1, when);
        osc.frequency.exponentialRampToValueAtTime(Math.max(1, f2), when + dur);
        gain.gain.setValueAtTime(vol, when);
        gain.gain.exponentialRampToValueAtTime(0.0001, when + dur);
        osc.connect(gain).connect(c.destination);
        osc.start(when);
        osc.stop(when + dur + 0.02);
    }

    function noise(dur, vol, when, filterFreq, filterQ) {
        const c = ctx;
        const len = Math.max(1, Math.floor(c.sampleRate * dur));
        const buf = c.createBuffer(1, len, c.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
        const src = c.createBufferSource();
        src.buffer = buf;
        const gain = c.createGain();
        gain.gain.setValueAtTime(vol, when);
        gain.gain.exponentialRampToValueAtTime(0.0001, when + dur);
        if (filterFreq) {
            const filter = c.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = filterFreq;
            filter.Q.value = filterQ || 1;
            src.connect(filter).connect(gain).connect(c.destination);
        } else {
            src.connect(gain).connect(c.destination);
        }
        src.start(when);
        src.stop(when + dur + 0.02);
    }

    // ── Sound definitions (NES-style, chiptune-ish) ─────────────────────
    const SOUNDS = {
        // Eagle — sharp descending screech (square + airy noise)
        eagle() {
            const t = ctx.currentTime;
            sweep(1400, 500, 0.32, 'square', 0.14, t);
            sweep(1800, 700, 0.32, 'square', 0.07, t + 0.02);
            noise(0.25, 0.06, t + 0.04, 2600, 2);
            sweep(900, 350, 0.2, 'square', 0.08, t + 0.25);
        },

        // Rat — quick high squeaks (pulse waves, like NES blip)
        rat() {
            const t = ctx.currentTime;
            tone(2200, 0.05, 'square', 0.16, t);
            tone(2600, 0.05, 'square', 0.14, t + 0.07);
            tone(2000, 0.06, 'square', 0.12, t + 0.15);
            tone(2400, 0.05, 'square', 0.10, t + 0.24);
        },

        // Pigeon — low coo + wing flaps
        pigeon() {
            const t = ctx.currentTime;
            sweep(340, 230, 0.15, 'triangle', 0.22, t);
            tone(240, 0.18, 'triangle', 0.20, t + 0.16);
            // wing flaps
            noise(0.09, 0.12, t + 0.38, 500, 4);
            noise(0.09, 0.11, t + 0.50, 500, 4);
            noise(0.09, 0.10, t + 0.62, 500, 4);
        },

        // Ferry — deep ship horn (stacked squares, detuned for thickness)
        ferry() {
            const t = ctx.currentTime;
            tone(82, 0.9, 'square', 0.16, t);
            tone(110, 0.9, 'square', 0.10, t);
            tone(165, 0.9, 'square', 0.06, t);
            // Short second honk
            tone(98, 0.25, 'square', 0.12, t + 1.0);
            tone(130, 0.25, 'square', 0.08, t + 1.0);
        },

        // Liberty — rising whistle + firework explosion + crackle
        liberty() {
            const t = ctx.currentTime;
            // Ascending whistle
            sweep(700, 1700, 0.45, 'square', 0.12, t);
            sweep(1050, 2550, 0.45, 'square', 0.05, t + 0.01);
            // BOOM
            tone(70, 0.45, 'square', 0.22, t + 0.5);
            tone(55, 0.45, 'triangle', 0.18, t + 0.5);
            noise(0.55, 0.24, t + 0.5, 220, 1);
            // Sparkle crackle
            noise(0.35, 0.10, t + 0.65, 3400, 3);
            noise(0.25, 0.07, t + 0.85, 4200, 3);
        },

        // Logo — lightning crack (noise burst + low rumble)
        logo() {
            const t = ctx.currentTime;
            // Crack
            noise(0.09, 0.34, t, 5000, 1);
            noise(0.14, 0.22, t + 0.03, 2000, 1);
            // Rumble
            noise(0.7, 0.2, t + 0.06, 180, 0.8);
            tone(55, 0.9, 'square', 0.16, t + 0.06);
            sweep(90, 40, 0.9, 'triangle', 0.14, t + 0.06);
        },

        // Tiny click for the toggle button itself
        click() {
            const t = ctx.currentTime;
            tone(880, 0.05, 'square', 0.1, t);
            tone(1320, 0.05, 'square', 0.08, t + 0.04);
        }
    };

    function play(name) {
        if (!enabled) return;
        const fn = SOUNDS[name];
        if (!fn) return;
        const c = ensureCtx();
        if (!c) return;
        if (c.state === 'suspended') { try { c.resume(); } catch (e) { /* ignore */ } }
        try { fn(); } catch (e) { /* ignore */ }
    }

    function setEnabled(v) {
        enabled = !!v;
        try { localStorage.setItem(STORAGE_KEY, enabled ? '1' : '0'); } catch (e) { /* ignore */ }
        renderBtn();
    }

    // ── UI button ───────────────────────────────────────────────────────
    function buildBtn() {
        btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'sound-toggle';
        btn.setAttribute('aria-label', 'Toggle sound');
        btn.addEventListener('click', () => {
            // This click counts as a user gesture — resume ctx if needed
            const c = ensureCtx();
            if (c && c.state === 'suspended') { try { c.resume(); } catch (e) { /* ignore */ } }
            setEnabled(!enabled);
            if (enabled) play('click');
        });
        document.body.appendChild(btn);
        renderBtn();
    }

    function renderBtn() {
        if (!btn) return;
        btn.classList.toggle('muted', !enabled);
        btn.innerHTML = enabled
            ? '<span class="sound-icon">🔊</span><span class="sound-label">SOUND ON</span>'
            : '<span class="sound-icon">🔇</span><span class="sound-label">SOUND OFF</span>';
    }

    window.Sound = { play, isEnabled: () => enabled, setEnabled };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', buildBtn);
    } else {
        buildBtn();
    }
})();
