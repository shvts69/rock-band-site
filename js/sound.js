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
    // band-walkers' on-screen position. While the walker group straddles
    // a brick wall, BOTH section ambients play at full volume. Old one
    // only fades out once the last (leftmost) walker has crossed in.
    const activeAmbients = Object.create(null); // { name: handle }
    const activeSet = new Set();

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
            let rattleTimer = null;
            let critterTimer = null;
            // Schedule one animal running by — 7 paw-thuds over ~0.85s,
            // panned L→R (or R→L at random), envelope fades in-out so it
            // sounds like it passed from distance to close to distance.
            function critterPass() {
                const t0 = c.currentTime;
                const steps = 7;
                const totalDur = 0.85;
                const dir = Math.random() < 0.5 ? 1 : -1;
                const pan = c.createStereoPanner ? c.createStereoPanner() : null;
                const panGain = c.createGain(); panGain.gain.value = 1;
                if (pan) {
                    pan.pan.setValueAtTime(-0.9 * dir, t0);
                    pan.pan.linearRampToValueAtTime(0.9 * dir, t0 + totalDur);
                    panGain.connect(pan).connect(g);
                } else {
                    panGain.connect(g);
                }
                for (let i = 0; i < steps; i++) {
                    const stepT = t0 + (i / (steps - 1)) * totalDur;
                    // Distance envelope: 0→1→0 (quiet at edges, loud in middle)
                    const pos = i / (steps - 1);
                    const vol = 0.08 + 0.22 * Math.sin(pos * Math.PI);
                    const len = 0.06 + Math.random() * 0.03;
                    // Paw on sand — low-mid filtered noise
                    const buf = c.createBuffer(1, Math.floor(c.sampleRate * len), c.sampleRate);
                    const d2 = buf.getChannelData(0);
                    for (let k = 0; k < d2.length; k++) d2[k] = Math.random()*2-1;
                    const src2 = c.createBufferSource(); src2.buffer = buf;
                    const bp = c.createBiquadFilter();
                    bp.type = 'bandpass';
                    bp.frequency.value = 220 + Math.random() * 160;
                    bp.Q.value = 1.8;
                    const gStep = c.createGain();
                    gStep.gain.setValueAtTime(vol, stepT);
                    gStep.gain.exponentialRampToValueAtTime(0.0001, stepT + len);
                    src2.connect(bp).connect(gStep).connect(panGain);
                    src2.start(stepT); src2.stop(stepT + len + 0.01);
                }
            }
            return {
                alive: true,
                g,
                stop(){
                    this.alive = false;
                    clearTimeout(rattleTimer);
                    clearTimeout(critterTimer);
                    try{src.stop();}catch(e){}
                },
                onStart(handle) {
                    const rattle = () => {
                        if (!handle.alive || !enabled) return;
                        const t = c.currentTime;
                        for (let i = 0; i < 12; i++) {
                            noise(0.035, 0.14, t + i*0.045, 5500, 8);
                        }
                        rattleTimer = setTimeout(rattle, 8000);
                    };
                    rattleTimer = setTimeout(rattle, 1000);
                    const critter = () => {
                        if (!handle.alive || !enabled) return;
                        critterPass();
                        critterTimer = setTimeout(critter, 9000 + Math.random() * 7000);
                    };
                    // First critter at 6s (after first rattle), then every 9-16s
                    critterTimer = setTimeout(critter, 6000);
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
                if (!handle.alive || !enabled) return;
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
                    if (!handle.alive || !enabled) return;
                    const t2 = c.currentTime;
                    sweep(1700, 900, 1.1, 'sawtooth', 0.04, t2);
                    sweep(2200, 1100, 1.1, 'triangle', 0.03, t2 + 0.02);
                }, 5000);
                subwayTimer = setTimeout(() => subwayCycle(handle), 22000);
            }
            return {
                alive: true,
                g,
                stop(){
                    this.alive = false;
                    clearTimeout(subwayTimer);
                    try{src.stop(); subwayNoise.stop();}catch(e){}
                },
                accent: null,
                onStart(handle) {
                    // Car horn / pigeon on a loose schedule
                    const fire = () => {
                        if (!handle.alive || !enabled) return;
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
            return {
                alive: true,
                g,
                stop(){
                    this.alive = false;
                    try{src.stop(); waterLfo.stop(); heli.stop(); rotor.stop();}catch(e){}
                },
                onStart(handle) {
                    // Gulls — pair of descending square sweeps every 7-14s
                    const gull = () => {
                        if (!handle.alive || !enabled) return;
                        const t = c.currentTime;
                        sweep(2100, 900, 0.28, 'square', 0.06, t);
                        sweep(2400, 1100, 0.24, 'square', 0.04, t + 0.32);
                        // Occasionally a second bird answers
                        if (Math.random() < 0.45) {
                            sweep(1900, 1000, 0.24, 'square', 0.05, t + 0.85);
                        }
                        setTimeout(gull, 7000 + Math.random() * 7000);
                    };
                    setTimeout(gull, 2500);
                }
            };
        },
        // Stage: club gig — dense applause bursts of 1/2/3 seconds at random
        //         intervals + random whistles over a quiet room tone.
        stage() {
            const c = ctx;
            const g = c.createGain(); g.gain.value = 0;
            // Quiet room tone
            const room = makeLoopNoise('brown');
            const roomLp = c.createBiquadFilter();
            roomLp.type = 'lowpass'; roomLp.frequency.value = 240; roomLp.Q.value = 0.4;
            const roomGain = c.createGain(); roomGain.gain.value = 0.3;
            room.connect(roomLp).connect(roomGain).connect(g);
            g.connect(c.destination);
            room.start();
            return {
                alive: true,
                g,
                stop(){
                    this.alive = false;
                    try{room.stop();}catch(e){}
                },
                onStart(handle) {
                    // Dense applause burst: dur picked from {1, 2, 3}s. Many
                    // overlapping short clap-bursts fired per second to feel
                    // like ~20 people clapping together. Fade in/out inside
                    // the burst so it doesn't start or stop abruptly.
                    const burst = () => {
                        if (!handle.alive || !enabled) return;
                        const durs = [1.0, 2.0, 3.0];
                        const dur = durs[Math.floor(Math.random() * durs.length)];
                        const t0 = c.currentTime;
                        const rate = 35;                          // claps per second
                        const count = Math.floor(rate * dur);
                        for (let i = 0; i < count; i++) {
                            const pos = i / count;                // 0..1
                            // Envelope ramps up first 12%, holds, fades last 25%
                            let env;
                            if (pos < 0.12) env = pos / 0.12;
                            else if (pos > 0.75) env = (1 - pos) / 0.25;
                            else env = 1;
                            const when = t0 + (i / rate) + (Math.random() - 0.5) * 0.03;
                            const vol = (0.07 + Math.random() * 0.06) * env;
                            const freq = 1700 + Math.random() * 2200;
                            noise(0.04 + Math.random() * 0.03,
                                  vol, Math.max(t0, when),
                                  freq, 2.5 + Math.random() * 2);
                        }
                        const gap = 2000 + Math.random() * 7000;  // 2-9s quiet
                        setTimeout(burst, dur * 1000 + gap);
                    };
                    // Whistle — loose schedule, random intervals
                    const whistle = () => {
                        if (!handle.alive || !enabled) return;
                        const t = c.currentTime;
                        sweep(1800, 2500, 0.38, 'square', 0.07, t);
                        sweep(2200, 2900, 0.32, 'square', 0.05, t + 0.02);
                        setTimeout(whistle, 4000 + Math.random() * 9000);
                    };
                    setTimeout(burst, 1500);
                    setTimeout(whistle, 3500);
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
                alive: true,
                g,
                stop(){
                    this.alive = false;
                    clearTimeout(bassTimer);
                    try{chat.stop(); bassOsc.stop();}catch(e){}
                },
                accent: null,
                onStart(handle) {
                    let step = 0;
                    const tick = () => {
                        if (!handle.alive || !enabled) return;
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
                        if (!handle.alive || !enabled) return;
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
        },
        // Pub party: unlocked after all 6 secrets. Energetic punk groove
        // (kick/snare/hi-hat + walking bass + square lead) through the wall
        // with loud chatter + occasional WOOO cheers. ~150 BPM.
        pubParty() {
            const c = ctx;
            const g = c.createGain(); g.gain.value = 0;
            // Wall-muffled bus — everything pub-side goes through this
            const wall = c.createBiquadFilter();
            wall.type = 'lowpass'; wall.frequency.value = 520; wall.Q.value = 0.6;
            wall.connect(g);
            g.connect(c.destination);
            // Celebratory chatter
            const chat = makeLoopNoise('pink');
            const chatFilt = c.createBiquadFilter();
            chatFilt.type = 'bandpass'; chatFilt.frequency.value = 750; chatFilt.Q.value = 0.9;
            const chatGain = c.createGain(); chatGain.gain.value = 0.32;
            chat.connect(chatFilt).connect(chatGain).connect(wall);
            // Bass and lead synths — driven per 8th note from tick()
            const bass = c.createOscillator();
            bass.type = 'sawtooth'; bass.frequency.value = 110;
            const bassAmp = c.createGain(); bassAmp.gain.value = 0.0001;
            bass.connect(bassAmp).connect(wall);
            const lead = c.createOscillator();
            lead.type = 'square'; lead.frequency.value = 440;
            const leadAmp = c.createGain(); leadAmp.gain.value = 0.0001;
            lead.connect(leadAmp).connect(wall);
            chat.start(); bass.start(); lead.start();
            let timer = null;
            return {
                alive: true,
                g,
                stop(){
                    this.alive = false;
                    clearTimeout(timer);
                    try{chat.stop(); bass.stop(); lead.stop();}catch(e){}
                },
                onStart(handle) {
                    // 150 BPM, driving 8ths. 8-step loop = 2 bars of 4/4.
                    const BPM = 150;
                    const eighth = 60 / BPM / 2; // ~0.2s
                    // Bass: A2 A2 A2 A2 E2 E2 E2 E2 (root / fifth, punk pattern)
                    const bassNotes = [110, 110, 110, 110, 82.4, 82.4, 82.4, 82.4];
                    // Lead: simple punk riff on A minor pentatonic
                    //       0 = rest. A4, C5, A4, C5, E4, 0, A4, 0
                    const leadNotes = [440, 523.25, 440, 523.25, 329.63, 0, 440, 0];
                    let step = 0;
                    const tick = () => {
                        if (!handle.alive || !enabled) return;
                        const t = c.currentTime;
                        // Kick on every quarter (even 8th steps 0,2,4,6)
                        if (step % 2 === 0) {
                            sweep(90, 42, 0.11, 'sine', 0.28, t);
                            noise(0.02, 0.14, t, 1400, 2);
                        }
                        // Snare on beats 2 and 4 (steps 2 and 6)
                        if (step === 2 || step === 6) {
                            noise(0.08, 0.14, t, 780, 3);
                            noise(0.04, 0.10, t, 3400, 4);
                        }
                        // Closed hi-hat on every 8th
                        noise(0.025, 0.055, t, 6200, 3.5);
                        // Bass pluck
                        bass.frequency.setValueAtTime(bassNotes[step], t);
                        bassAmp.gain.cancelScheduledValues(t);
                        bassAmp.gain.setValueAtTime(0.0001, t);
                        bassAmp.gain.exponentialRampToValueAtTime(0.22, t + 0.008);
                        bassAmp.gain.exponentialRampToValueAtTime(0.04, t + eighth * 0.95);
                        // Lead (skip on rests)
                        const lf = leadNotes[step];
                        if (lf > 0) {
                            lead.frequency.setValueAtTime(lf, t);
                            leadAmp.gain.cancelScheduledValues(t);
                            leadAmp.gain.setValueAtTime(0.0001, t);
                            leadAmp.gain.exponentialRampToValueAtTime(0.09, t + 0.008);
                            leadAmp.gain.exponentialRampToValueAtTime(0.0001, t + eighth * 0.85);
                        }
                        step = (step + 1) % 8;
                        timer = setTimeout(tick, eighth * 1000);
                    };
                    // Crowd cheer every 5-12s
                    const cheer = () => {
                        if (!handle.alive || !enabled) return;
                        const t = c.currentTime;
                        const len = 0.55 + Math.random() * 0.35;
                        const buf = c.createBuffer(1, Math.floor(c.sampleRate * len), c.sampleRate);
                        const d2 = buf.getChannelData(0);
                        for (let k = 0; k < d2.length; k++) d2[k] = Math.random()*2-1;
                        const srcW = c.createBufferSource(); srcW.buffer = buf;
                        const bp = c.createBiquadFilter();
                        bp.type = 'bandpass'; bp.Q.value = 3.5;
                        bp.frequency.setValueAtTime(550, t);
                        bp.frequency.linearRampToValueAtTime(950, t + len * 0.45);
                        bp.frequency.linearRampToValueAtTime(650, t + len);
                        const gW = c.createGain();
                        gW.gain.setValueAtTime(0.0001, t);
                        gW.gain.exponentialRampToValueAtTime(0.13, t + 0.08);
                        gW.gain.exponentialRampToValueAtTime(0.0001, t + len);
                        srcW.connect(bp).connect(gW).connect(wall);
                        srcW.start(t); srcW.stop(t + len + 0.02);
                        setTimeout(cheer, 5000 + Math.random() * 7000);
                    };
                    tick();
                    setTimeout(cheer, 2500);
                }
            };
        }
    };

    const AMBIENT_VOL = {
        desert: 0.16, brooklyn: 0.14, bridge: 0.14, stage: 0.14, pub: 0.16, pubParty: 0.19
    };

    function isPartyMode() {
        return document.body && document.body.classList.contains('egg-party');
    }

    // Walker group half-width in wrapper-local pixels. Matches band-walkers
    // geometry: CHAR_W=18, GAP=14, 3 chars × P=4 → 328 px, ×0.65 on mobile.
    function walkerHalfGroup() {
        const isM = window.innerWidth <= 768;
        return isM ? Math.round(328 * 0.65 / 2) : 164;
    }

    function walkerCenterWorld() {
        const vw = window.innerWidth;
        if (typeof window._mobileScrollX === 'number') {
            return window._mobileScrollX + vw / 2;
        }
        const wrapper = document.getElementById('horizontalWrapper');
        if (!wrapper) return vw / 2;
        const maxY = document.body.scrollHeight - window.innerHeight;
        const totalWidth = wrapper.scrollWidth;
        const maxScroll = totalWidth - vw;
        const progress = maxY > 0 ? Math.max(0, Math.min(1, window.scrollY / maxY)) : 0;
        return progress * maxScroll + vw / 2;
    }

    const SECTION_IDS = ['home', 'about', 'live', 'stage', 'pub'];
    const SECTION_NAMES = ['desert', 'brooklyn', 'bridge', 'stage', 'pub'];

    function computeActiveSections() {
        const center = walkerCenterWorld();
        const half = walkerHalfGroup();
        const wl = center - half;
        const wr = center + half;
        const out = new Set();
        for (let i = 0; i < SECTION_IDS.length; i++) {
            const el = document.getElementById(SECTION_IDS[i]);
            if (!el) continue;
            const sl = el.offsetLeft;
            const sr = sl + el.offsetWidth;
            if (wr >= sl && wl <= sr) out.add(SECTION_NAMES[i]);
        }
        // Fallback — if nothing matched (e.g. layout not ready), seed with
        // a scroll-progress guess so we still play something.
        if (out.size === 0) {
            const maxY = document.body.scrollHeight - window.innerHeight;
            const p = maxY > 0 ? window.scrollY / maxY : 0;
            if (p < 0.20) out.add('desert');
            else if (p < 0.40) out.add('brooklyn');
            else if (p < 0.60) out.add('bridge');
            else if (p < 0.86) out.add('stage');
            else out.add('pub');
        }
        // Party mode after 6/6 secrets: pub ambient upgrades to energetic groove
        if (out.has('pub') && isPartyMode()) {
            out.delete('pub');
            out.add('pubParty');
        }
        return out;
    }

    function startAmbient(name) {
        const c = ensureCtx();
        if (!c) return;
        const builder = AMBIENTS[name];
        if (!builder) return;
        let amb;
        try { amb = builder(); } catch (e) { console.error('[ambient build]', name, e); return; }
        activeAmbients[name] = amb;
        activeSet.add(name);
        const t = c.currentTime;
        const fade = 1.0;
        amb.g.gain.setValueAtTime(0.0001, t);
        amb.g.gain.exponentialRampToValueAtTime(AMBIENT_VOL[name] || 0.12, t + fade);
        if (typeof amb.onStart === 'function') {
            try { amb.onStart(amb); } catch (e) { console.error('[ambient onStart]', name, e); }
        }
    }

    function fadeOutAmbient(name, fadeSec) {
        const amb = activeAmbients[name];
        if (!amb) return;
        delete activeAmbients[name];
        activeSet.delete(name);
        const c = ctx;
        if (!c) { amb.stop(); return; }
        const t = c.currentTime;
        const fade = fadeSec != null ? fadeSec : 1.0;
        try {
            amb.g.gain.cancelScheduledValues(t);
            amb.g.gain.setValueAtTime(amb.g.gain.value || 0.0001, t);
            amb.g.gain.exponentialRampToValueAtTime(0.0001, t + fade);
        } catch (e) { /* ignore */ }
        setTimeout(() => { try { amb.stop(); } catch(e){} }, (fade + 0.1) * 1000);
    }

    function syncAmbients() {
        if (!enabled) return;
        const want = computeActiveSections();
        // Stop ambients that should no longer be active (last walker left
        // the section)
        for (const name of Array.from(activeSet)) {
            if (!want.has(name)) fadeOutAmbient(name, 1.0);
        }
        // Start ambients that just became active (first walker entered)
        for (const name of want) {
            if (!activeAmbients[name]) startAmbient(name);
        }
    }

    function stopAllAmbients() {
        for (const name of Array.from(activeSet)) fadeOutAmbient(name, 0.35);
    }

    let scrollScheduled = false;
    function onScroll() {
        if (!enabled || scrollScheduled) return;
        scrollScheduled = true;
        requestAnimationFrame(() => {
            scrollScheduled = false;
            if (!enabled) return;
            syncAmbients();
        });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('scroll', onScroll, { passive: true, capture: true });

    // 6/6 secrets unlocked while the user is already standing in the pub —
    // swap muffled groove for the party scene immediately.
    window.addEventListener('easterEggsComplete', () => {
        if (!enabled) return;
        if (activeAmbients.pub) fadeOutAmbient('pub', 0.6);
        setTimeout(syncAmbients, 650);
    });

    function setEnabled(v) {
        enabled = !!v;
        renderBtn();
        if (enabled) {
            syncAmbients();
        } else {
            stopAllAmbients();
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
            ? '<span class="sound-icon" aria-hidden="true">♪</span><span class="sound-label">SOUND ON</span>'
            : '<span class="sound-icon" aria-hidden="true">♪</span><span class="sound-label">SOUND OFF</span>';
    }

    window.Sound = { play, isEnabled: () => enabled, setEnabled };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', buildBtn);
    } else {
        buildBtn();
    }
})();
