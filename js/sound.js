// 5051 8-bit sound system — procedural NES-style sounds for easter eggs
// Public API: window.Sound.play('eagle'|'rat'|'pigeon'|'ferry'|'liberty'|'logo')
//             window.Sound.isEnabled(), window.Sound.setEnabled(bool)
(function () {
    'use strict';

    const HINT_KEY = 'rs5051_sound_hint_seen_v1';
    // Always start muted on every page load (user asked for no persistence).
    let enabled = false;
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

    // ── Ambient beds per section ────────────────────────────────────────
    // Looped procedural noise bed + occasional one-shots synced to the
    // currently visible section. Crossfades on section change.
    let activeAmbient = null;
    let activeSection = null;
    let accentTimer = null;

    function makeLoopNoise(color) {
        // color: 'white'|'pink'|'brown'
        const c = ctx;
        const dur = 3.5;
        const len = Math.floor(c.sampleRate * dur);
        const buf = c.createBuffer(1, len, c.sampleRate);
        const d = buf.getChannelData(0);
        if (color === 'pink') {
            let b0=0,b1=0,b2=0;
            for (let i=0;i<len;i++) {
                const w = Math.random()*2-1;
                b0 = 0.99765*b0 + w*0.0990460;
                b1 = 0.96300*b1 + w*0.2965164;
                b2 = 0.57000*b2 + w*1.0526913;
                d[i] = (b0+b1+b2+w*0.1848)*0.11;
            }
        } else if (color === 'brown') {
            let last = 0;
            for (let i=0;i<len;i++) {
                const w = Math.random()*2-1;
                last = (last + 0.02*w) / 1.02;
                d[i] = last * 3.5;
            }
        } else {
            for (let i=0;i<len;i++) d[i] = Math.random()*2-1;
        }
        const src = c.createBufferSource();
        src.buffer = buf;
        src.loop = true;
        return src;
    }

    const AMBIENTS = {
        // Desert: quiet wind + continuous mosquito whine + rattlesnake hit
        //         1s after enable, then every 8s.
        desert() {
            const c = ctx;
            const g = c.createGain(); g.gain.value = 0;
            // Whisper-quiet wind
            const src = makeLoopNoise('pink');
            const filt = c.createBiquadFilter();
            filt.type = 'lowpass'; filt.frequency.value = 320; filt.Q.value = 0.5;
            const bedGain = c.createGain(); bedGain.gain.value = 0.18;
            src.connect(filt).connect(bedGain).connect(g).connect(c.destination);
            src.start();
            // Mosquito: whiny sawtooth with pitch wobble + slow amp drift
            const mosq = c.createOscillator();
            mosq.type = 'sawtooth'; mosq.frequency.value = 820;
            const mosqHp = c.createBiquadFilter();
            mosqHp.type = 'highpass'; mosqHp.frequency.value = 400;
            const mosqGain = c.createGain(); mosqGain.gain.value = 0;
            const wobble = c.createOscillator();
            wobble.type = 'sine'; wobble.frequency.value = 6;
            const wobbleDepth = c.createGain(); wobbleDepth.gain.value = 35;
            wobble.connect(wobbleDepth).connect(mosq.frequency);
            const drift = c.createOscillator();
            drift.type = 'sine'; drift.frequency.value = 0.11;
            const driftDepth = c.createGain(); driftDepth.gain.value = 0.022;
            const driftOffset = c.createConstantSource();
            driftOffset.offset.value = 0.025;
            drift.connect(driftDepth).connect(mosqGain.gain);
            driftOffset.connect(mosqGain.gain);
            mosq.connect(mosqHp).connect(mosqGain).connect(g);
            mosq.start(); wobble.start(); drift.start(); driftOffset.start();
            let rattleTimer = null;
            return {
                g,
                stop(){
                    clearTimeout(rattleTimer);
                    try{src.stop(); mosq.stop(); wobble.stop(); drift.stop(); driftOffset.stop();}catch(e){}
                },
                onStart(handle) {
                    const fire = () => {
                        if (activeAmbient !== handle || !enabled) return;
                        const t = c.currentTime;
                        for (let i = 0; i < 12; i++) {
                            noise(0.035, 0.14, t + i*0.045, 5500, 8);
                        }
                        rattleTimer = setTimeout(fire, 8000);
                    };
                    rattleTimer = setTimeout(fire, 1000);
                }
            };
        },
        // Brooklyn: city hum + rumbling underground subway loop + horns/pigeons
        brooklyn() {
            const c = ctx;
            const g = c.createGain(); g.gain.value = 0;
            // City bed
            const src = makeLoopNoise('brown');
            const filt = c.createBiquadFilter();
            filt.type = 'lowpass'; filt.frequency.value = 380; filt.Q.value = 0.5;
            src.connect(filt).connect(g).connect(c.destination);
            src.start();
            // Subway rumble — low-passed noise that swells then fades, like a
            // train arriving and leaving, looped every ~22s.
            const subwayNoise = makeLoopNoise('brown');
            const subwayLp = c.createBiquadFilter();
            subwayLp.type = 'lowpass'; subwayLp.frequency.value = 140; subwayLp.Q.value = 0.8;
            const subwayAmp = c.createGain(); subwayAmp.gain.value = 0;
            subwayNoise.connect(subwayLp).connect(subwayAmp).connect(g);
            subwayNoise.start();
            let subwayTimer = null;
            let subwayHi = null;
            function subwayCycle(handle) {
                if (activeAmbient !== handle || !enabled) return;
                const t = c.currentTime;
                // Rising rumble
                subwayAmp.gain.cancelScheduledValues(t);
                subwayAmp.gain.setValueAtTime(0.0001, t);
                subwayAmp.gain.exponentialRampToValueAtTime(0.45, t + 3.0);
                // Hold, then fade
                subwayAmp.gain.setValueAtTime(0.45, t + 5.5);
                subwayAmp.gain.exponentialRampToValueAtTime(0.0001, t + 9.5);
                // Screech on brake (short high-freq sweep, quiet)
                if (subwayHi) { try { subwayHi.stop(); } catch(e){} }
                setTimeout(() => {
                    if (activeAmbient !== handle || !enabled) return;
                    const t2 = c.currentTime;
                    sweep(1700, 900, 1.1, 'sawtooth', 0.04, t2);
                    sweep(2200, 1100, 1.1, 'triangle', 0.03, t2 + 0.02);
                }, 5000);
                subwayTimer = setTimeout(() => subwayCycle(handle), 22000);
            }
            return {
                g,
                stop(){
                    clearTimeout(subwayTimer);
                    try{src.stop(); subwayNoise.stop();}catch(e){}
                },
                accent: null,
                onStart(handle) {
                    // Car horn / pigeon on a loose schedule
                    const fire = () => {
                        if (activeAmbient !== handle || !enabled) return;
                        const t = c.currentTime;
                        if (Math.random() < 0.55) {
                            tone(310, 0.42, 'square', 0.07, t);
                            tone(415, 0.42, 'square', 0.05, t);
                        } else {
                            sweep(280, 210, 0.18, 'triangle', 0.08, t);
                            tone(220, 0.16, 'triangle', 0.07, t + 0.18);
                        }
                        const wait = 6000 + Math.random() * 8000;
                        setTimeout(fire, wait);
                    };
                    setTimeout(fire, 3000);
                    // First subway arrives after 4s
                    setTimeout(() => subwayCycle(handle), 4000);
                }
            };
        },
        // Bridge/live shows: water + gulls + distant helicopter rotor
        bridge() {
            const c = ctx;
            const g = c.createGain(); g.gain.value = 0;
            // Water bed
            const src = makeLoopNoise('pink');
            const filt = c.createBiquadFilter();
            filt.type = 'bandpass'; filt.frequency.value = 800; filt.Q.value = 0.8;
            const waterLfo = c.createOscillator(); waterLfo.frequency.value = 0.25;
            const waterLfoGain = c.createGain(); waterLfoGain.gain.value = 180;
            waterLfo.connect(waterLfoGain).connect(filt.frequency);
            src.connect(filt).connect(g).connect(c.destination);
            src.start(); waterLfo.start();
            // Helicopter rotor — low square with fast amp LFO (whop-whop)
            const heli = c.createOscillator();
            heli.type = 'square'; heli.frequency.value = 72;
            const heliLp = c.createBiquadFilter();
            heliLp.type = 'lowpass'; heliLp.frequency.value = 260; heliLp.Q.value = 0.5;
            const heliAmp = c.createGain(); heliAmp.gain.value = 0.16;
            const rotor = c.createOscillator();
            rotor.type = 'sine'; rotor.frequency.value = 18;
            const rotorGain = c.createGain(); rotorGain.gain.value = 0.14;
            rotor.connect(rotorGain).connect(heliAmp.gain);
            heli.connect(heliLp).connect(heliAmp).connect(g);
            heli.start(); rotor.start();
            const accent = () => { if (activeAmbient !== handle) return;
                const t = c.currentTime;
                sweep(2100, 900, 0.28, 'square', 0.06, t);
                sweep(2400, 1100, 0.24, 'square', 0.04, t + 0.32);
            };
            const handle = {
                g,
                stop(){ try{src.stop(); waterLfo.stop(); heli.stop(); rotor.stop();}catch(e){} },
                accent,
                accentMs:[9000,18000]
            };
            return handle;
        },
        // Stage: crowd roar + rhythmic backbeat claps (120 BPM beats 2 & 4)
        stage() {
            const c = ctx;
            const g = c.createGain(); g.gain.value = 0;
            const srcLow = makeLoopNoise('brown');
            const fLow = c.createBiquadFilter();
            fLow.type = 'bandpass'; fLow.frequency.value = 200; fLow.Q.value = 1.6;
            const gLow = c.createGain(); gLow.gain.value = 0.55;
            srcLow.connect(fLow).connect(gLow).connect(g);
            g.connect(c.destination);
            srcLow.start();
            let clapTimer = null;
            return {
                g,
                stop(){ clearTimeout(clapTimer); try{srcLow.stop();}catch(e){} },
                accent: null,
                onStart(handle) {
                    let clapStep = 0;
                    const tick = () => {
                        if (activeAmbient !== handle || !enabled) return;
                        clapStep = (clapStep + 1) % 4;
                        if (clapStep === 1 || clapStep === 3) {
                            const t = c.currentTime;
                            noise(0.06, 0.20, t, 1800, 3);
                            noise(0.04, 0.14, t, 3400, 4);
                        }
                        clapTimer = setTimeout(tick, 500);
                    };
                    // Whistle accents
                    const whistle = () => {
                        if (activeAmbient !== handle || !enabled) return;
                        sweep(1800, 2400, 0.3, 'square', 0.08, c.currentTime);
                        setTimeout(whistle, 5000 + Math.random() * 6000);
                    };
                    tick();
                    setTimeout(whistle, 3000);
                }
            };
        },
        // Pub: muffled bass groove + chatter + glass clinks
        pub() {
            const c = ctx;
            const g = c.createGain(); g.gain.value = 0;
            const chat = makeLoopNoise('pink');
            const chatFilt = c.createBiquadFilter();
            chatFilt.type = 'bandpass'; chatFilt.frequency.value = 500; chatFilt.Q.value = 1.2;
            const chatGain = c.createGain(); chatGain.gain.value = 0.18;
            chat.connect(chatFilt).connect(chatGain).connect(g);
            g.connect(c.destination);
            chat.start();
            // A minor walking bass line, lowpassed (music through a wall)
            const bassNotes = [110, 130.81, 164.81, 130.81];
            const bassOsc = c.createOscillator();
            bassOsc.type = 'sawtooth'; bassOsc.frequency.value = bassNotes[0];
            const bassLp = c.createBiquadFilter();
            bassLp.type = 'lowpass'; bassLp.frequency.value = 220; bassLp.Q.value = 0.7;
            const bassAmp = c.createGain(); bassAmp.gain.value = 0.0001;
            bassOsc.connect(bassLp).connect(bassAmp).connect(g);
            bassOsc.start();
            let bassTimer = null;
            return {
                g,
                stop(){ clearTimeout(bassTimer); try{chat.stop(); bassOsc.stop();}catch(e){} },
                accent: null,
                onStart(handle) {
                    let step = 0;
                    const tick = () => {
                        if (activeAmbient !== handle || !enabled) return;
                        const t = c.currentTime;
                        bassOsc.frequency.setValueAtTime(bassNotes[step], t);
                        bassAmp.gain.cancelScheduledValues(t);
                        bassAmp.gain.setValueAtTime(0.0001, t);
                        bassAmp.gain.exponentialRampToValueAtTime(0.14, t + 0.02);
                        bassAmp.gain.exponentialRampToValueAtTime(0.02, t + 0.42);
                        step = (step + 1) % bassNotes.length;
                        bassTimer = setTimeout(tick, 500);
                    };
                    const clink = () => {
                        if (activeAmbient !== handle || !enabled) return;
                        const t = c.currentTime;
                        const f = 2400 + Math.random() * 1600;
                        tone(f, 0.12, 'sine', 0.08, t);
                        tone(f * 1.5, 0.08, 'sine', 0.05, t + 0.02);
                        setTimeout(clink, 3500 + Math.random() * 4500);
                    };
                    tick();
                    setTimeout(clink, 4000);
                }
            };
        }
    };

    const AMBIENT_VOL = {
        desert: 0.16, brooklyn: 0.14, bridge: 0.14, stage: 0.20, pub: 0.16
    };

    function scheduleAccent() {
        clearTimeout(accentTimer);
        if (!activeAmbient || !activeAmbient.accent || !activeAmbient.accentMs) return;
        const [min, max] = activeAmbient.accentMs;
        const wait = min + Math.random() * (max - min);
        accentTimer = setTimeout(() => {
            if (!enabled) return;
            try { activeAmbient.accent(); } catch (e) { /* ignore */ }
            scheduleAccent();
        }, wait);
    }

    function crossfadeTo(name) {
        if (!enabled) return;
        const c = ensureCtx();
        if (!c) return;
        if (c.state === 'suspended') { try { c.resume(); } catch (e) { /* ignore */ } }
        if (activeSection === name && activeAmbient) return;
        activeSection = name;
        const prev = activeAmbient;
        const builder = AMBIENTS[name];
        if (!builder) return;
        let next;
        try { next = builder(); } catch (e) { console.error('[ambient build]', name, e); return; }
        activeAmbient = next;
        const t = c.currentTime;
        const fade = 1.2;
        next.g.gain.setValueAtTime(0.0001, t);
        next.g.gain.exponentialRampToValueAtTime(AMBIENT_VOL[name] || 0.12, t + fade);
        if (prev) {
            try {
                prev.g.gain.cancelScheduledValues(t);
                prev.g.gain.setValueAtTime(prev.g.gain.value || 0.0001, t);
                prev.g.gain.exponentialRampToValueAtTime(0.0001, t + fade);
                setTimeout(() => prev.stop(), (fade + 0.1) * 1000);
            } catch (e) { /* ignore */ }
        }
        scheduleAccent();
        if (typeof next.onStart === 'function') {
            try { next.onStart(next); } catch (e) { console.error('[ambient onStart]', name, e); }
        }
    }

    function stopAmbient() {
        clearTimeout(accentTimer);
        if (!activeAmbient) { activeSection = null; return; }
        const c = ctx;
        if (!c) { activeAmbient.stop(); activeAmbient = null; activeSection = null; return; }
        const t = c.currentTime;
        const g = activeAmbient.g;
        const scene = activeAmbient;
        try {
            g.gain.cancelScheduledValues(t);
            g.gain.setValueAtTime(g.gain.value || 0.0001, t);
            g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
            setTimeout(() => scene.stop(), 450);
        } catch (e) { try { scene.stop(); } catch (_){} }
        activeAmbient = null;
        activeSection = null;
    }

    function currentSection() {
        // 5 sections roughly bucketed by scroll progress. Stage runs wider
        // due to the party sequence (matches effects.js ~62-78% trigger).
        let p;
        if (typeof window._mobileScrollProgress === 'number') {
            p = window._mobileScrollProgress;
        } else {
            const maxY = document.body.scrollHeight - window.innerHeight;
            p = maxY > 0 ? Math.max(0, Math.min(1, window.scrollY / maxY)) : 0;
        }
        if (p < 0.20) return 'desert';
        if (p < 0.40) return 'brooklyn';
        if (p < 0.60) return 'bridge';
        if (p < 0.86) return 'stage';
        return 'pub';
    }

    let scrollScheduled = false;
    function onScroll() {
        if (!enabled || scrollScheduled) return;
        scrollScheduled = true;
        requestAnimationFrame(() => {
            scrollScheduled = false;
            if (!enabled) return;
            crossfadeTo(currentSection());
        });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('scroll', onScroll, { passive: true, capture: true });

    function setEnabled(v) {
        enabled = !!v;
        renderBtn();
        if (enabled) {
            crossfadeTo(currentSection());
        } else {
            stopAmbient();
        }
    }

    // ── UI button ───────────────────────────────────────────────────────
    function buildBtn() {
        btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'sound-toggle';
        btn.addEventListener('click', () => {
            // This click counts as a user gesture — resume ctx if needed
            const c = ensureCtx();
            if (c && c.state === 'suspended') { try { c.resume(); } catch (e) { /* ignore */ } }
            setEnabled(!enabled);
            if (enabled) play('click');
            dismissHint();
        });
        document.body.appendChild(btn);
        renderBtn();
        maybeShowHint();
    }

    function maybeShowHint() {
        let seen = false;
        try { seen = localStorage.getItem(HINT_KEY) === '1'; } catch (e) { /* ignore */ }
        if (seen || enabled || !btn) return;
        btn.classList.add('sound-toggle-hint');
        // Remove hint after 10s even if user doesn't click
        setTimeout(dismissHint, 10000);
    }

    function dismissHint() {
        if (btn) btn.classList.remove('sound-toggle-hint');
        try { localStorage.setItem(HINT_KEY, '1'); } catch (e) { /* ignore */ }
    }

    function renderBtn() {
        if (!btn) return;
        btn.classList.toggle('muted', !enabled);
        btn.innerHTML = enabled
            ? '<span class="sound-icon" aria-hidden="true">🔊</span><span class="sound-label">SOUND ON</span>'
            : '<span class="sound-icon" aria-hidden="true">🔇</span><span class="sound-label">SOUND OFF</span>';
    }

    window.Sound = { play, isEnabled: () => enabled, setEnabled };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', buildBtn);
    } else {
        buildBtn();
    }
})();
