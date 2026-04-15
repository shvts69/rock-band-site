/* ========================================
   VISUAL EFFECTS
   ======================================== */

(function() {

    // ====== STAGE EFFECTS: flashes + moving spotlights ======
    function initRandomFlashes() {
        const PIXEL = 4;
        const parent = document.querySelector('.section-stage .stage-bg');
        if (!parent) return;

        const canvas = document.createElement('canvas');
        canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:8;';
        const section = parent.closest('.section') || parent;
        canvas.width = section.offsetWidth || parent.offsetWidth;
        canvas.height = section.offsetHeight || parent.offsetHeight;
        parent.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        const W = canvas.width / PIXEL;
        const H = canvas.height / PIXEL;
        ctx.setTransform(PIXEL, 0, 0, PIXEL, 0, 0);
        ctx.imageSmoothingEnabled = false;

        // Flashes state
        const flashes = [];
        let nextFlash = 0;

        // Spotlight positions (moving)
        const spots = [
            { x: W * 0.2, speed: 0.3, phase: 0, r: 255, g: 50, b: 50 },
            { x: W * 0.4, speed: 0.25, phase: 1.5, r: 255, g: 200, b: 50 },
            { x: W * 0.6, speed: 0.35, phase: 3, r: 50, g: 100, b: 255 },
            { x: W * 0.8, speed: 0.2, phase: 4.5, r: 255, g: 50, b: 200 },
        ];

        function animate() {
            ctx.clearRect(0, 0, W, H);
            const t = Date.now() * 0.001;

            // Moving spotlights
            spots.forEach(sp => {
                const spotX = Math.floor(sp.x + Math.sin(t * sp.speed + sp.phase) * W * 0.12);
                // Bright beam cone
                for (let y = 7; y < H * 0.7; y++) {
                    const bt = (y - 7) / (H * 0.7 - 7);
                    const beamW = Math.floor(2 + bt * 18);
                    for (let dx = -beamW; dx <= beamW; dx++) {
                        const dist = Math.abs(dx) / beamW;
                        const alpha = (1 - dist) * (1 - bt) * 0.12;
                        if (alpha > 0.01) {
                            ctx.fillStyle = `rgba(${sp.r},${sp.g},${sp.b},${alpha})`;
                            ctx.fillRect(spotX + dx, y, 1, 1);
                        }
                    }
                }
                // Light fixture — detailed
                // Mount bracket
                ctx.fillStyle = '#333';
                ctx.fillRect(spotX - 1, 3, 3, 2);
                // Housing (dark metal)
                ctx.fillStyle = '#222';
                ctx.fillRect(spotX - 2, 5, 5, 3);
                ctx.fillStyle = '#2a2a2a';
                ctx.fillRect(spotX - 2, 5, 5, 1);
                // Lens (bright, colored)
                ctx.fillStyle = `rgb(${sp.r},${sp.g},${sp.b})`;
                ctx.fillRect(spotX - 1, 7, 3, 1);
                // Lens glow
                ctx.fillStyle = `rgba(${sp.r},${sp.g},${sp.b},0.5)`;
                ctx.fillRect(spotX - 2, 8, 5, 1);
                // Bright center of lens
                ctx.fillStyle = '#fff';
                ctx.fillRect(spotX, 7, 1, 1);
            });

            // Camera flashes — random bursts
            if (t > nextFlash) {
                flashes.push({
                    x: Math.floor(10 + Math.random() * (W - 20)),
                    y: Math.floor(H * 0.88 + Math.random() * H * 0.08),
                    life: 0.15,
                    born: t
                });
                nextFlash = t + 0.2 + Math.random() * 0.5;
            }

            // Draw flashes
            for (let i = flashes.length - 1; i >= 0; i--) {
                const f = flashes[i];
                const age = t - f.born;
                if (age > f.life) {
                    flashes.splice(i, 1);
                    continue;
                }
                const alpha = 1 - age / f.life;
                // Bright center
                ctx.fillStyle = `rgba(255,255,255,${alpha})`;
                ctx.fillRect(f.x, f.y, 2, 2);
                // Glow
                ctx.fillStyle = `rgba(255,255,255,${alpha * 0.5})`;
                ctx.fillRect(f.x - 1, f.y, 1, 2);
                ctx.fillRect(f.x + 2, f.y, 1, 2);
                ctx.fillRect(f.x, f.y - 1, 2, 1);
                ctx.fillRect(f.x, f.y + 2, 2, 1);
                // Wide glow
                ctx.fillStyle = `rgba(255,255,200,${alpha * 0.2})`;
                ctx.fillRect(f.x - 2, f.y - 1, 6, 4);
            }

            // === SOUND WAVES from ALL speakers (vibrating arcs both sides) ===
            const stY = Math.floor(H * 0.855);
            const stLeft = Math.floor(W * 0.08);
            const stRight = Math.floor(W * 0.92);

            // Floor speakers — center Y of stack
            const floorSpeakers = [
                { x: stLeft + 7, y: stY - 10 },
                { x: stRight - 6, y: stY - 10 }
            ];
            // Hanging speakers — from ceiling
            const hangingSpeakers = [
                { x: 7, y: 19 },
                { x: W - 6, y: 19 }
            ];

            const allSpeakers = [...floorSpeakers, ...hangingSpeakers];

            allSpeakers.forEach((sp, si) => {
                // Arcs going BOTH left and right from each speaker
                [-1, 1].forEach(dir => {
                    for (let wave = 0; wave < 3; wave++) {
                        const dist = 3 + wave * 4;
                        const vibrate = Math.sin(t * 8 + wave * 2 + si * 3 + dir) * 1.5;
                        const alpha = 0.18 - wave * 0.05;
                        for (let a = -0.8; a <= 0.8; a += 0.12) {
                            const ax = sp.x + Math.floor((dist + vibrate) * dir * Math.cos(a));
                            const ay = sp.y + Math.floor((dist + vibrate) * Math.sin(a));
                            ctx.fillStyle = `rgba(255,255,255,${alpha})`;
                            ctx.fillRect(ax, ay, 1, 1);
                        }
                    }
                });
            });

            // === LOGO 5051 flickering + lightning ===
            const gs = 3;
            const logoTotalW = 23 * gs;
            const logoStageY = Math.floor(H * 0.855);
            const logoLX = Math.floor(W * 0.5) - Math.floor(logoTotalW / 2);
            const logoLY = logoStageY - 38 - 6 * gs;

            // Intense neon flicker
            const flick = Math.sin(t * 12) > -0.2 ? 1 : 0;
            const flick2 = Math.sin(t * 7 + 2) > 0 ? 1 : 0;

            if (flick * flick2) {
                // Red glow pulse
                for (let dy = -3; dy <= 6 * gs + 3; dy++) {
                    for (let dx = -3; dx <= logoTotalW + 3; dx++) {
                        const a = 0.06;
                        ctx.fillStyle = `rgba(255,20,20,${a})`;
                        ctx.fillRect(logoLX + dx, logoLY + dy, 1, 1);
                    }
                }
            }

            // Lightning bolts from logo
            if (Math.random() > 0.6) {
                const boltX = logoLX + Math.floor(Math.random() * logoTotalW);
                const boltY = logoLY + Math.floor(Math.random() * 6 * gs);
                const dirX = (Math.random() - 0.5) * 3;
                const dirY = (Math.random() - 0.5) * 3;
                const len = 3 + Math.floor(Math.random() * 5);
                for (let bi = 0; bi < len; bi++) {
                    const bx = Math.floor(boltX + bi * dirX + (Math.random() - 0.5) * 2);
                    const by = Math.floor(boltY + bi * dirY + (Math.random() - 0.5) * 2);
                    ctx.fillStyle = bi === 0 ? '#fff' : '#ffdd44';
                    ctx.fillRect(bx, by, 1, 1);
                }
            }

            requestAnimationFrame(animate);
        }
        animate();
    }

    // ====== ЗІРКИ що мигають (додаткові в секції live) ======
    function initExtraStars() {
        const nightSky = document.querySelector('.night-sky');
        if (!nightSky) return;

        for (let i = 0; i < 30; i++) {
            const star = document.createElement('div');
            const size = Math.random() > 0.7 ? 4 : 2;
            star.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: #fff;
                top: ${Math.random() * 30}%;
                left: ${Math.random() * 100}%;
                opacity: ${0.3 + Math.random() * 0.7};
                animation: twinkle ${1.5 + Math.random() * 2}s ease-in-out infinite alternate;
                animation-delay: ${Math.random() * 3}s;
            `;
            nightSky.appendChild(star);
        }
    }

    // ====== RIVER REFLECTIONS (відблиски на воді) ======
    function initRiverReflections() {
        const river = document.querySelector('.river');
        if (!river) return;

        for (let i = 0; i < 8; i++) {
            const reflection = document.createElement('div');
            reflection.style.cssText = `
                position: absolute;
                width: ${4 + Math.random() * 8}px;
                height: 2px;
                background: rgba(100, 150, 255, 0.3);
                top: ${10 + Math.random() * 40}px;
                left: ${Math.random() * 100}%;
                animation: riverFlow ${3 + Math.random() * 4}s linear infinite;
                opacity: ${0.2 + Math.random() * 0.5};
            `;
            river.appendChild(reflection);
        }
    }

    // ====== TWINKLING STARS on canvas (sections 2, 3) ======
    function initTwinklingStars() {
        const PIXEL = 4;
        const sections = [
            { sel: '.section-home .home-bg', starCount: 0, maxY: 0, sun: true },
            { sel: '.section-about .about-bg', starCount: 80, maxY: 0.35, moon: true },
            { sel: '.section-live .live-bg', starCount: 120, maxY: 0.5, torch: true }
        ];

        sections.forEach(sec => {
            const parent = document.querySelector(sec.sel);
            if (!parent) return;

            const canvas = document.createElement('canvas');
            canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:5;';
            parent.style.position = 'relative';
            parent.appendChild(canvas);

            let ctx, W, H, stars, sunX, sunY, moonX, moonY;

            function resize() {
                // Use the section parent (not .bg) for reliable dimensions
                const section = parent.closest('.section') || parent;
                const w = section.offsetWidth || parent.offsetWidth || window.innerWidth;
                const h = section.offsetHeight || parent.offsetHeight || window.innerHeight;
                canvas.width = w;
                canvas.height = h;
                ctx = canvas.getContext('2d');
                W = canvas.width / PIXEL;
                H = canvas.height / PIXEL;
                ctx.setTransform(PIXEL, 0, 0, PIXEL, 0, 0);
                ctx.imageSmoothingEnabled = false;

                sunX = Math.floor(W * 0.3);
                sunY = Math.floor(H * 0.28);
                moonX = Math.floor(W * 0.85);
                moonY = Math.floor(H * 0.1);

                // Regenerate stars for new size
                stars = [];
                for (let i = 0; i < sec.starCount; i++) {
                    stars.push({
                        x: Math.floor(Math.random() * W),
                        y: Math.floor(Math.random() * H * sec.maxY),
                        speed: 0.5 + Math.random() * 2,
                        phase: Math.random() * Math.PI * 2,
                        maxAlpha: 0.3 + Math.random() * 0.5,
                        size: Math.random() > 0.85 ? 2 : 1,
                        r: 200 + Math.floor(Math.random() * 55),
                        g: 200 + Math.floor(Math.random() * 55),
                        b: 220 + Math.floor(Math.random() * 35)
                    });
                }
            }
            resize();

            function animate() {
                ctx.clearRect(0, 0, W, H);
                const t = Date.now() * 0.001;

                // Twinkling stars
                stars.forEach(s => {
                    const alpha = s.maxAlpha * (0.2 + 0.8 * Math.abs(Math.sin(t * s.speed + s.phase)));
                    ctx.fillStyle = `rgba(${s.r},${s.g},${s.b},${alpha})`;
                    ctx.fillRect(s.x, s.y, s.size, s.size);
                    const glowAlpha = alpha * 0.35;
                    ctx.fillStyle = `rgba(${s.r},${s.g},${s.b},${glowAlpha})`;
                    ctx.fillRect(s.x - 1, s.y, 1, 1);
                    ctx.fillRect(s.x + s.size, s.y, 1, 1);
                    ctx.fillRect(s.x, s.y - 1, 1, 1);
                    ctx.fillRect(s.x, s.y + s.size, 1, 1);
                });

                // Sun pulsing glow (section 1) — on the sun itself + corona
                if (sec.sun) {
                    const pulse = 0.6 + 0.4 * Math.sin(t * 0.6);
                    const pulse2 = 0.5 + 0.5 * Math.sin(t * 1.1 + 1);
                    const pulse3 = 0.7 + 0.3 * Math.sin(t * 0.4 + 2);
                    // Bright shimmer on sun body
                    for (let dy = -6; dy <= 6; dy++) {
                        for (let dx = -6; dx <= 6; dx++) {
                            const d = Math.sqrt(dx * dx + dy * dy);
                            if (d <= 6) {
                                const a = 0.25 * pulse2;
                                ctx.fillStyle = `rgba(255,255,180,${a})`;
                                ctx.fillRect(sunX + dx, sunY + dy, 1, 1);
                            }
                        }
                    }
                    // Inner corona
                    for (let dy = -14; dy <= 14; dy++) {
                        for (let dx = -14; dx <= 14; dx++) {
                            const d = Math.sqrt(dx * dx + dy * dy);
                            if (d > 5 && d <= 14) {
                                const a = (0.25 - (d - 5) * 0.025) * pulse;
                                if (a > 0) {
                                    ctx.fillStyle = `rgba(255,150,40,${a})`;
                                    ctx.fillRect(sunX + dx, sunY + dy, 1, 1);
                                }
                            }
                        }
                    }
                    // Outer glow
                    for (let dy = -22; dy <= 22; dy++) {
                        for (let dx = -22; dx <= 22; dx++) {
                            const d = Math.sqrt(dx * dx + dy * dy);
                            if (d > 14 && d <= 22) {
                                const a = (0.12 - (d - 14) * 0.013) * pulse3;
                                if (a > 0) {
                                    ctx.fillStyle = `rgba(255,100,20,${a})`;
                                    ctx.fillRect(sunX + dx, sunY + dy, 1, 1);
                                }
                            }
                        }
                    }
                }

                // Statue torch flicker (section 3)
                if (sec.torch) {
                    const torchX = Math.floor(W * 0.12) + 3;
                    const wY = Math.floor(H * 0.6);
                    const torchY = wY + 4 - 38; // statueBase - 38
                    const flicker1 = 0.5 + 0.5 * Math.sin(t * 6);
                    const flicker2 = 0.5 + 0.5 * Math.sin(t * 9 + 1);
                    const flicker = flicker1 * 0.6 + flicker2 * 0.4;
                    // Flickering flame
                    ctx.fillStyle = `rgba(255,220,50,${0.4 + flicker * 0.4})`;
                    ctx.fillRect(torchX, torchY, 1, 1);
                    ctx.fillStyle = `rgba(255,180,30,${0.3 + flicker * 0.3})`;
                    ctx.fillRect(torchX - 1, torchY, 1, 1);
                    ctx.fillRect(torchX + 1, torchY, 1, 1);
                    ctx.fillStyle = `rgba(255,200,40,${0.2 + flicker * 0.4})`;
                    ctx.fillRect(torchX, torchY - 1, 1, 1);
                    // Glow
                    for (let dy = -4; dy <= 4; dy++) {
                        for (let dx = -4; dx <= 4; dx++) {
                            const d = Math.sqrt(dx * dx + dy * dy);
                            if (d > 0 && d <= 4) {
                                const a = (0.15 - d * 0.03) * flicker;
                                if (a > 0) {
                                    ctx.fillStyle = `rgba(255,180,50,${a})`;
                                    ctx.fillRect(torchX + dx, torchY + dy, 1, 1);
                                }
                            }
                        }
                    }
                }

                // Flickering street lamps (section 2) — lamp 1 and 3
                if (sec.moon) {
                    const lampSpacing = Math.floor(W / 4);
                    const flickerLamps = [0, 1, 2, 3]; // all 4
                    flickerLamps.forEach(li => {
                        const lx = Math.floor(lampSpacing * 0.5 + li * lampSpacing) - 2;
                        const lampTopY = Math.floor(H * 0.855) - 23;
                        // Erratic flicker
                        const f1 = Math.sin(t * 8 + li * 5) > 0.2 ? 1 : 0;
                        const f2 = Math.sin(t * 13 + li * 3) > -0.3 ? 1 : 0;
                        const f3 = Math.sin(t * 3 + li) > 0 ? 1 : 0;
                        const on = f1 * f2 * f3;
                        if (on) {
                            // Bright flash — light cone
                            for (let cy = 0; cy < 18; cy++) {
                                const ct = cy / 18;
                                const hw = Math.floor(2 + ct * 10);
                                const a = 0.15 * (1 - ct * 0.6);
                                ctx.fillStyle = `rgba(255,200,80,${a})`;
                                ctx.fillRect(lx - hw, lampTopY + cy, hw * 2 + 1, 1);
                            }
                            // Bulb bright
                            ctx.fillStyle = 'rgba(255,220,100,0.5)';
                            ctx.fillRect(lx - 1, lampTopY, 3, 1);
                        } else {
                            // Dark — dim bulb
                            ctx.fillStyle = 'rgba(60,40,10,0.3)';
                            ctx.fillRect(lx - 1, lampTopY, 3, 1);
                        }
                    });
                }

                // Moon pulsing aura (section 2)
                if (sec.moon) {
                    const pulse = 0.7 + 0.3 * Math.sin(t * 0.5);
                    for (let dy = -14; dy <= 14; dy++) {
                        for (let dx = -14; dx <= 14; dx++) {
                            const d = Math.sqrt(dx * dx + dy * dy);
                            if (d > 6 && d <= 14) {
                                const a = (0.1 - (d - 6) * 0.01) * pulse;
                                if (a > 0) {
                                    ctx.fillStyle = `rgba(220,220,200,${a})`;
                                    ctx.fillRect(moonX + dx, moonY + dy, 1, 1);
                                }
                            }
                        }
                    }
                }

                requestAnimationFrame(animate);
            }
            animate();
        });
    }

    // ====== EAGLE flying across section 1 ======
    function initEagle() {
        const PIXEL = 4;
        const parent = document.querySelector('.section-home .home-bg');
        if (!parent) return;

        const canvas = document.createElement('canvas');
        canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:6;';
        const section = parent.closest('.section') || parent;
        canvas.width = section.offsetWidth || parent.offsetWidth;
        canvas.height = section.offsetHeight || parent.offsetHeight;
        parent.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        const W = canvas.width / PIXEL;
        const H = canvas.height / PIXEL;
        ctx.setTransform(PIXEL, 0, 0, PIXEL, 0, 0);
        ctx.imageSmoothingEnabled = false;

        // Eagle pixel art sprite — detailed bald eagle
        function getEagleFrame(wingPhase) {
            const pixels = [];
            const body = '#3a2a1a';
            const bodyLight = '#4a3525';
            const bodyDark = '#2a1a0e';
            const wing = '#4a3520';
            const wingMid = '#5a4530';
            const wingLight = '#6a5540';
            const wingTip = '#1a0e05';
            const wingEdge = '#2a1a0a';
            const head = '#f0ece0';
            const headShade = '#d8d4c8';
            const beak = '#e8a800';
            const beakTip = '#cc8800';
            const eye = '#111';
            const tail = '#3a2a1a';
            const tailEdge = '#5a4a3a';
            const feet = '#e8a800';

            // === BODY (thick, 3 rows) ===
            for (let bx = -3; bx <= 3; bx++) {
                pixels.push({x:bx, y:0, c: bx < 0 ? bodyDark : bodyLight});
                pixels.push({x:bx, y:1, c: body});
            }
            for (let bx = -2; bx <= 2; bx++) {
                pixels.push({x:bx, y:-1, c: bodyLight});
                pixels.push({x:bx, y:2, c: bodyDark});
            }
            // Belly detail
            pixels.push({x:0, y:2, c:'#4a3a28'});
            pixels.push({x:1, y:2, c:'#4a3a28'});

            // === HEAD (white, larger) ===
            pixels.push({x:4, y:0, c:head}); pixels.push({x:5, y:0, c:head});
            pixels.push({x:4, y:-1, c:head}); pixels.push({x:5, y:-1, c:head});
            pixels.push({x:4, y:-2, c:head}); pixels.push({x:5, y:-2, c:headShade});
            pixels.push({x:6, y:-1, c:head}); pixels.push({x:6, y:0, c:headShade});
            pixels.push({x:3, y:-1, c:headShade}); pixels.push({x:3, y:-2, c:headShade});
            // Eye
            pixels.push({x:6, y:-1, c:eye});
            // Brow ridge
            pixels.push({x:5, y:-2, c:'#e0dcd0'});
            // Beak (hooked)
            pixels.push({x:7, y:0, c:beak});
            pixels.push({x:8, y:0, c:beakTip});
            pixels.push({x:7, y:1, c:beakTip});
            pixels.push({x:7, y:-1, c:beak});

            // === TAIL FEATHERS (fan shape) ===
            for (let i = 0; i < 5; i++) {
                pixels.push({x:-4-i, y: Math.floor(i*0.3), c: i < 3 ? tail : tailEdge});
                pixels.push({x:-4-i, y: Math.floor(i*0.3)-1, c: i < 2 ? tail : tailEdge});
            }
            pixels.push({x:-5, y:1, c:tailEdge});
            pixels.push({x:-6, y:1, c:tailEdge});
            pixels.push({x:-7, y:2, c:'#4a3a2a'});
            pixels.push({x:-5, y:-1, c:tail});
            pixels.push({x:-6, y:-1, c:tailEdge});
            // Tail feather detail lines
            pixels.push({x:-6, y:0, c:'#3a2a1a'});
            pixels.push({x:-7, y:1, c:'#3a2a1a'});

            // === FEET (tucked under body) ===
            pixels.push({x:1, y:3, c:feet});
            pixels.push({x:2, y:3, c:feet});
            pixels.push({x:0, y:3, c:'#cc8800'});

            // === WINGS ===
            const wingAngle = Math.sin(wingPhase * Math.PI * 2);

            // Each wing: 10 segments, fan out from body
            for (let side = -1; side <= 1; side += 2) {
                if (side === 0) continue;
                for (let i = 1; i <= 10; i++) {
                    const t = i / 10;
                    const wy = Math.round(wingAngle * 4 * t); // tip moves most
                    const spreadX = side * Math.floor(i * 0.5);
                    const spreadY = -1 + wy;

                    // Primary feather color gradient
                    let c;
                    if (i <= 3) c = wing;
                    else if (i <= 5) c = wingMid;
                    else if (i <= 7) c = wingLight;
                    else if (i <= 9) c = wingEdge;
                    else c = wingTip;

                    // Main wing pixel
                    pixels.push({x: spreadX, y: spreadY - Math.floor(i * 0.15), c: c});
                    // Wing thickness (2-3 px wide)
                    pixels.push({x: spreadX, y: spreadY - Math.floor(i * 0.15) - 1, c: i <= 6 ? wingMid : wingEdge});
                    if (i <= 7) {
                        pixels.push({x: spreadX + (side > 0 ? -1 : 1), y: spreadY - Math.floor(i * 0.15), c: wing});
                    }
                    // Feather detail at tips
                    if (i >= 7) {
                        pixels.push({x: spreadX + side, y: spreadY - Math.floor(i * 0.15), c: wingTip});
                    }
                }
                // Wing coverts (shorter feathers near body)
                for (let i = 1; i <= 5; i++) {
                    const wy = Math.round(wingAngle * 2 * (i / 5));
                    pixels.push({x: side * Math.floor(i * 0.4), y: -2 + wy, c: wingMid});
                }
            }

            return pixels;
        }

        // Perched (sitting) eagle sprite
        function getEaglePerched() {
            const pixels = [];
            const body = '#3a2a1a', bodyLight = '#4a3525', bodyDark = '#2a1a0e';
            const wing = '#4a3520', wingMid = '#5a4530', wingLight = '#6a5540';
            const head = '#f0ece0', headShade = '#d8d4c8';
            const beak = '#e8a800', beakTip = '#cc8800', eye = '#111', feet = '#e8a800';

            // Head
            pixels.push({x:0,y:-6,c:head},{x:1,y:-6,c:head});
            pixels.push({x:-1,y:-5,c:headShade},{x:0,y:-5,c:head},{x:1,y:-5,c:head},{x:2,y:-5,c:head});
            pixels.push({x:-1,y:-4,c:headShade},{x:0,y:-4,c:head},{x:1,y:-4,c:head},{x:2,y:-4,c:headShade});
            pixels.push({x:2,y:-5,c:eye}); // eye
            pixels.push({x:0,y:-7,c:'#e0dcd0'},{x:1,y:-7,c:'#e0dcd0'}); // brow
            pixels.push({x:3,y:-5,c:beak},{x:3,y:-4,c:beakTip},{x:4,y:-4,c:beakTip}); // beak
            // Neck
            pixels.push({x:0,y:-3,c:headShade},{x:1,y:-3,c:body});
            // Body
            for (let by = -2; by <= 2; by++) {
                pixels.push({x:-1,y:by,c:bodyDark},{x:0,y:by,c:body},{x:1,y:by,c:body},{x:2,y:by,c:bodyLight});
            }
            pixels.push({x:1,y:-2,c:'#5a4530'},{x:2,y:-1,c:'#5a4530'});
            pixels.push({x:0,y:2,c:'#4a3a28'},{x:1,y:2,c:'#4a3a28'});
            // Folded wings
            for (let wy = -1; wy <= 3; wy++) { pixels.push({x:-2,y:wy,c:wing},{x:3,y:wy,c:wingMid}); }
            pixels.push({x:-3,y:1,c:wingMid},{x:-3,y:2,c:wingLight},{x:4,y:1,c:wingLight},{x:4,y:2,c:wingMid});
            pixels.push({x:-2,y:3,c:wingMid},{x:-1,y:3,c:wing},{x:2,y:3,c:wing},{x:3,y:3,c:wingMid});
            pixels.push({x:-3,y:3,c:wingLight},{x:4,y:3,c:wingLight});
            // Tail
            pixels.push({x:-1,y:4,c:'#3a2a1a'},{x:0,y:4,c:'#4a3a2a'},{x:1,y:4,c:'#3a2a1a'},{x:2,y:4,c:'#4a3a2a'});
            pixels.push({x:0,y:5,c:'#5a4a3a'},{x:1,y:5,c:'#5a4a3a'});
            // Feet/talons
            pixels.push({x:0,y:3,c:feet},{x:1,y:3,c:feet},{x:-1,y:4,c:'#cc8800'},{x:2,y:4,c:'#cc8800'});
            pixels.push({x:0,y:4,c:feet},{x:1,y:4,c:feet});
            return pixels;
        }

        // States
        const FLY = 0, DIVE = 1, LAND = 2, PERCH = 3, TAKEOFF = 4;
        let eagleX = Math.floor(W * 0.3);
        let eagleBaseY = H * 0.15;
        let driftY = 0, driftTarget = 0, nextDriftChange = 0;
        const eagleSpeed = 0.2;
        let eagleState = FLY, stateTimer = 0;

        // Logo perch position
        const logo = document.querySelector('.band-logo');
        let perchX = W * 0.5, perchY = H * 0.4;
        if (logo) {
            const sr = section.getBoundingClientRect();
            const lr = logo.getBoundingClientRect();
            perchX = (lr.left + lr.width / 2 - sr.left) / PIXEL;
            perchY = (lr.top - sr.top) / PIXEL - 8;
        }

        let diveStartX, diveStartY, diveProgress;
        let eagleHover = false;

        section.addEventListener('mousemove', function(e) {
            const rect = section.getBoundingClientRect();
            const mx = (e.clientX - rect.left) / PIXEL;
            const my = (e.clientY - rect.top) / PIXEL;
            eagleHover = Math.sqrt((mx - eagleX) ** 2 + (my - eagleBaseY) ** 2) < 15;
            section.style.cursor = (eagleHover && eagleState === FLY) ? 'pointer' : '';
        });
        section.addEventListener('mouseleave', () => { eagleHover = false; });

        section.addEventListener('click', function(e) {
            if (eagleState !== FLY) return;
            const rect = section.getBoundingClientRect();
            const mx = (e.clientX - rect.left) / PIXEL;
            const my = (e.clientY - rect.top) / PIXEL;
            if (Math.sqrt((mx - eagleX) ** 2 + (my - eagleBaseY) ** 2) < 15) {
                eagleState = DIVE;
                diveStartX = eagleX;
                diveStartY = eagleBaseY;
                diveProgress = 0;
            }
        });

        function animate() {
            ctx.clearRect(0, 0, W, H);
            const t = Date.now() * 0.001;
            let ex, ey, wingPhase, drawPerched = false;

            if (eagleState === FLY) {
                if (t > nextDriftChange) { driftTarget = (Math.random() - 0.5) * 0.08; nextDriftChange = t + 5 + Math.random() * 8; }
                driftY += (driftTarget - driftY) * 0.005;
                eagleBaseY += driftY;
                if (eagleBaseY < H * 0.06) { eagleBaseY = H * 0.06; driftY = Math.abs(driftY); }
                if (eagleBaseY > H * 0.3) { eagleBaseY = H * 0.3; driftY = -Math.abs(driftY); }
                eagleX += eagleSpeed;
                if (eagleX > W + 25) { eagleX = -25; eagleBaseY = H * 0.08 + Math.random() * H * 0.18; }
                const bobY = Math.sin(t * 0.3) * 1;
                ex = Math.floor(eagleX); ey = Math.floor(eagleBaseY + bobY);
                const fc = (t * 0.4) % 1;
                wingPhase = fc < 0.6 ? fc / 0.6 : 0.5;

            } else if (eagleState === DIVE) {
                diveProgress += 0.012;
                const dp = Math.min(diveProgress, 1);
                const eased = dp < 0.5 ? 2 * dp * dp : 1 - Math.pow(-2 * dp + 2, 2) / 2;
                eagleX = diveStartX + (perchX - diveStartX) * eased;
                eagleBaseY = diveStartY + (perchY - diveStartY) * eased - Math.sin(dp * Math.PI) * 15;
                ex = Math.floor(eagleX); ey = Math.floor(eagleBaseY);
                wingPhase = (t * (1.5 - dp * 1.2)) % 1;
                if (dp >= 1) { eagleState = LAND; stateTimer = t; eagleX = perchX; eagleBaseY = perchY; }

            } else if (eagleState === LAND) {
                ex = Math.floor(perchX); ey = Math.floor(perchY);
                wingPhase = Math.max(0, 0.5 - (t - stateTimer) * 2);
                if (t - stateTimer > 0.4) { eagleState = PERCH; stateTimer = t; }

            } else if (eagleState === PERCH) {
                ex = Math.floor(perchX); ey = Math.floor(perchY);
                drawPerched = true;
                if (t - stateTimer > 4) { eagleState = TAKEOFF; stateTimer = t; }

            } else if (eagleState === TAKEOFF) {
                const elapsed = t - stateTimer;
                const dp = Math.min(elapsed / 1.5, 1);
                const targetY = H * 0.12;
                eagleX = perchX + dp * 30;
                eagleBaseY = perchY + (targetY - perchY) * dp - Math.sin(dp * Math.PI) * 20;
                ex = Math.floor(eagleX); ey = Math.floor(eagleBaseY);
                wingPhase = (t * 1.2) % 1;
                if (dp >= 1) { eagleState = FLY; eagleBaseY = targetY; }
            }

            // Draw
            if (drawPerched) {
                const pp = getEaglePerched();
                pp.forEach(p => { ctx.fillStyle = p.c; ctx.fillRect(ex + p.x, ey + p.y, 1, 1); });
                // Head look-around
                if (Math.sin(t * 1.5) > 0.8) {
                    ctx.fillStyle = '#f0ece0';
                    ctx.fillRect(ex, ey - 7, 2, 1);
                }
            } else {
                const pixels = getEagleFrame(wingPhase);
                pixels.forEach(p => { ctx.fillStyle = p.c; ctx.fillRect(ex + p.x, ey + p.y, 1, 1); });
            }

            // Hover glow
            if (eagleHover && eagleState === FLY) {
                for (let dy = -12; dy <= 12; dy++) {
                    for (let dx = -12; dx <= 12; dx++) {
                        const d = Math.sqrt(dx * dx + dy * dy);
                        if (d < 12) {
                            ctx.fillStyle = `rgba(255,230,180,${0.15 * (1 - d / 12)})`;
                            ctx.fillRect(ex + dx, ey + dy, 1, 1);
                        }
                    }
                }
            }

            // Shadow
            if (eagleState !== PERCH) {
                const shadowY = Math.floor(H * 0.56);
                const shadowSize = 3 + Math.floor((shadowY - ey) * 0.05);
                ctx.fillStyle = 'rgba(0,0,0,0.05)';
                for (let dx = -shadowSize; dx <= shadowSize; dx++) {
                    ctx.fillRect(ex + dx, shadowY + (Math.abs(dx) > shadowSize - 1 ? 0 : 1), 1, 1);
                }
            }

            requestAnimationFrame(animate);
        }
        animate();
    }

    // ====== TUMBLEWEED rolling across section 1 ======
    function initTumbleweed() {
        const PIXEL = 4;
        const parent = document.querySelector('.section-home .home-bg');
        if (!parent) return;

        const canvas = document.createElement('canvas');
        canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1;';
        const section = parent.closest('.section') || parent;
        canvas.width = section.offsetWidth || parent.offsetWidth;
        canvas.height = section.offsetHeight || parent.offsetHeight;
        parent.insertBefore(canvas, parent.children[1]);

        const ctx = canvas.getContext('2d');
        const W = canvas.width / PIXEL;
        const H = canvas.height / PIXEL;
        ctx.setTransform(PIXEL, 0, 0, PIXEL, 0, 0);
        ctx.imageSmoothingEnabled = false;

        const groundY = H * 0.68;
        let twX = -10;
        let twBaseY = groundY;
        let twDrift = 0;
        let twDriftTarget = 0;
        let twNextDrift = 0;
        let twRotation = 0;
        const twSpeed = 0.15;

        // Wind streaks
        const winds = [];

        function drawTumbleweedSprite(x, y, rot) {
            const colors = ['#8b6914', '#7b5904', '#6b4904', '#9b7924', '#5b3904'];
            // Rotating circle of sticks
            for (let a = 0; a < Math.PI * 2; a += 0.4) {
                const r = 3;
                const px = Math.floor(x + Math.cos(a + rot) * r);
                const py = Math.floor(y + Math.sin(a + rot) * r);
                const c = colors[Math.floor(a * 2) % colors.length];
                ctx.fillStyle = c;
                ctx.fillRect(px, py, 1, 1);
                // Inner stick
                const px2 = Math.floor(x + Math.cos(a + rot) * (r - 1.5));
                const py2 = Math.floor(y + Math.sin(a + rot) * (r - 1.5));
                ctx.fillRect(px2, py2, 1, 1);
            }
            // Core
            ctx.fillStyle = '#6b4904';
            ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
            ctx.fillRect(Math.floor(x) - 1, Math.floor(y), 1, 1);
            ctx.fillRect(Math.floor(x), Math.floor(y) - 1, 1, 1);
            // Outer wisps
            for (let a = 0; a < Math.PI * 2; a += 0.8) {
                const r = 3.5 + Math.sin(a * 3 + rot) * 0.5;
                const px = Math.floor(x + Math.cos(a + rot) * r);
                const py = Math.floor(y + Math.sin(a + rot) * r);
                ctx.fillStyle = '#5b3904';
                ctx.fillRect(px, py, 1, 1);
            }
        }

        function animate() {
            ctx.clearRect(0, 0, W, H);
            const t = Date.now() * 0.001;

            // Drift vertically — gentle random changes
            if (t > twNextDrift) {
                twDriftTarget = (Math.random() - 0.5) * 0.06;
                twNextDrift = t + 3 + Math.random() * 5;
            }
            twDrift += (twDriftTarget - twDrift) * 0.01;
            twBaseY += twDrift;
            if (twBaseY < groundY - 3) { twBaseY = groundY - 3; twDrift = Math.abs(twDrift); }
            if (twBaseY > groundY + 2) { twBaseY = groundY + 2; twDrift = -Math.abs(twDrift); }

            // Move and rotate
            twX += twSpeed;
            twRotation += 0.05;

            // Bounce slightly
            const bounceY = Math.abs(Math.sin(t * 3)) * 1.5;

            if (twX > W + 10) {
                twX = -10;
                twBaseY = groundY - 1 + Math.random() * 3;
            }

            const twY = twBaseY - bounceY;
            drawTumbleweedSprite(twX, twY, twRotation);

            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.08)';
            ctx.fillRect(Math.floor(twX) - 2, Math.floor(groundY) + 1, 5, 1);

            // Wind streaks near tumbleweed
            // Spawn new wind lines
            if (Math.random() > 0.85) {
                winds.push({
                    x: twX - 5 - Math.random() * 8,
                    y: twY - 2 + Math.random() * 5,
                    len: 3 + Math.floor(Math.random() * 6),
                    life: 0.3 + Math.random() * 0.4,
                    born: t
                });
            }

            // Draw and cleanup winds
            for (let i = winds.length - 1; i >= 0; i--) {
                const w = winds[i];
                const age = t - w.born;
                if (age > w.life) {
                    winds.splice(i, 1);
                    continue;
                }
                const alpha = (1 - age / w.life) * 0.25;
                ctx.fillStyle = `rgba(200,180,140,${alpha})`;
                // Wind line moving right
                const wx = w.x + age * 15;
                ctx.fillRect(Math.floor(wx), Math.floor(w.y), w.len, 1);
            }

            requestAnimationFrame(animate);
        }
        animate();
    }

    // ====== PLANES flying across section 2 sky ======
    function initPlanes() {
        const PIXEL = 4;
        const parent = document.querySelector('.section-about .about-bg');
        if (!parent) return;

        const canvas = document.createElement('canvas');
        canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:4;';
        const section = parent.closest('.section') || parent;
        canvas.width = section.offsetWidth || parent.offsetWidth;
        canvas.height = section.offsetHeight || parent.offsetHeight;
        parent.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        const W = canvas.width / PIXEL;
        const H = canvas.height / PIXEL;
        ctx.setTransform(PIXEL, 0, 0, PIXEL, 0, 0);
        ctx.imageSmoothingEnabled = false;

        // Plane 1: left to right
        const plane1 = { x: -20, y: H * 0.06, speed: 0.18, angle: 0.001 };
        // Plane 2: right to left
        const plane2 = { x: W + 20, y: H * 0.04, speed: -0.15, angle: -0.001 };

        function drawPlane(px, py, facingRight) {
            const x = Math.floor(px);
            const y = Math.floor(py);
            const d = facingRight ? 1 : -1;
            // Fuselage
            ctx.fillStyle = '#555';
            ctx.fillRect(x - 2, y, 5, 1);
            ctx.fillStyle = '#666';
            ctx.fillRect(x - 1, y - 1, 3, 1);
            // Nose
            ctx.fillStyle = '#777';
            ctx.fillRect(x + 3 * d, y, 1, 1);
            // Wings (perpendicular to fuselage)
            ctx.fillStyle = '#444';
            ctx.fillRect(x - 1, y - 2, 1, 5);
            ctx.fillRect(x, y - 2, 1, 5);
            // Tail fin
            ctx.fillStyle = '#555';
            ctx.fillRect(x - 3 * d, y - 2, 1, 3);
        }

        let beaconPhase = 0;

        function animate() {
            ctx.clearRect(0, 0, W, H);
            const t = Date.now() * 0.001;
            beaconPhase = t;

            // Move planes
            plane1.x += plane1.speed;
            plane1.y += plane1.angle;
            plane2.x += plane2.speed;
            plane2.y += plane2.angle;

            // Keep in safe zone: top 12% only
            if (plane1.y > H * 0.12) plane1.y = H * 0.12;
            if (plane1.y < H * 0.03) plane1.y = H * 0.03;
            if (plane2.y > H * 0.10) plane2.y = H * 0.10;
            if (plane2.y < H * 0.02) plane2.y = H * 0.02;

            // Loop
            if (plane1.x > W + 25) { plane1.x = -25; plane1.y = H * 0.05 + Math.random() * H * 0.04; }
            if (plane2.x < -25) { plane2.x = W + 25; plane2.y = H * 0.03 + Math.random() * H * 0.04; }

            drawPlane(plane1.x, plane1.y, true);
            drawPlane(plane2.x, plane2.y, false);

            // Blinking beacon lights
            const blink = Math.sin(beaconPhase * 4) > 0.3;
            if (blink) {
                // Plane 1 beacon — red
                ctx.fillStyle = '#ff2200';
                ctx.fillRect(Math.floor(plane1.x), Math.floor(plane1.y) - 2, 1, 1);
                ctx.fillStyle = 'rgba(255,34,0,0.3)';
                ctx.fillRect(Math.floor(plane1.x) - 1, Math.floor(plane1.y) - 2, 3, 1);

                // Plane 2 beacon — red
                ctx.fillStyle = '#ff2200';
                ctx.fillRect(Math.floor(plane2.x), Math.floor(plane2.y) - 2, 1, 1);
                ctx.fillStyle = 'rgba(255,34,0,0.3)';
                ctx.fillRect(Math.floor(plane2.x) - 1, Math.floor(plane2.y) - 2, 3, 1);
            }

            // White strobe (faster blink)
            if (Math.sin(beaconPhase * 8) > 0.7) {
                ctx.fillStyle = '#fff';
                ctx.fillRect(Math.floor(plane1.x) + 1, Math.floor(plane1.y), 1, 1);
                ctx.fillRect(Math.floor(plane2.x) - 1, Math.floor(plane2.y), 1, 1);
            }

            requestAnimationFrame(animate);
        }
        animate();
    }

    // ====== PIGEON flying between buildings in section 2 ======
    function initPigeon() {
        const PIXEL = 4;
        const parent = document.querySelector('.section-about .about-bg');
        if (!parent) return;

        const canvas = document.createElement('canvas');
        canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9;';
        const section = parent.closest('.section') || parent;
        canvas.width = section.offsetWidth || parent.offsetWidth;
        canvas.height = section.offsetHeight || parent.offsetHeight;
        parent.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        const W = canvas.width / PIXEL;
        const H = canvas.height / PIXEL;
        ctx.setTransform(PIXEL, 0, 0, PIXEL, 0, 0);
        ctx.imageSmoothingEnabled = false;

        // Scan background canvas to find real rooftop positions
        const perches = [];
        try {
            const bgCanvas = parent.querySelector('canvas');
            if (bgCanvas) {
                const bgCtx = bgCanvas.getContext('2d');
                for (let sx = 30; sx < canvas.width - 30; sx += 20 * PIXEL) {
                    const col = bgCtx.getImageData(sx, 0, 1, canvas.height);
                    let roofPixelY = -1;
                    for (let py = Math.floor(canvas.height * 0.15); py < canvas.height * 0.8; py++) {
                        const idx = py * 4;
                        const r = col.data[idx];
                        const g = col.data[idx + 1];
                        const b = col.data[idx + 2];
                        if (r > 60 && r > b && g < 80) {
                            roofPixelY = py;
                            break;
                        }
                    }
                    if (roofPixelY > 0) {
                        perches.push({ x: sx / PIXEL, y: roofPixelY / PIXEL - 1 });
                    }
                }
            }
        } catch(e) {}
        // Fallback
        if (perches.length < 3) {
            const groundY = Math.floor(H * 0.82);
            for (let i = 0; i < 8; i++) {
                perches.push({ x: Math.floor(W * (0.08 + i * 0.12)), y: groundY - 65 - (i % 3) * 12 });
            }
        }

        // Pigeon state — offset start for variety
        let currentPerch = Math.floor(Math.random() * perches.length)
        let targetPerch = currentPerch;
        let pigeonX = perches[currentPerch].x;
        let pigeonY = perches[currentPerch].y;
        let isFlying = false;
        let flyProgress = 0;
        let startX, startY, endX, endY;
        let waitUntil = Date.now() * 0.001 + 2;
        let facingRight = true;

        // Backflip state
        let jumpVel = 0;
        let jumpOffY = 0;
        let isJumping = false;
        let flipAngle = 0;
        let pigeonHover = false;

        // Register position for hover cursor
        registerAnimal('.section-about', () => ({ x: pigeonX, y: pigeonY + jumpOffY }));

        // Mouse tracking for glow
        section.addEventListener('mousemove', function(e) {
            const rect = section.getBoundingClientRect();
            const mx = (e.clientX - rect.left) / PIXEL;
            const my = (e.clientY - rect.top) / PIXEL;
            pigeonHover = Math.sqrt((mx - pigeonX) ** 2 + (my - (pigeonY + jumpOffY)) ** 2) < 12;
        });
        section.addEventListener('mouseleave', () => { pigeonHover = false; });

        // Click to backflip
        section.addEventListener('click', function(e) {
            const rect = section.getBoundingClientRect();
            const mx = (e.clientX - rect.left) / PIXEL;
            const my = (e.clientY - rect.top) / PIXEL;
            const curY = pigeonY + jumpOffY;
            const dist = Math.sqrt((mx - pigeonX) ** 2 + (my - curY) ** 2);
            if (dist < 20 && !isJumping) {
                isJumping = true;
                jumpVel = -2.5;
                jumpOffY = 0;
                flipAngle = 0;
            }
        });

        function pickNewTarget() {
            let newPerch;
            do {
                newPerch = Math.floor(Math.random() * perches.length);
            } while (newPerch === currentPerch && perches.length > 1);
            targetPerch = newPerch;
            startX = pigeonX;
            startY = pigeonY;
            endX = perches[targetPerch].x;
            endY = perches[targetPerch].y;
            facingRight = endX > startX;
            isFlying = true;
            flyProgress = 0;
        }

        function drawPigeonSprite(px, py, wingPhase, right) {
            const x = Math.floor(px);
            const y = Math.floor(py);
            const d = right ? 1 : -1;

            // Body
            ctx.fillStyle = '#667';
            ctx.fillRect(x - 2, y, 5, 3);
            ctx.fillStyle = '#778';
            ctx.fillRect(x - 1, y, 3, 2);
            // Belly (lighter)
            ctx.fillStyle = '#889';
            ctx.fillRect(x - 1, y + 2, 3, 1);

            // Head
            ctx.fillStyle = '#778';
            ctx.fillRect(x + 2 * d, y - 1, 2, 2);
            ctx.fillStyle = '#889';
            ctx.fillRect(x + 2 * d, y - 1, 2, 1);
            // Eye
            ctx.fillStyle = '#ff6600';
            ctx.fillRect(x + 3 * d, y - 1, 1, 1);
            // Beak
            ctx.fillStyle = '#aa8855';
            ctx.fillRect(x + 4 * d, y, 1, 1);

            // Neck iridescence (green/purple shimmer)
            ctx.fillStyle = '#4a6650';
            ctx.fillRect(x + 1 * d, y, 1, 2);
            ctx.fillStyle = '#5a5068';
            ctx.fillRect(x + 2 * d, y, 1, 1);

            // Tail
            ctx.fillStyle = '#556';
            ctx.fillRect(x - 3 * d, y + 1, 2, 1);
            ctx.fillRect(x - 4 * d, y + 2, 2, 1);

            // Wings
            if (isFlying) {
                const wingY = Math.round(Math.sin(wingPhase * Math.PI * 2) * 3);
                // Left wing
                ctx.fillStyle = '#556';
                ctx.fillRect(x - 1, y - 1 + wingY, 1, 1);
                ctx.fillRect(x, y - 2 + wingY, 1, 1);
                ctx.fillRect(x + 1, y - 2 + wingY, 1, 1);
                ctx.fillStyle = '#667';
                ctx.fillRect(x - 1, y + wingY, 1, 1);
                ctx.fillRect(x, y - 1 + wingY, 1, 1);
                // Wing tips (darker)
                ctx.fillStyle = '#445';
                ctx.fillRect(x, y - 3 + wingY, 1, 1);
                ctx.fillRect(x + 1, y - 3 + wingY, 1, 1);
                // Feather detail
                ctx.fillStyle = '#99a';
                ctx.fillRect(x, y - 2 + wingY, 1, 1);
            } else {
                // Folded wings
                ctx.fillStyle = '#556';
                ctx.fillRect(x - 2, y + 1, 4, 1);
                ctx.fillStyle = '#667';
                ctx.fillRect(x - 1, y, 2, 1);
                // Wing bar
                ctx.fillStyle = '#334';
                ctx.fillRect(x - 2, y + 1, 1, 1);
                ctx.fillRect(x + 1, y + 1, 1, 1);
            }

            // Feet (only when perched)
            if (!isFlying) {
                ctx.fillStyle = '#cc5544';
                ctx.fillRect(x - 1, y + 3, 1, 1);
                ctx.fillRect(x + 1, y + 3, 1, 1);
                ctx.fillRect(x - 2, y + 4, 2, 1);
                ctx.fillRect(x, y + 4, 2, 1);
            }
        }

        function animate() {
            ctx.clearRect(0, 0, W, H);
            const t = Date.now() * 0.001;

            // Backflip physics
            if (isJumping) {
                jumpOffY += jumpVel;
                jumpVel += 0.08; // gravity
                flipAngle += 0.25;
                if (jumpOffY >= 0) {
                    jumpOffY = 0;
                    isJumping = false;
                    jumpVel = 0;
                    flipAngle = 0;
                }
            }

            if (!isFlying) {
                if (t > waitUntil && !isJumping) {
                    pickNewTarget();
                }
                const bobX = Math.sin(t * 2) * 0.3;
                const wingPhaseJump = isJumping ? (t * 6) % 1 : 0;
                const drawX = pigeonX + bobX;
                const drawY = pigeonY + jumpOffY;

                if (isJumping) {
                    ctx.save();
                    ctx.translate(drawX, drawY);
                    ctx.rotate(facingRight ? -flipAngle : flipAngle);
                    ctx.translate(-drawX, -drawY);
                    drawPigeonSprite(drawX, drawY, wingPhaseJump, facingRight);
                    ctx.restore();
                } else {
                    drawPigeonSprite(drawX, drawY, wingPhaseJump, facingRight);
                }
            } else {
                // Flying — arc between buildings
                flyProgress += 0.002;
                if (flyProgress >= 1) {
                    flyProgress = 1;
                    isFlying = false;
                    currentPerch = targetPerch;
                    pigeonX = endX;
                    pigeonY = endY;
                    waitUntil = t + 2 + Math.random() * 5;
                } else {
                    const ft = flyProgress;
                    const eased = ft < 0.5 ? 2 * ft * ft : 1 - Math.pow(-2 * ft + 2, 2) / 2;
                    pigeonX = startX + (endX - startX) * eased;
                    const arcHeight = Math.min(Math.abs(endX - startX) * 0.1, 10);
                    const arc = Math.sin(ft * Math.PI) * arcHeight;
                    pigeonY = startY + (endY - startY) * eased - arc;
                }

                const wingPhase = (t * 3) % 1;
                const flyDrawY = pigeonY + jumpOffY;
                if (isJumping) {
                    ctx.save();
                    ctx.translate(pigeonX, flyDrawY);
                    ctx.rotate(facingRight ? -flipAngle : flipAngle);
                    ctx.translate(-pigeonX, -flyDrawY);
                    drawPigeonSprite(pigeonX, flyDrawY, wingPhase, facingRight);
                    ctx.restore();
                } else {
                    drawPigeonSprite(pigeonX, flyDrawY, wingPhase, facingRight);
                }
            }

            // Hover glow
            if (pigeonHover) {
                const glowR = 8;
                const drawY = isFlying ? pigeonY : pigeonY + jumpOffY;
                for (let dy = -glowR; dy <= glowR; dy++) {
                    for (let dx = -glowR; dx <= glowR; dx++) {
                        const d = Math.sqrt(dx * dx + dy * dy);
                        if (d < glowR) {
                            ctx.fillStyle = `rgba(255,255,200,${0.2 * (1 - d / glowR)})`;
                            ctx.fillRect(Math.floor(pigeonX + dx), Math.floor(drawY + dy), 1, 1);
                        }
                    }
                }
            }

            requestAnimationFrame(animate);
        }
        animate();
    }

    // ====== RAT on road in section 2 ======
    function initRat() {
        const PIXEL = 4;
        const parent = document.querySelector('.section-about .about-bg');
        if (!parent) return;

        const canvas = document.createElement('canvas');
        canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:7;';
        const section = parent.closest('.section') || parent;
        canvas.width = section.offsetWidth || parent.offsetWidth;
        canvas.height = section.offsetHeight || parent.offsetHeight;
        parent.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        const W = canvas.width / PIXEL;
        const H = canvas.height / PIXEL;
        ctx.setTransform(PIXEL, 0, 0, PIXEL, 0, 0);
        ctx.imageSmoothingEnabled = false;

        const roadY = Math.floor(H * 0.855);

        // Rat state
        let ratX = Math.floor(W * (0.2 + Math.random() * 0.6));
        let ratScale = 1;
        let ratDir = 1; // 1 = right, -1 = left
        let ratSpeed = 0.3;
        let state = 'run'; // run, goDeep, comeBack, wait
        let stateTimer = 0;
        let waitUntil = 0;
        let deepProgress = 0;

        // Backflip state
        let jumpVel = 0;
        let jumpOffY = 0;
        let isJumping = false;
        let flipAngle = 0;
        let ratHover = false;

        // Register position for hover cursor
        registerAnimal('.section-about', () => {
            const ratY = roadY - 2 - Math.floor((1 - ratScale) * 8);
            return { x: ratX, y: ratY + jumpOffY };
        });

        // Mouse tracking for glow
        section.addEventListener('mousemove', function(e) {
            const rect = section.getBoundingClientRect();
            const mx = (e.clientX - rect.left) / PIXEL;
            const my = (e.clientY - rect.top) / PIXEL;
            const ratY = roadY - 2 - Math.floor((1 - ratScale) * 8);
            ratHover = Math.sqrt((mx - ratX) ** 2 + (my - (ratY + jumpOffY)) ** 2) < 12;
        });
        section.addEventListener('mouseleave', () => { ratHover = false; });

        // Click to jump
        section.addEventListener('click', function(e) {
            const rect = section.getBoundingClientRect();
            const mx = (e.clientX - rect.left) / PIXEL;
            const my = (e.clientY - rect.top) / PIXEL;
            const ratY = roadY - 2 - Math.floor((1 - ratScale) * 8);
            const dist = Math.sqrt((mx - ratX) ** 2 + (my - ratY) ** 2);
            if (dist < 15 && !isJumping) {
                isJumping = true;
                jumpVel = -2.2;
                jumpOffY = 0;
                flipAngle = 0;
            }
        });

        function drawRatSprite(px, py, s, right, frame) {
            const x = Math.floor(px);
            const y = Math.floor(py);
            const sz = Math.max(0.3, s);

            // Scale helper — flip horizontally for left-facing
            const r = (rx, ry, rw, rh, c) => {
                ctx.fillStyle = c;
                const sx = right ? Math.floor(rx * sz) : Math.floor(-rx * sz - rw * sz);
                ctx.fillRect(
                    x + sx,
                    y + Math.floor(ry * sz),
                    Math.max(1, Math.floor(rw * sz)),
                    Math.max(1, Math.floor(rh * sz))
                );
            };

            // Body
            r(-2, 0, 5, 2, '#555');
            r(-1, -1, 3, 1, '#666');
            // Dark belly
            r(-1, 1, 3, 1, '#444');
            // Nose
            r(3, 0, 1, 1, '#777');
            // Eye — red
            r(2, -1, 1, 1, '#ff0000');
            // Ears
            r(1, -2, 1, 1, '#665');
            r(2, -2, 1, 1, '#776');
            // Tail — wavy
            const tailWave = Math.sin(frame * 5) * 0.5;
            r(-3, 1 + tailWave, 1, 1, '#888');
            r(-4, 1 + tailWave * 0.5, 1, 1, '#777');
            r(-5, 1, 1, 1, '#666');
            // Legs (animated)
            const legOff = Math.floor(Math.sin(frame * 8) * 1);
            r(-1, 2, 1, 1, '#555');
            r(1, 2 + legOff, 1, 1, '#555');
            // Whiskers
            if (sz > 0.6) {
                r(3, -1, 1, 1, '#888');
                r(4, 0, 1, 1, '#888');
            }
        }

        function animate() {
            ctx.clearRect(0, 0, W, H);
            const t = Date.now() * 0.001;

            if (state === 'run') {
                // Run along road
                ratX += ratSpeed * ratDir;
                ratScale = 1;

                // Random chance to go deep
                if (Math.random() > 0.998) {
                    state = 'goDeep';
                    deepProgress = 0;
                }
                // Turn at edges
                if (ratX > W - 5) ratDir = -1;
                if (ratX < 5) ratDir = 1;
                // Random direction change
                if (Math.random() > 0.995) ratDir *= -1;

            } else if (state === 'goDeep') {
                // Shrink and move up (going into distance)
                deepProgress += 0.008;
                ratScale = 1 - deepProgress * 0.7;
                ratX += ratSpeed * ratDir * 0.3;
                if (deepProgress >= 1) {
                    state = 'wait';
                    waitUntil = t + 1 + Math.random() * 3;
                    // Reappear at random position
                    ratX = Math.floor(10 + Math.random() * (W - 20));
                    ratDir = Math.random() > 0.5 ? 1 : -1;
                }

            } else if (state === 'wait') {
                ratScale = 0.3;
                if (t > waitUntil) {
                    state = 'comeBack';
                    deepProgress = 1;
                }

            } else if (state === 'comeBack') {
                // Grow back (coming from distance)
                deepProgress -= 0.008;
                ratScale = 1 - deepProgress * 0.7;
                ratX += ratSpeed * ratDir * 0.3;
                if (deepProgress <= 0) {
                    state = 'run';
                    ratScale = 1;
                }
            }

            // Backflip physics
            if (isJumping) {
                jumpOffY += jumpVel;
                jumpVel += 0.07; // gravity
                flipAngle += 0.22;
                if (jumpOffY >= 0) {
                    jumpOffY = 0;
                    isJumping = false;
                    jumpVel = 0;
                    flipAngle = 0;
                }
            }

            const ratY = roadY - 2 - Math.floor((1 - ratScale) * 8);
            const ratDrawY = ratY + jumpOffY;

            if (isJumping) {
                ctx.save();
                ctx.translate(ratX, ratDrawY);
                ctx.rotate(ratDir > 0 ? -flipAngle : flipAngle);
                ctx.translate(-ratX, -ratDrawY);
                drawRatSprite(ratX, ratDrawY, ratScale, ratDir > 0, t);
                ctx.restore();
            } else {
                drawRatSprite(ratX, ratDrawY, ratScale, ratDir > 0, t);
            }

            // Shadow (shrinks when jumping)
            const shadowW = Math.floor(3 * ratScale);
            const shadowAlpha = isJumping ? 0.05 : 0.1;
            ctx.fillStyle = `rgba(0,0,0,${shadowAlpha})`;
            ctx.fillRect(Math.floor(ratX) - 1, roadY - 1, shadowW, 1);

            // Hover glow
            if (ratHover) {
                const glowR = 7;
                for (let dy = -glowR; dy <= glowR; dy++) {
                    for (let dx = -glowR; dx <= glowR; dx++) {
                        const d = Math.sqrt(dx * dx + dy * dy);
                        if (d < glowR) {
                            ctx.fillStyle = `rgba(255,255,200,${0.2 * (1 - d / glowR)})`;
                            ctx.fillRect(Math.floor(ratX + dx), Math.floor(ratY + jumpOffY + dy), 1, 1);
                        }
                    }
                }
            }

            requestAnimationFrame(animate);
        }
        animate();
    }

    // ====== FERRY moving slowly in section 3 ======
    function initFerry() {
        const PIXEL = 4;
        const parent = document.querySelector('.section-live .live-bg');
        if (!parent) return;

        const canvas = document.createElement('canvas');
        canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:2;';
        const section = parent.closest('.section') || parent;
        canvas.width = section.offsetWidth || parent.offsetWidth;
        canvas.height = section.offsetHeight || parent.offsetHeight;
        parent.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        const W = canvas.width / PIXEL;
        const H = canvas.height / PIXEL;
        ctx.setTransform(PIXEL, 0, 0, PIXEL, 0, 0);
        ctx.imageSmoothingEnabled = false;

        const waterY = Math.floor(H * 0.6);
        // Ferry zone — right side of bridge, open water
        const zoneLeft = Math.floor(W * 0.72);
        const zoneRight = W - 5;
        const zoneTop = waterY + 4;
        const zoneBottom = Math.floor(H * 0.88);

        let ferryX = Math.floor(zoneLeft + 5);
        let ferryY = zoneTop + Math.floor((zoneBottom - zoneTop) * 0.3);
        let ferryDir = 1; // 1 = right, -1 = left
        const ferrySpeed = 0.03;

        const ripples = [];
        const smokeRings = [];
        let ferryHover = false;

        // Hover & click detection
        section.addEventListener('mousemove', function(e) {
            const rect = section.getBoundingClientRect();
            const mx = (e.clientX - rect.left) / PIXEL;
            const my = (e.clientY - rect.top) / PIXEL;
            const bob = Math.sin(Date.now() * 0.001 * 0.8) * 0.5;
            const ffx = Math.floor(ferryX);
            const ffy = Math.floor(ferryY + bob);
            ferryHover = mx > ffx - 3 && mx < ffx + 24 && my > ffy - 10 && my < ffy + 8;
            if (ferryHover) section.style.cursor = 'pointer';
            else if (section.style.cursor === 'pointer') section.style.cursor = '';
        });
        section.addEventListener('mouseleave', () => { ferryHover = false; });

        section.addEventListener('click', function(e) {
            const rect = section.getBoundingClientRect();
            const mx = (e.clientX - rect.left) / PIXEL;
            const my = (e.clientY - rect.top) / PIXEL;
            const bob = Math.sin(Date.now() * 0.001 * 0.8) * 0.5;
            const ffx = Math.floor(ferryX);
            const ffy = Math.floor(ferryY + bob);
            if (mx > ffx - 3 && mx < ffx + 24 && my > ffy - 10 && my < ffy + 8) {
                // Spawn smoke rings from both smokestacks
                for (let s = 0; s < 2; s++) {
                    const stackX = ffx + (s === 0 ? 8 : 14);
                    const stackY = ffy - 10;
                    for (let r = 0; r < 3; r++) {
                        smokeRings.push({
                            x: stackX,
                            y: stackY - r * 2,
                            radius: 1,
                            maxRadius: 5 + Math.random() * 3,
                            alpha: 0.6,
                            vy: -0.15 - Math.random() * 0.1,
                            vx: (Math.random() - 0.5) * 0.1,
                            delay: r * 8
                        });
                    }
                }
            }
        });

        const isMobile = window.innerWidth <= 768;

        function animate() {
            ctx.clearRect(0, 0, W, H);
            const t = Date.now() * 0.001;

            if (!isMobile) {
                // Move right then left (desktop only)
                ferryX += ferrySpeed * ferryDir;
                if (ferryX > zoneRight - 24) { ferryDir = -1; }
                if (ferryX < zoneLeft) { ferryDir = 1; }
            }

            const fx = Math.floor(ferryX);
            const bob = isMobile ? 0 : Math.sin(t * 0.8) * 0.5;
            const fy = Math.floor(ferryY + bob);

            {
            // Draw ferry — detailed Staten Island Ferry
            // Black outline under hull
            ctx.fillStyle = '#000';
            ctx.fillRect(fx - 1, fy + 1, 24, 8);
            // Hull — orange with gradient
            ctx.fillStyle = '#dd6600';
            ctx.fillRect(fx, fy + 2, 22, 5);
            ctx.fillStyle = '#ee7711'; // hull highlight top
            ctx.fillRect(fx + 1, fy + 2, 20, 1);
            ctx.fillStyle = '#cc5500'; // hull mid
            ctx.fillRect(fx + 1, fy + 3, 20, 2);
            ctx.fillStyle = '#bb4400'; // hull dark bottom
            ctx.fillRect(fx + 1, fy + 5, 20, 1);
            ctx.fillStyle = '#993300'; // waterline
            ctx.fillRect(fx + 2, fy + 6, 18, 1);
            // Bow shape
            ctx.fillStyle = '#cc5500';
            ctx.fillRect(fx - 1, fy + 3, 1, 3);
            ctx.fillStyle = '#dd6600';
            ctx.fillRect(fx - 2, fy + 4, 1, 1);

            // Main deck — white with outline
            ctx.fillStyle = '#000';
            ctx.fillRect(fx + 1, fy - 3, 20, 6);
            ctx.fillStyle = '#eee8dd';
            ctx.fillRect(fx + 2, fy - 2, 18, 4);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(fx + 3, fy - 1, 16, 2);
            // Deck shadow
            ctx.fillStyle = '#ccc8bb';
            ctx.fillRect(fx + 2, fy + 1, 18, 1);

            // Pilot house
            ctx.fillStyle = '#000';
            ctx.fillRect(fx + 7, fy - 6, 8, 4);
            ctx.fillStyle = '#ddd8cc';
            ctx.fillRect(fx + 8, fy - 5, 6, 3);
            ctx.fillStyle = '#eee';
            ctx.fillRect(fx + 8, fy - 5, 6, 1);
            // Pilot windows
            ctx.fillStyle = '#66aadd';
            ctx.fillRect(fx + 9, fy - 4, 2, 1);
            ctx.fillRect(fx + 12, fy - 4, 2, 1);

            // Windows on main deck — warm glow
            for (let wx = fx + 4; wx < fx + 18; wx += 2) {
                ctx.fillStyle = '#88ccff';
                ctx.fillRect(wx, fy - 1, 1, 1);
                ctx.fillStyle = '#ffcc66'; // warm interior
                ctx.fillRect(wx, fy, 1, 1);
            }

            // Smokestacks with bands
            ctx.fillStyle = '#000';
            ctx.fillRect(fx + 6, fy - 9, 4, 4);
            ctx.fillRect(fx + 12, fy - 9, 4, 4);
            ctx.fillStyle = '#dd6600';
            ctx.fillRect(fx + 7, fy - 8, 2, 3);
            ctx.fillRect(fx + 13, fy - 8, 2, 3);
            // Black band on stacks
            ctx.fillStyle = '#222';
            ctx.fillRect(fx + 7, fy - 7, 2, 1);
            ctx.fillRect(fx + 13, fy - 7, 2, 1);
            // Smoke puffs
            const smokeOff = Math.sin(t * 2) * 1;
            ctx.fillStyle = 'rgba(100,100,100,0.3)';
            ctx.fillRect(fx + 7, fy - 10 + Math.floor(smokeOff), 2, 1);
            ctx.fillRect(fx + 13, fy - 11 + Math.floor(smokeOff * 0.7), 2, 1);
            ctx.fillStyle = 'rgba(80,80,80,0.15)';
            ctx.fillRect(fx + 6, fy - 11 + Math.floor(smokeOff), 3, 1);
            ctx.fillRect(fx + 12, fy - 12 + Math.floor(smokeOff * 0.7), 3, 1);

            // Railing posts
            for (let rx = fx + 2; rx < fx + 20; rx += 2) {
                ctx.fillStyle = '#999';
                ctx.fillRect(rx, fy - 3, 1, 1);
            }
            // Railing bar
            ctx.fillStyle = '#888';
            ctx.fillRect(fx + 2, fy - 3, 18, 1);

            // Life preservers
            ctx.fillStyle = '#ff4422';
            ctx.fillRect(fx + 5, fy + 3, 1, 1);
            ctx.fillRect(fx + 16, fy + 3, 1, 1);
            // Flag at stern
            ctx.fillStyle = '#888';
            ctx.fillRect(fx + 21, fy - 1, 1, 3);
            ctx.fillStyle = '#0033aa';
            ctx.fillRect(fx + 22, fy - 1, 2, 1);
            ctx.fillStyle = '#cc0000';
            ctx.fillRect(fx + 22, fy, 2, 1);

            } // end if !underBridge

            // Wake behind ferry
            for (let wi = 0; wi < 15; wi++) {
                const wx = fx + 22 + wi * 2;
                const alpha = 0.2 - wi * 0.012;
                if (alpha > 0) {
                    ctx.fillStyle = `rgba(150,180,220,${alpha})`;
                    ctx.fillRect(wx, fy + 4 + Math.floor(Math.sin(wi * 0.6 + t * 2) * 1), 2, 1);
                }
            }

            // Spawn ripples near ferry
            if (Math.random() > 0.85) {
                ripples.push({
                    x: fx + Math.floor(Math.random() * 22),
                    y: fy + 5 + Math.floor(Math.random() * 4),
                    radius: 0,
                    maxRadius: 3 + Math.random() * 3,
                    born: t
                });
            }
            // Bow wave ripples
            if (Math.random() > 0.7) {
                ripples.push({
                    x: fx - 1,
                    y: fy + 3 + Math.floor(Math.random() * 3),
                    radius: 0,
                    maxRadius: 2 + Math.random() * 2,
                    born: t
                });
            }

            // Draw and update ripples
            for (let i = ripples.length - 1; i >= 0; i--) {
                const r = ripples[i];
                const age = t - r.born;
                r.radius = age * 4;
                if (r.radius > r.maxRadius) {
                    ripples.splice(i, 1);
                    continue;
                }
                const alpha = 0.15 * (1 - r.radius / r.maxRadius);
                const rad = Math.floor(r.radius);
                // Draw circle outline
                ctx.fillStyle = `rgba(120,160,200,${alpha})`;
                ctx.fillRect(r.x - rad, r.y, rad * 2 + 1, 1);
                ctx.fillRect(r.x, r.y - rad, 1, rad * 2 + 1);
                if (rad > 1) {
                    ctx.fillRect(r.x - rad + 1, r.y - 1, 1, 1);
                    ctx.fillRect(r.x + rad - 1, r.y - 1, 1, 1);
                    ctx.fillRect(r.x - rad + 1, r.y + 1, 1, 1);
                    ctx.fillRect(r.x + rad - 1, r.y + 1, 1, 1);
                }
            }

            // Ferry reflection
            for (let ry = 0; ry < 5; ry++) {
                const alpha = 0.08 - ry * 0.015;
                if (alpha > 0) {
                    ctx.fillStyle = `rgba(200,100,0,${alpha})`;
                    ctx.fillRect(fx + 2, fy + 8 + ry, 18, 1);
                }
            }

            // Hover glow
            if (ferryHover) {
                const pulse = 0.7 + 0.3 * Math.sin(t * 3);
                for (let dy = -12; dy <= 10; dy++) {
                    for (let dx = -4; dx <= 26; dx++) {
                        const edgeX = Math.min(dx + 4, 26 - dx) / 5;
                        const edgeY = Math.min(dy + 12, 10 - dy) / 5;
                        const edge = Math.min(1, edgeX) * Math.min(1, edgeY);
                        const a = 0.12 * pulse * edge;
                        if (a > 0.01) {
                            ctx.fillStyle = `rgba(255,200,100,${a})`;
                            ctx.fillRect(fx + dx, fy + dy, 1, 1);
                        }
                    }
                }
            }

            // Smoke rings
            for (let i = smokeRings.length - 1; i >= 0; i--) {
                const sr = smokeRings[i];
                if (sr.delay > 0) { sr.delay--; continue; }
                sr.y += sr.vy;
                sr.x += sr.vx;
                sr.radius += 0.04;
                sr.alpha -= 0.005;
                if (sr.alpha <= 0 || sr.radius > sr.maxRadius) {
                    smokeRings.splice(i, 1);
                    continue;
                }
                // Draw donut/ring shape
                const rad = Math.floor(sr.radius);
                const innerRad = Math.max(0, rad - 1);
                for (let dy2 = -rad - 1; dy2 <= rad + 1; dy2++) {
                    for (let dx2 = -rad - 1; dx2 <= rad + 1; dx2++) {
                        const d = Math.sqrt(dx2 * dx2 + dy2 * dy2);
                        if (d >= innerRad && d <= rad + 1) {
                            const ringFade = 1 - Math.abs(d - rad) / 1.5;
                            if (ringFade > 0) {
                                ctx.fillStyle = `rgba(180,180,180,${sr.alpha * ringFade * 0.6})`;
                                ctx.fillRect(Math.floor(sr.x + dx2), Math.floor(sr.y + dy2), 1, 1);
                            }
                        }
                    }
                }
                // Bright edge on top of ring
                ctx.fillStyle = `rgba(220,220,220,${sr.alpha * 0.3})`;
                ctx.fillRect(Math.floor(sr.x - rad), Math.floor(sr.y), 1, 1);
                ctx.fillRect(Math.floor(sr.x + rad), Math.floor(sr.y), 1, 1);
                ctx.fillRect(Math.floor(sr.x), Math.floor(sr.y - rad), 1, 1);
            }

            requestAnimationFrame(animate);
        }
        animate();
    }

    // ====== HELICOPTER with spotlight in section 3 ======
    function initHelicopter() {
        const PIXEL = 4;
        const section = document.querySelector('.section-live');
        const parent = section ? section.querySelector('.live-bg') : null;
        if (!parent) return;

        const canvas = document.createElement('canvas');
        canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:15;';
        canvas.width = section.offsetWidth;
        canvas.height = section.offsetHeight;
        parent.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        const W = canvas.width / PIXEL;
        const H = canvas.height / PIXEL;
        ctx.setTransform(PIXEL, 0, 0, PIXEL, 0, 0);
        ctx.imageSmoothingEnabled = false;

        // Helicopter position — centered above gallery, under title
        const heliX = Math.floor(W * 0.5);
        const heliY = Math.floor(H * 0.18);

        // Slight hover bobbing
        let hoveredItem = -1;

        // Track which gallery item is hovered
        const galleryItems = document.querySelectorAll('.section-live .gallery-item');
        galleryItems.forEach((item, idx) => {
            item.addEventListener('mouseenter', () => { hoveredItem = idx; });
            item.addEventListener('mouseleave', () => { hoveredItem = -1; });
        });

        function drawPixel(x, y, color) {
            ctx.fillStyle = color;
            ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
        }
        function drawRect(x, y, w, h, color) {
            ctx.fillStyle = color;
            ctx.fillRect(Math.floor(x), Math.floor(y), w, h);
        }

        function drawHelicopter(cx, cy, t) {
            // === TAIL BOOM ===
            // Long tail extending left
            drawRect(cx - 22, cy - 1, 16, 3, '#2a2a2a'); // tail boom
            drawRect(cx - 22, cy - 1, 16, 1, '#3a3a3a'); // highlight top
            // Tail stripes (Punch Club style detail)
            drawRect(cx - 20, cy, 2, 2, '#cc2200');
            drawRect(cx - 16, cy, 2, 2, '#cc2200');

            // === TAIL ROTOR (vertical, spinning) ===
            const tailPhase = t * 12;
            for (let i = 0; i < 3; i++) {
                const angle = tailPhase + i * (Math.PI * 2 / 3);
                const dy = Math.sin(angle) * 4;
                drawPixel(cx - 23, cy - 1 + Math.floor(dy), '#888');
                drawPixel(cx - 23, cy - 1 + Math.floor(dy * 0.6), '#777');
            }
            // Tail rotor hub
            drawPixel(cx - 23, cy - 1, '#555');

            // === TAIL FIN ===
            drawRect(cx - 22, cy - 4, 3, 3, '#333');
            drawPixel(cx - 22, cy - 5, '#444');

            // === MAIN BODY (fuselage) — Punch Club chunky style ===
            // Body bottom (belly)
            drawRect(cx - 6, cy + 2, 16, 3, '#1a1a1a');
            // Main body
            drawRect(cx - 7, cy - 2, 18, 5, '#2a2a2a');
            drawRect(cx - 6, cy - 3, 16, 1, '#333');
            // Body top curve
            drawRect(cx - 5, cy - 4, 14, 1, '#383838');
            drawRect(cx - 3, cy - 5, 10, 1, '#404040');

            // === COCKPIT WINDOW (curved, blue tint) ===
            drawRect(cx + 6, cy - 3, 5, 4, '#1a3a5a');
            drawRect(cx + 7, cy - 4, 3, 1, '#2a4a6a');
            // Window glare
            drawPixel(cx + 7, cy - 3, '#3a6a9a');
            drawPixel(cx + 8, cy - 3, '#2a5a8a');

            // === DOOR / PANEL DETAIL ===
            drawRect(cx - 2, cy - 2, 1, 4, '#444'); // door line
            drawRect(cx + 3, cy - 2, 1, 4, '#444'); // door line
            // Door handle
            drawPixel(cx - 1, cy, '#666');
            drawPixel(cx + 4, cy, '#666');

            // === PAINT STRIPES (punk style — red accent) ===
            drawRect(cx - 6, cy + 1, 17, 1, '#8b0000');

            // === ENGINE EXHAUST TOP ===
            drawRect(cx - 1, cy - 6, 6, 1, '#555');
            drawRect(cx, cy - 7, 4, 1, '#4a4a4a');

            // === SKIDS (landing gear) ===
            // Left skid strut
            drawRect(cx - 3, cy + 5, 1, 3, '#555');
            drawRect(cx + 5, cy + 5, 1, 3, '#555');
            // Right skid strut
            drawRect(cx - 1, cy + 5, 1, 3, '#555');
            drawRect(cx + 7, cy + 5, 1, 3, '#555');
            // Skid bars (horizontal)
            drawRect(cx - 5, cy + 8, 10, 1, '#666');
            drawRect(cx + 2, cy + 8, 10, 1, '#666');
            // Skid highlights
            drawRect(cx - 5, cy + 8, 10, 1, '#777');
            drawRect(cx + 2, cy + 8, 10, 1, '#777');

            // === MAIN ROTOR (spinning on top) ===
            const rotorHub = { x: cx + 2, y: cy - 7 };
            // Rotor mast
            drawRect(rotorHub.x, cy - 7, 1, 2, '#666');
            drawPixel(rotorHub.x, rotorHub.y - 1, '#888');

            // Spinning blades — 2 blades, drawn as a blur effect
            const bladePhase = t * 8;
            const bladeLen = 22;

            for (let b = 0; b < 2; b++) {
                const angle = bladePhase + b * Math.PI;
                const cosA = Math.cos(angle);
                // Draw blade as series of pixels
                for (let p = 1; p <= bladeLen; p++) {
                    const bx = rotorHub.x + Math.floor(cosA * p);
                    const by = rotorHub.y - 1;
                    const alpha = 0.7 - (p / bladeLen) * 0.4;
                    drawPixel(bx, by, `rgba(180,180,180,${alpha})`);
                    // Blade thickness
                    if (p < bladeLen - 3) {
                        drawPixel(bx, by - 1, `rgba(150,150,150,${alpha * 0.5})`);
                    }
                }
            }

            // Rotor blur circle (motion effect)
            const blurAlpha = 0.06 + Math.sin(t * 3) * 0.02;
            for (let angle2 = 0; angle2 < Math.PI * 2; angle2 += 0.15) {
                for (let r = bladeLen * 0.6; r <= bladeLen; r += 2) {
                    const bx = rotorHub.x + Math.floor(Math.cos(angle2) * r);
                    const by = rotorHub.y - 1 + Math.floor(Math.sin(angle2) * 0.5);
                    drawPixel(bx, by, `rgba(200,200,200,${blurAlpha})`);
                }
            }

            // === SEARCHLIGHT HOUSING (under belly) ===
            drawRect(cx + 2, cy + 5, 3, 2, '#888');
            drawPixel(cx + 3, cy + 7, '#aaa');

            // === NAVIGATION LIGHTS ===
            const blink = Math.sin(t * 4) > 0.3;
            if (blink) {
                drawPixel(cx - 7, cy - 1, '#ff0000'); // red port light
                drawPixel(cx + 11, cy - 1, '#00ff00'); // green starboard
            }
            // Anti-collision beacon on top
            const beacon = Math.sin(t * 6) > 0.7;
            if (beacon) {
                drawPixel(cx + 2, cy - 8, '#ff3333');
                drawPixel(cx + 1, cy - 8, 'rgba(255,50,50,0.4)');
                drawPixel(cx + 3, cy - 8, 'rgba(255,50,50,0.4)');
            }
        }

        function drawSpotlight(heliCx, heliCy, targetX, targetY, frameTop) {
            const startX = heliCx + 3;
            const startY = heliCy + 8;

            // Beam stops at the top edge of the frame
            const stopY = frameTop;
            // How far along the full path is the stop point
            const fullDist = targetY - startY;
            const stopDist = stopY - startY;
            const stopT = Math.max(0.1, Math.min(1, stopDist / fullDist));

            const steps = 80;

            // Layer 1: wide outer glow
            for (let i = 0; i < steps; i++) {
                const t2 = i / steps * stopT;
                const mx = startX + (targetX - startX) * t2;
                const my = startY + (targetY - startY) * t2;
                const width = Math.floor(2 + t2 * 22);
                const a = 0.15 * (1 - t2 * 0.3);
                for (let w = -width; w <= width; w++) {
                    const edgeFade = 1 - Math.abs(w) / (width + 1);
                    drawPixel(mx + w, my, `rgba(255,250,200,${a * edgeFade * edgeFade})`);
                }
            }

            // Layer 2: solid mid beam
            for (let i = 0; i < steps; i++) {
                const t2 = i / steps * stopT;
                const mx = startX + (targetX - startX) * t2;
                const my = startY + (targetY - startY) * t2;
                const width = Math.floor(1 + t2 * 12);
                const a = 0.3;
                for (let w = -width; w <= width; w++) {
                    const edgeFade = 1 - Math.abs(w) / (width + 1);
                    drawPixel(mx + w, my, `rgba(255,255,220,${a * edgeFade})`);
                }
            }

            // Layer 3: bright core
            for (let i = 0; i < steps; i++) {
                const t2 = i / steps * stopT;
                const mx = startX + (targetX - startX) * t2;
                const my = startY + (targetY - startY) * t2;
                const width = Math.floor(t2 * 6);
                const a = 0.4;
                for (let w = -width; w <= width; w++) {
                    const edgeFade = 1 - Math.abs(w) / (width + 1);
                    drawPixel(mx + w, my, `rgba(255,255,240,${a * edgeFade})`);
                }
            }

            // Layer 4: white-hot center line
            for (let i = 0; i < steps; i++) {
                const t2 = i / steps * stopT;
                const mx = startX + (targetX - startX) * t2;
                const my = startY + (targetY - startY) * t2;
                drawPixel(mx, my, 'rgba(255,255,255,0.25)');
                drawPixel(mx, my - 1, 'rgba(255,255,255,0.15)');
            }

            // Bright splash where beam hits the frame edge
            const splashX = startX + (targetX - startX) * stopT;
            const splashY = startY + (targetY - startY) * stopT;
            const splashW = Math.floor(stopT * 14);
            // Horizontal splash line
            for (let dx = -splashW; dx <= splashW; dx++) {
                const fade = 1 - Math.abs(dx) / (splashW + 1);
                drawPixel(splashX + dx, splashY, `rgba(255,255,220,${0.4 * fade})`);
                drawPixel(splashX + dx, splashY - 1, `rgba(255,255,200,${0.2 * fade})`);
                drawPixel(splashX + dx, splashY + 1, `rgba(255,255,200,${0.15 * fade})`);
            }

            // Searchlight source glow on helicopter
            const srcR = 5;
            for (let dy = -srcR; dy <= srcR; dy++) {
                for (let dx = -srcR; dx <= srcR; dx++) {
                    const d = Math.sqrt(dx * dx + dy * dy);
                    if (d < srcR) {
                        drawPixel(startX + dx, startY + dy, `rgba(255,255,220,${0.3 * (1 - d / srcR)})`);
                    }
                }
            }
        }

        function animate() {
            ctx.clearRect(0, 0, W, H);
            const t = Date.now() * 0.001;

            // Helicopter hover bobbing
            const bobX = Math.sin(t * 0.5) * 1.5;
            const bobY = Math.sin(t * 0.7) * 1;
            const hx = Math.floor(heliX + bobX);
            const hy = Math.floor(heliY + bobY);

            // Draw spotlight if hovering a gallery item
            if (hoveredItem >= 0 && hoveredItem < galleryItems.length) {
                const item = galleryItems[hoveredItem];
                const sectionRect = section.getBoundingClientRect();
                const itemRect = item.getBoundingClientRect();

                // Target = center of frame
                const targetPxX = (itemRect.left + itemRect.width / 2) - sectionRect.left;
                const targetPxY = (itemRect.top + itemRect.height / 2) - sectionRect.top;
                const targetX = targetPxX / PIXEL;
                const targetY = targetPxY / PIXEL;

                // Frame top edge — beam stops here
                const frameTopPx = (itemRect.top - sectionRect.top) / PIXEL;

                drawSpotlight(hx, hy, targetX, targetY, frameTopPx);
            }

            drawHelicopter(hx, hy, t);

            requestAnimationFrame(animate);
        }
        animate();
    }

    // (sun spotlight removed)

    // ====== STATUE FIREWORK (section 3) ======
    function initStatueFirework() {
        const PIXEL = 4;
        const section = document.querySelector('.section-live');
        const parent = section ? section.querySelector('.live-bg') : null;
        if (!parent) return;

        const canvas = document.createElement('canvas');
        canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:14;';
        canvas.width = section.offsetWidth;
        canvas.height = section.offsetHeight;
        parent.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        const W = canvas.width / PIXEL;
        const H = canvas.height / PIXEL;
        ctx.setTransform(PIXEL, 0, 0, PIXEL, 0, 0);
        ctx.imageSmoothingEnabled = false;

        const waterY = Math.floor(H * 0.6);
        const statueX = Math.floor(W * 0.12);
        const torchX = statueX + 3;
        const torchY = waterY + 4 - 38;

        // Firework state
        let rocket = null;       // rising phase
        let particles = [];      // explosion phase

        section.addEventListener('click', function(e) {
            const rect = section.getBoundingClientRect();
            const mx = (e.clientX - rect.left) / PIXEL;
            const my = (e.clientY - rect.top) / PIXEL;
            // Click near statue (generous zone)
            const dist = Math.sqrt((mx - statueX) ** 2 + (my - (waterY - 15)) ** 2);
            if (dist < 25 && !rocket) {
                rocket = {
                    x: torchX,
                    y: torchY,
                    vy: -1.8,
                    vx: 0.3,
                    trail: [],
                    life: 1
                };
                particles = [];
            }
        });

        function animate() {
            ctx.clearRect(0, 0, W, H);

            // Rocket rising
            if (rocket) {
                rocket.x += rocket.vx;
                rocket.y += rocket.vy;
                rocket.vy += 0.02; // slow down
                rocket.trail.push({ x: rocket.x, y: rocket.y, life: 1 });

                // Draw trail
                for (let i = rocket.trail.length - 1; i >= 0; i--) {
                    const tr = rocket.trail[i];
                    tr.life -= 0.04;
                    if (tr.life <= 0) { rocket.trail.splice(i, 1); continue; }
                    ctx.fillStyle = `rgba(255,200,100,${tr.life * 0.6})`;
                    ctx.fillRect(Math.floor(tr.x), Math.floor(tr.y), 1, 1);
                    ctx.fillStyle = `rgba(255,150,50,${tr.life * 0.3})`;
                    ctx.fillRect(Math.floor(tr.x) - 1, Math.floor(tr.y), 1, 1);
                    ctx.fillRect(Math.floor(tr.x) + 1, Math.floor(tr.y), 1, 1);
                }

                // Draw rocket head
                ctx.fillStyle = '#fff';
                ctx.fillRect(Math.floor(rocket.x), Math.floor(rocket.y), 1, 1);
                ctx.fillStyle = '#ffcc00';
                ctx.fillRect(Math.floor(rocket.x), Math.floor(rocket.y) + 1, 1, 1);

                // Explode when velocity turns downward
                if (rocket.vy > -0.3) {
                    const ex = rocket.x;
                    const ey = rocket.y;
                    // Pick random color scheme
                    const colors = [
                        ['#ff4444', '#ff8844', '#ffcc44'],
                        ['#44ff44', '#44ffaa', '#aaffaa'],
                        ['#4488ff', '#44ccff', '#aaddff'],
                        ['#ff44ff', '#ff88ff', '#ffaaff'],
                        ['#ffcc00', '#ffee44', '#ffffff']
                    ];
                    const palette = colors[Math.floor(Math.random() * colors.length)];
                    for (let i = 0; i < 50; i++) {
                        const angle = Math.random() * Math.PI * 2;
                        const speed = 0.5 + Math.random() * 1.5;
                        particles.push({
                            x: ex, y: ey,
                            vx: Math.cos(angle) * speed,
                            vy: Math.sin(angle) * speed,
                            color: palette[Math.floor(Math.random() * palette.length)],
                            life: 0.8 + Math.random() * 0.5,
                            size: Math.random() > 0.7 ? 2 : 1
                        });
                    }
                    rocket = null;
                }
            }

            // Explosion particles
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.03; // gravity
                p.vx *= 0.99;
                p.life -= 0.012;
                if (p.life <= 0) { particles.splice(i, 1); continue; }

                const a = Math.min(1, p.life);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = a;
                ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
                // Glow
                ctx.globalAlpha = a * 0.3;
                ctx.fillRect(Math.floor(p.x) - 1, Math.floor(p.y), 1, 1);
                ctx.fillRect(Math.floor(p.x) + 1, Math.floor(p.y), 1, 1);
                ctx.fillRect(Math.floor(p.x), Math.floor(p.y) - 1, 1, 1);
                ctx.fillRect(Math.floor(p.x), Math.floor(p.y) + 1, 1, 1);
            }
            ctx.globalAlpha = 1;

            requestAnimationFrame(animate);
        }
        animate();
    }

    // ====== HOVER HIGHLIGHTS for interactive objects ======
    function initHoverHighlights() {
        const PIXEL = 4;

        // --- STATUE highlight (section 3) ---
        const liveSection = document.querySelector('.section-live');
        if (liveSection) {
            const liveBg = liveSection.querySelector('.live-bg');
            const stCanvas = document.createElement('canvas');
            stCanvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:11;';
            stCanvas.width = liveSection.offsetWidth;
            stCanvas.height = liveSection.offsetHeight;
            liveBg.appendChild(stCanvas);
            const stCtx = stCanvas.getContext('2d');
            const lW = stCanvas.width / PIXEL;
            const lH = stCanvas.height / PIXEL;
            stCtx.setTransform(PIXEL, 0, 0, PIXEL, 0, 0);
            stCtx.imageSmoothingEnabled = false;
            const waterY = Math.floor(lH * 0.6);
            const statueX = Math.floor(lW * 0.12);
            const statueCenterY = waterY - 15;
            let statueHover = false;

            liveSection.addEventListener('mousemove', function(e) {
                const rect = liveSection.getBoundingClientRect();
                const mx = (e.clientX - rect.left) / PIXEL;
                const my = (e.clientY - rect.top) / PIXEL;
                const d = Math.sqrt((mx - statueX) ** 2 + (my - statueCenterY) ** 2);
                const isStatue = d < 25;
                statueHover = isStatue;
                if (isStatue) liveSection.style.cursor = 'pointer';
                else if (liveSection.style.cursor === 'pointer') liveSection.style.cursor = '';
            });
            liveSection.addEventListener('mouseleave', () => { statueHover = false; });

            (function animStatue() {
                stCtx.clearRect(0, 0, lW, lH);
                if (statueHover) {
                    const t = Date.now() * 0.001;
                    const pulse = 0.7 + 0.3 * Math.sin(t * 3);
                    // Green glow around statue
                    for (let dy = -30; dy <= 10; dy++) {
                        for (let dx = -12; dx <= 12; dx++) {
                            const d = Math.sqrt(dx * dx + (dy * 0.5) ** 2);
                            if (d < 15) {
                                const a = 0.2 * pulse * (1 - d / 15);
                                stCtx.fillStyle = `rgba(100,255,150,${a})`;
                                stCtx.fillRect(statueX + dx, statueCenterY + dy, 1, 1);
                            }
                        }
                    }
                }
                requestAnimationFrame(animStatue);
            })();
        }
    }

    // ====== PIGEON/RAT hover cursor — shared mouse tracker ======
    // Expose pigeon/rat positions for hover detection
    const animalPositions = [];

    function registerAnimal(sectionSel, getPos) {
        animalPositions.push({ sectionSel, getPos });
    }

    function initAnimalHoverCursors() {
        const aboutSection = document.querySelector('.section-about');
        if (!aboutSection) return;
        aboutSection.addEventListener('mousemove', function(e) {
            const rect = aboutSection.getBoundingClientRect();
            const PIXEL = 4;
            const mx = (e.clientX - rect.left) / PIXEL;
            const my = (e.clientY - rect.top) / PIXEL;
            let nearAnimal = false;
            for (const a of animalPositions) {
                if (a.sectionSel !== '.section-about') continue;
                const pos = a.getPos();
                if (!pos) continue;
                const d = Math.sqrt((mx - pos.x) ** 2 + (my - pos.y) ** 2);
                if (d < 12) { nearAnimal = true; break; }
            }
            aboutSection.style.cursor = nearAnimal ? 'pointer' : '';
        });
        aboutSection.addEventListener('mouseleave', () => { aboutSection.style.cursor = ''; });
    }

    // ====== STAGE LIGHTNING from 5051 logo (section 4) ======
    function initStageLightning() {
        const PIXEL = 4;
        const section = document.querySelector('.section-stage');
        const parent = section ? section.querySelector('.stage-bg') : null;
        if (!parent) return;

        const canvas = document.createElement('canvas');
        canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:14;';
        canvas.width = section.offsetWidth;
        canvas.height = section.offsetHeight;
        parent.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        const W = canvas.width / PIXEL;
        const H = canvas.height / PIXEL;
        ctx.setTransform(PIXEL, 0, 0, PIXEL, 0, 0);
        ctx.imageSmoothingEnabled = false;

        let bolts = [];       // active lightning bolts
        let flashAlpha = 0;   // screen flash
        let logoHover = false;

        // Stage logo position (matches pixel-scenes.js)
        const stageY = Math.floor(H * 0.855);
        const gs = 3;
        const logoTotalW = 23 * gs; // 69
        const logoX = Math.floor(W * 0.5) - Math.floor(logoTotalW / 2);
        const logoY = stageY - 38 - 6 * gs;
        const logoCX = logoX + logoTotalW / 2;
        const logoH = 6 * gs;

        // Click & hover on stage logo area
        section.addEventListener('click', function(e) {
            const rect = section.getBoundingClientRect();
            const mx = (e.clientX - rect.left) / PIXEL;
            const my = (e.clientY - rect.top) / PIXEL;
            if (mx > logoX - 5 && mx < logoX + logoTotalW + 5 && my > logoY - 5 && my < logoY + logoH + 5) {
                const count = 3 + Math.floor(Math.random() * 3);
                for (let i = 0; i < count; i++) {
                    const startX = logoCX + (Math.random() - 0.5) * 20;
                    bolts.push(generateBolt(startX, logoY));
                }
                flashAlpha = 0.6;
            }
        });
        section.addEventListener('mousemove', function(e) {
            const rect = section.getBoundingClientRect();
            const mx = (e.clientX - rect.left) / PIXEL;
            const my = (e.clientY - rect.top) / PIXEL;
            logoHover = mx > logoX - 5 && mx < logoX + logoTotalW + 5 && my > logoY - 5 && my < logoY + logoH + 5;
            section.style.cursor = logoHover ? 'pointer' : '';
        });
        section.addEventListener('mouseleave', () => { logoHover = false; section.style.cursor = ''; });

        function generateBolt(startX, startY) {
            // Build a jagged bolt path going upward
            const segments = [];
            let x = startX;
            let y = startY;
            const endY = 2 + Math.random() * 10; // near top of section
            const totalSteps = 15 + Math.floor(Math.random() * 12);
            const stepY = (startY - endY) / totalSteps;

            for (let i = 0; i < totalSteps; i++) {
                const nx = x + (Math.random() - 0.5) * 14;
                const ny = y - stepY - Math.random() * 3;
                segments.push({ x1: x, y1: y, x2: nx, y2: ny });
                x = nx;
                y = ny;

                // Random branch
                if (Math.random() > 0.7) {
                    const bx = x + (Math.random() - 0.5) * 20;
                    const by = y - stepY * 0.5 - Math.random() * 5;
                    segments.push({ x1: x, y1: y, x2: bx, y2: by, branch: true });
                }
            }

            return {
                segments,
                life: 1.0,
                color: Math.random() > 0.5 ? 'blue' : 'white'
            };
        }

        function drawBoltSegment(x1, y1, x2, y2, alpha, thickness, color) {
            const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
            const steps = Math.max(1, Math.floor(dist));
            for (let i = 0; i <= steps; i++) {
                const t = i / steps;
                const px = Math.floor(x1 + (x2 - x1) * t);
                const py = Math.floor(y1 + (y2 - y1) * t);

                // Outer glow
                if (thickness > 1) {
                    for (let dx = -2; dx <= 2; dx++) {
                        for (let dy = -2; dy <= 2; dy++) {
                            const d = Math.abs(dx) + Math.abs(dy);
                            if (d <= 2) {
                                const ga = alpha * 0.15 * (1 - d / 3);
                                if (color === 'blue') {
                                    ctx.fillStyle = `rgba(100,150,255,${ga})`;
                                } else {
                                    ctx.fillStyle = `rgba(200,200,255,${ga})`;
                                }
                                ctx.fillRect(px + dx, py + dy, 1, 1);
                            }
                        }
                    }
                }

                // Mid glow
                ctx.fillStyle = color === 'blue'
                    ? `rgba(150,180,255,${alpha * 0.5})`
                    : `rgba(220,220,255,${alpha * 0.5})`;
                ctx.fillRect(px - 1, py, 1, 1);
                ctx.fillRect(px + 1, py, 1, 1);
                ctx.fillRect(px, py - 1, 1, 1);
                ctx.fillRect(px, py + 1, 1, 1);

                // Core — bright white
                ctx.fillStyle = `rgba(255,255,255,${alpha * 0.9})`;
                ctx.fillRect(px, py, 1, 1);
            }
        }

        function animate() {
            ctx.clearRect(0, 0, W, H);

            // Screen flash
            if (flashAlpha > 0) {
                ctx.fillStyle = `rgba(200,200,255,${flashAlpha * 0.15})`;
                ctx.fillRect(0, 0, W, H);
                flashAlpha -= 0.03;
            }

            // Hover glow on logo
            if (logoHover) {
                const t = Date.now() * 0.001;
                const pulse = 0.7 + 0.3 * Math.sin(t * 3);
                for (let dy = -6; dy <= logoH + 6; dy++) {
                    for (let dx = -6; dx <= logoTotalW + 6; dx++) {
                        const edgeX = Math.min(dx + 6, logoTotalW + 6 - dx) / 6;
                        const edgeY = Math.min(dy + 6, logoH + 6 - dy) / 6;
                        const edge = Math.min(1, edgeX) * Math.min(1, edgeY);
                        const a = 0.2 * pulse * edge;
                        if (a > 0.01) {
                            ctx.fillStyle = `rgba(255,50,50,${a})`;
                            ctx.fillRect(logoX + dx, logoY + dy, 1, 1);
                        }
                    }
                }
            }

            // Draw & update bolts
            for (let i = bolts.length - 1; i >= 0; i--) {
                const bolt = bolts[i];
                bolt.life -= 0.02;
                if (bolt.life <= 0) { bolts.splice(i, 1); continue; }

                const alpha = bolt.life;
                // Flicker effect
                const flicker = Math.random() > 0.3 ? 1 : 0.3;

                for (const seg of bolt.segments) {
                    const thickness = seg.branch ? 1 : 2;
                    drawBoltSegment(
                        seg.x1, seg.y1, seg.x2, seg.y2,
                        alpha * flicker,
                        thickness,
                        bolt.color
                    );
                }
            }

            requestAnimationFrame(animate);
        }
        animate();
    }

    // ====== FOREGROUND INSTRUMENTS (on top of musicians) ======
    function initForegroundInstruments() {
        const PIXEL = 4;
        const section = document.querySelector('.section-stage');
        if (!section) return;

        const canvas = document.createElement('canvas');
        canvas.width = section.offsetWidth;
        canvas.height = section.offsetHeight;
        canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:57;';
        section.querySelector('.stage-bg').appendChild(canvas);

        const ctx = canvas.getContext('2d');
        const W = canvas.width / PIXEL;
        const H = canvas.height / PIXEL;
        ctx.imageSmoothingEnabled = false;
        ctx.setTransform(PIXEL, 0, 0, PIXEL, 0, 0);

        const stageY = Math.floor(H * 0.855);
        const centerX = Math.floor(W * 0.5);
        const isMobile = window.innerWidth <= 768;
        const mic1X = centerX - 32;   // Саша (bass)
        const mic2X = centerX;        // Іван (guitar)
        const drumCX = centerX + 32;  // Денис (drums)
        const instScale = isMobile ? 0.6 : 1;

        // Helper
        const fp = (x, y, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1); };
        const fr = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };

        // Scale helper for mobile
        function scaleAround(cx, cy) {
            ctx.save();
            if (instScale !== 1) {
                ctx.translate(cx, cy);
                ctx.scale(instScale, instScale);
                ctx.translate(-cx, -cy);
            }
        }

        // ── MIC STAND 1 (Саша) with bass guitar — foreground ──
        scaleAround(mic1X, stageY - 5);
        fr(mic1X, stageY - 16, 1, 16, '#888');
        fr(mic1X - 1, stageY, 3, 1, '#666');
        fr(mic1X - 1, stageY - 18, 3, 2, '#444');
        fp(mic1X, stageY - 18, '#555');
        // Bass guitar — Precision Bass style, leaning right (RED)
        fr(mic1X - 7, stageY - 10, 6, 8, '#cc1111');
        fr(mic1X - 8, stageY - 9, 1, 6, '#cc1111');
        fr(mic1X - 1, stageY - 9, 1, 6, '#cc1111');
        fr(mic1X - 6, stageY - 11, 4, 1, '#cc1111');
        fr(mic1X - 6, stageY - 2, 4, 1, '#cc1111');
        fr(mic1X - 6, stageY - 9, 4, 1, '#dd3333');
        fp(mic1X - 7, stageY - 8, '#dd2222');
        // Pickguard
        fr(mic1X - 6, stageY - 8, 4, 3, '#f0e8d8');
        fr(mic1X - 5, stageY - 9, 2, 1, '#f0e8d8');
        // Pickups
        fr(mic1X - 5, stageY - 7, 3, 1, '#333');
        fr(mic1X - 5, stageY - 5, 3, 1, '#333');
        // Bridge
        fr(mic1X - 5, stageY - 3, 3, 1, '#999');
        // Knobs
        fp(mic1X - 3, stageY - 4, '#ddd');
        fp(mic1X - 2, stageY - 4, '#ddd');
        // Neck
        for (let i = 0; i < 8; i++) {
            fp(mic1X - 1 + i, stageY - 12 - i, '#8b6535');
            fp(mic1X + 0 + i, stageY - 12 - i, '#7a5525');
        }
        fp(mic1X + 1, stageY - 14, '#c8b080');
        fp(mic1X + 4, stageY - 17, '#c8b080');
        for (let i = 0; i < 8; i++) fp(mic1X - 1 + i, stageY - 12 - i, '#aaa');
        // Headstock
        fr(mic1X + 7, stageY - 21, 2, 3, '#8b6535');
        fp(mic1X + 6, stageY - 20, '#8b6535');
        fp(mic1X + 9, stageY - 21, '#ccc');
        fp(mic1X + 9, stageY - 20, '#ccc');
        fp(mic1X + 9, stageY - 19, '#ccc');
        fp(mic1X + 6, stageY - 21, '#ccc');
        ctx.restore();

        // ── MIC STAND 2 (Іван) with electric guitar — foreground ──
        scaleAround(mic2X, stageY - 5);
        fr(mic2X, stageY - 16, 1, 16, '#888');
        fr(mic2X - 1, stageY, 3, 1, '#666');
        fr(mic2X - 1, stageY - 18, 3, 2, '#444');
        fp(mic2X, stageY - 18, '#555');
        // Stratocaster style, leaning left (BLACK)
        fr(mic2X + 2, stageY - 10, 6, 8, '#1a1a1a');
        fr(mic2X + 8, stageY - 9, 1, 6, '#1a1a1a');
        fr(mic2X + 1, stageY - 9, 1, 6, '#1a1a1a');
        fr(mic2X + 3, stageY - 11, 4, 1, '#1a1a1a');
        fr(mic2X + 3, stageY - 2, 4, 1, '#1a1a1a');
        fr(mic2X + 3, stageY - 9, 4, 1, '#2a2a2a');
        fp(mic2X + 7, stageY - 8, '#222');
        // Pickguard
        fr(mic2X + 3, stageY - 8, 4, 3, '#f5f0e0');
        fr(mic2X + 4, stageY - 9, 2, 1, '#f5f0e0');
        // Pickups (3 single coils)
        fr(mic2X + 4, stageY - 7, 2, 1, '#222');
        fr(mic2X + 4, stageY - 6, 2, 1, '#222');
        fr(mic2X + 4, stageY - 5, 2, 1, '#222');
        // Bridge
        fr(mic2X + 4, stageY - 3, 2, 1, '#aaa');
        fp(mic2X + 6, stageY - 3, '#888');
        // Knobs
        fp(mic2X + 3, stageY - 4, '#fff');
        fp(mic2X + 7, stageY - 5, '#fff');
        // Neck
        for (let i = 0; i < 8; i++) {
            fp(mic2X + 1 - i, stageY - 12 - i, '#8b6535');
            fp(mic2X + 0 - i, stageY - 12 - i, '#7a5525');
        }
        fp(mic2X - 1, stageY - 14, '#c8b080');
        fp(mic2X - 4, stageY - 17, '#c8b080');
        for (let i = 0; i < 8; i++) fp(mic2X + 1 - i, stageY - 12 - i, '#aaa');
        // Headstock
        fr(mic2X - 8, stageY - 21, 2, 3, '#1a1a1a');
        fp(mic2X - 6, stageY - 20, '#1a1a1a');
        fp(mic2X - 10, stageY - 21, '#ccc');
        fp(mic2X - 10, stageY - 20, '#ccc');
        fp(mic2X - 10, stageY - 19, '#ccc');
        fp(mic2X - 7, stageY - 21, '#ccc');
        ctx.restore();

        // ── DRUM KIT (Денис) — foreground ──
        scaleAround(drumCX, stageY - 5);
        const drumX = drumCX - 5;
        const drumY = stageY;
        // Bass drum
        ctx.fillStyle = '#8b0000';
        ctx.fillRect(drumX, drumY - 8, 10, 8);
        ctx.fillStyle = '#660000';
        ctx.fillRect(drumX + 1, drumY - 7, 8, 6);
        ctx.fillStyle = '#440000';
        ctx.fillRect(drumX + 3, drumY - 6, 4, 4);
        // Cymbals
        ctx.fillStyle = '#ccaa00';
        ctx.fillRect(drumX - 4, drumY - 12, 6, 1);
        ctx.fillRect(drumX + 10, drumY - 14, 6, 1);
        // Hi-hat
        ctx.fillStyle = '#aa8800';
        ctx.fillRect(drumX - 6, drumY - 10, 4, 1);
        // Stands
        ctx.fillStyle = '#666';
        ctx.fillRect(drumX - 3, drumY - 11, 1, 11);
        ctx.fillRect(drumX - 4, drumY, 3, 1);
        ctx.fillRect(drumX + 12, drumY - 13, 1, 13);
        ctx.fillRect(drumX + 11, drumY, 3, 1);
        ctx.fillRect(drumX - 5, drumY - 9, 1, 9);
        ctx.fillRect(drumX - 6, drumY, 3, 1);
        ctx.restore();
    }

    // ====== PUB: Foreground bar + sliding beer + taxi ======
    function initPubBar() {
        const PIXEL = 4;
        const section = document.querySelector('.section-pub');
        if (!section) return;
        const parent = section.querySelector('.pub-bg');

        const canvas = document.createElement('canvas');
        canvas.width = section.offsetWidth;
        canvas.height = section.offsetHeight;
        canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:57;';
        parent.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        const W = canvas.width / PIXEL;
        const H = canvas.height / PIXEL;
        ctx.imageSmoothingEnabled = false;
        ctx.setTransform(PIXEL, 0, 0, PIXEL, 0, 0);

        const isMobilePub = (window.innerWidth <= 768);
        const barY = Math.floor(H * (isMobilePub ? 0.885 : 0.855));
        const barH = 10;
        const barTop = barY - barH;
        const centerX = Math.floor(W * 0.5);
        const barLeft = Math.floor(W * 0.12);
        const barRight = Math.floor(W * 0.88);
        const barW = barRight - barLeft;

        // Beer glasses
        const glasses = [
            { targetX: centerX - 32, x: centerX + 18, arrived: false, delay: 0 },
            { targetX: centerX, x: centerX - 22, arrived: false, delay: 500 },
            { targetX: centerX + 32, x: centerX + 5, arrived: false, delay: 1000 },
        ];
        let started = false;
        let startTime = 0;

        // Taxi — continuous street through both windows
        const wallTop = Math.floor(H * 0.06);
        const winY = wallTop + 14;
        const winH = 32;
        const winX1 = Math.floor(W * 0.05);
        const win2X = Math.floor(W * 0.82);
        const winW = 35;
        const wallGapPx = 40; // virtual gap — taxi hidden for a while between windows
        const totalStreet = winW + wallGapPx + winW; // total taxi travel distance
        let taxi = { pos: -15, active: false, nextTime: 2000, dir: 1 };
        let taxiTimer = 0;

        function getScrollProgress() {
            if (window.innerWidth <= 768) {
                const w = document.getElementById('horizontalWrapper');
                if (w) {
                    const maxX = w.scrollWidth - w.clientWidth;
                    return maxX > 0 ? Math.max(0, Math.min(1, w.scrollLeft / maxX)) : 0;
                }
            }
            const scrollY = window.scrollY;
            const maxScrollY = document.body.scrollHeight - window.innerHeight;
            return maxScrollY > 0 ? Math.max(0, Math.min(1, scrollY / maxScrollY)) : 0;
        }

        function drawBeer(gx, gy) {
            ctx.fillStyle = 'rgba(180,210,230,0.25)';
            ctx.fillRect(gx-2, gy-9, 1, 9);
            ctx.fillRect(gx+2, gy-9, 1, 9);
            ctx.fillStyle = '#daa520';
            ctx.fillRect(gx-1, gy-7, 3, 6);
            ctx.fillStyle = '#eebb33';
            ctx.fillRect(gx-1, gy-7, 1, 5);
            ctx.fillStyle = '#c89418';
            ctx.fillRect(gx-1, gy-2, 3, 1);
            ctx.fillStyle = '#f5eedd';
            ctx.fillRect(gx-2, gy-9, 5, 2);
            ctx.fillStyle = '#fffef8';
            ctx.fillRect(gx-1, gy-9, 3, 1);
            ctx.fillStyle = '#f5eedd';
            ctx.fillRect(gx, gy-10, 1, 1);
            ctx.fillRect(gx-2, gy-10, 1, 1);
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.fillRect(gx+2, gy-8, 1, 7);
            ctx.fillStyle = 'rgba(180,210,230,0.35)';
            ctx.fillRect(gx-2, gy-1, 5, 1);
            ctx.fillRect(gx-1, gy, 3, 1);
        }

        function drawTaxi(tx, ty, dir) {
            // Detailed NYC yellow cab
            const d = dir;
            // Body
            ctx.fillStyle = '#e8c800';
            ctx.fillRect(tx, ty-4, 14, 4);
            // Body shadow
            ctx.fillStyle = '#ccb000';
            ctx.fillRect(tx, ty-1, 14, 1);
            // Roof
            ctx.fillStyle = '#d4b800';
            ctx.fillRect(tx+3, ty-6, 8, 2);
            ctx.fillRect(tx+2, ty-5, 1, 1);
            ctx.fillRect(tx+11, ty-5, 1, 1);
            // Windshield + rear window
            ctx.fillStyle = '#335577';
            ctx.fillRect(tx+3, ty-6, 3, 1);
            ctx.fillRect(tx+8, ty-6, 3, 1);
            // Side windows
            ctx.fillStyle = '#446688';
            ctx.fillRect(tx+3, ty-5, 3, 1);
            ctx.fillRect(tx+8, ty-5, 3, 1);
            // Door line
            ctx.fillStyle = '#bba800';
            ctx.fillRect(tx+7, ty-4, 1, 3);
            // Bumpers
            ctx.fillStyle = '#888';
            ctx.fillRect(tx-1, ty-2, 1, 2);
            ctx.fillRect(tx+14, ty-2, 1, 2);
            // Headlights
            ctx.fillStyle = '#ffd';
            ctx.fillRect(tx + (d>0 ? 13 : 0), ty-3, 1, 1);
            ctx.fillRect(tx + (d>0 ? 13 : 0), ty-2, 1, 1);
            // Taillights
            ctx.fillStyle = '#f22';
            ctx.fillRect(tx + (d>0 ? 0 : 13), ty-3, 1, 1);
            // Wheels
            ctx.fillStyle = '#111';
            ctx.fillRect(tx+1, ty, 3, 1);
            ctx.fillRect(tx+10, ty, 3, 1);
            // Hubcaps
            ctx.fillStyle = '#555';
            ctx.fillRect(tx+2, ty, 1, 1);
            ctx.fillRect(tx+11, ty, 1, 1);
            // Taxi sign on roof
            ctx.fillStyle = '#fff';
            ctx.fillRect(tx+6, ty-7, 3, 1);
            ctx.fillStyle = '#ffee88';
            ctx.fillRect(tx+7, ty-7, 1, 1);
            // License plate
            ctx.fillStyle = '#eee';
            ctx.fillRect(tx+5, ty-1, 4, 1);
        }

        function drawBarTop() {
            // Marble bar top surface
            ctx.fillStyle = '#333340';
            ctx.fillRect(barLeft-1, barTop-1, barW+2, 1);
            ctx.fillStyle = '#1a1a22';
            ctx.fillRect(barLeft-1, barTop, barW+2, 1);
            ctx.fillStyle = '#222230';
            ctx.fillRect(barLeft-1, barTop+1, barW+2, 1);
            ctx.fillStyle = '#181820';
            ctx.fillRect(barLeft-1, barTop+2, barW+2, 1);
            for (let x=barLeft; x<barRight; x+=5) {
                ctx.fillStyle = 'rgba(255,255,255,0.05)';
                ctx.fillRect(x, barTop+1, 1, 1);
            }
        }

        function animate() {
            const progress = getScrollProgress();
            const pubThreshold = 0.92;
            const t = Date.now();

            ctx.clearRect(0, 0, W, H);
            drawBarTop();

            // ── TAXI traveling through both windows as one street ──
            taxiTimer += 16;
            if (taxiTimer > taxi.nextTime && !taxi.active) {
                taxi.active = true;
                taxi.dir = Math.random() > 0.3 ? 1 : -1; // mostly left to right
                taxi.pos = taxi.dir > 0 ? -16 : totalStreet + 16;
            }
            if (taxi.active) {
                const streetY = winY + winH - 2;
                taxi.pos += 0.35 * taxi.dir;

                // Window 1: pos 0..winW maps to winX1
                // Wall gap: pos winW..winW+wallGapPx (hidden)
                // Window 2: pos winW+wallGapPx..totalStreet maps to win2X
                const p = taxi.pos;

                // Draw in window 1
                if (p > -16 && p < winW + 16) {
                    ctx.save();
                    ctx.beginPath();
                    ctx.rect(winX1, winY, winW, winH);
                    ctx.clip();
                    drawTaxi(winX1 + Math.floor(p), streetY, taxi.dir);
                    ctx.restore();
                }
                // Draw in window 2
                const p2 = p - winW - wallGapPx;
                if (p2 > -16 && p2 < winW + 16) {
                    ctx.save();
                    ctx.beginPath();
                    ctx.rect(win2X, winY, winW, winH);
                    ctx.clip();
                    drawTaxi(win2X + Math.floor(p2), streetY, taxi.dir);
                    ctx.restore();
                }

                // Done when fully past both windows
                if ((taxi.dir > 0 && taxi.pos > totalStreet + 18) ||
                    (taxi.dir < 0 && taxi.pos < -18)) {
                    taxi.active = false;
                    taxiTimer = 0;
                    taxi.nextTime = 3000 + Math.random() * 5000;
                }
            }

            // ── BEER GLASSES — only after musicians stop at the bar ──
            // Check if musicians are idle (not walking) via the bandWalkers canvas
            const musiciansIdle = progress >= pubThreshold && !window._bandWalkersIsWalking;

            if (musiciansIdle && !started) {
                started = true;
                startTime = Date.now();
            }
            if (started) {
                const elapsed = Date.now() - startTime;
                glasses.forEach((g) => {
                    if (elapsed < g.delay) return;
                    if (!g.arrived) {
                        const st = elapsed - g.delay;
                        const dur = 900;
                        const tt = Math.min(1, st / dur);
                        const eased = 1 - Math.pow(1-tt, 3);
                        g.x = g.x + (g.targetX - g.x) * eased;
                        if (tt >= 1) { g.x = g.targetX; g.arrived = true; }
                    }
                    drawBeer(Math.floor(g.x), barTop - 1);
                });
            }
            if (progress < pubThreshold - 0.05) {
                started = false;
                glasses[0].x = centerX+18; glasses[0].arrived = false;
                glasses[1].x = centerX-22; glasses[1].arrived = false;
                glasses[2].x = centerX+5; glasses[2].arrived = false;
            }

            requestAnimationFrame(animate);
        }
        requestAnimationFrame(animate);
    }

    // ====== PIXEL ART MUSIC ICONS (20x20 grid, 4px scale = 80px) ======
    function initMusicIcons() {
        const P = 4;
        const S = 20; // grid size

        function drawIcon(id, drawFn) {
            const c = document.getElementById(id);
            if (!c) return;
            const ctx = c.getContext('2d');
            ctx.imageSmoothingEnabled = false;
            ctx.setTransform(P, 0, 0, P, 0, 0);
            drawFn(ctx);
        }

        const px = (ctx, x, y, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1); };
        const rect = (ctx, x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };

        // ── SPOTIFY — green circle, 3 curved sound bars ──
        drawIcon('iconSpotify', ctx => {
            const cx = 10, cy = 10, R = 9;
            // Circle with shading
            for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
                const dx = x - cx, dy = y - cy;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist <= R) {
                    if (dist > R - 1) ctx.fillStyle = '#0e6e2e';
                    else if (dx + dy < -4) ctx.fillStyle = '#22d464'; // highlight
                    else ctx.fillStyle = '#1DB954';
                    ctx.fillRect(x, y, 1, 1);
                }
            }
            // Outline
            for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
                const dist = Math.sqrt((x-cx)**2 + (y-cy)**2);
                if (dist <= R + 0.7 && dist > R) px(ctx, x, y, '#0a4a1a');
            }
            // 3 curved sound bars (black, thicker)
            const bars = [
                // Top bar — wide arc
                [[4,5],[5,5],[6,5],[7,5],[8,5],[9,5],[10,5],[11,5],[12,5],[13,6],[14,6],[15,7]],
                // Middle bar
                [[5,9],[6,8],[7,8],[8,8],[9,8],[10,8],[11,8],[12,9],[13,9]],
                // Bottom bar
                [[7,11],[8,11],[9,11],[10,11],[11,12],[12,12]],
            ];
            bars.forEach(bar => {
                bar.forEach(([x,y]) => {
                    px(ctx, x, y, '#191414');
                    px(ctx, x, y+1, '#191414');
                });
            });
        });

        // ── YOUTUBE MUSIC — red circle, play triangle with inner circle ──
        drawIcon('iconYoutube', ctx => {
            const cx = 10, cy = 10, R = 9;
            // Outer circle
            for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
                const dist = Math.sqrt((x-cx)**2 + (y-cy)**2);
                if (dist <= R) {
                    if (dist > R - 1) ctx.fillStyle = '#aa0000';
                    else if ((x-cx) + (y-cy) < -4) ctx.fillStyle = '#ff2222';
                    else ctx.fillStyle = '#ff0000';
                    ctx.fillRect(x, y, 1, 1);
                }
            }
            // Outline
            for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
                const dist = Math.sqrt((x-cx)**2 + (y-cy)**2);
                if (dist <= R + 0.7 && dist > R) px(ctx, x, y, '#660000');
            }
            // Inner white circle (thin ring)
            for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
                const dist = Math.sqrt((x-cx)**2 + (y-cy)**2);
                if (dist <= 6.5 && dist > 5.5) px(ctx, x, y, '#fff');
            }
            // Play triangle (white, filled)
            const triRows = [
                [8, [9]],
                [9, [9,10]],
                [10, [9,10,11]],
                [11, [9,10,11,12]],
                [12, [9,10,11]],
                [13, [9,10]],
                [14, [9]],
            ];
            // Offset to center: play starts at x=8
            ctx.fillStyle = '#fff';
            ctx.fillRect(8, 7, 1, 6);
            ctx.fillRect(9, 7, 1, 6);
            ctx.fillRect(10, 8, 1, 4);
            ctx.fillRect(11, 8, 1, 4);
            ctx.fillRect(12, 9, 1, 2);
            ctx.fillRect(13, 9, 1, 2);
        });

        // ── APPLE MUSIC — rounded square gradient, music note ──
        drawIcon('iconApple', ctx => {
            const R = 3; // corner radius
            // Rounded rectangle with gradient
            for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
                // Check rounded corners
                let inside = true;
                const corners = [[R,R],[S-1-R,R],[R,S-1-R],[S-1-R,S-1-R]];
                if (x < R && y < R) inside = Math.sqrt((x-R)**2 + (y-R)**2) <= R;
                else if (x > S-1-R && y < R) inside = Math.sqrt((x-(S-1-R))**2 + (y-R)**2) <= R;
                else if (x < R && y > S-1-R) inside = Math.sqrt((x-R)**2 + (y-(S-1-R))**2) <= R;
                else if (x > S-1-R && y > S-1-R) inside = Math.sqrt((x-(S-1-R))**2 + (y-(S-1-R))**2) <= R;

                if (!inside) continue;
                // Gradient top to bottom: bright red → deep pink
                const t = y / (S - 1);
                const r = Math.floor(252 - t * 50);
                const g = Math.floor(60 - t * 30);
                const b = Math.floor(68 + t * 30);
                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fillRect(x, y, 1, 1);
            }
            // Subtle highlight top-left
            for (let y = 1; y < 6; y++) for (let x = 1; x < 6; x++) {
                if (x < R && y < R && Math.sqrt((x-R)**2 + (y-R)**2) > R) continue;
                px(ctx, x, y, 'rgba(255,255,255,0.1)');
            }
            // Outline
            ctx.fillStyle = '#8a1a22';
            // Top & bottom edges
            rect(ctx, R, 0, S - 2*R, 1, '#8a1a22');
            rect(ctx, R, S-1, S - 2*R, 1, '#8a1a22');
            // Left & right edges
            rect(ctx, 0, R, 1, S - 2*R, '#8a1a22');
            rect(ctx, S-1, R, 1, S - 2*R, '#8a1a22');

            // ── Music note (white, detailed) ──
            ctx.fillStyle = '#fff';
            // Left note head (oval)
            rect(ctx, 5, 14, 3, 2, '#fff');
            px(ctx, 4, 14, '#fff');
            px(ctx, 4, 15, '#fff');
            px(ctx, 8, 14, '#fff');
            // Left stem
            rect(ctx, 8, 4, 1, 11, '#fff');
            // Beam (top connecting bar, slight angle)
            rect(ctx, 8, 4, 6, 1, '#fff');
            rect(ctx, 8, 5, 6, 1, '#fff');
            rect(ctx, 13, 5, 1, 1, '#fff');
            // Flag detail
            rect(ctx, 13, 6, 1, 1, '#eee');
            // Right stem
            rect(ctx, 13, 5, 1, 9, '#fff');
            // Right note head (oval)
            rect(ctx, 10, 12, 3, 2, '#fff');
            px(ctx, 9, 12, '#fff');
            px(ctx, 9, 13, '#fff');
            px(ctx, 13, 12, '#fff');
            // Shadow on note heads
            px(ctx, 5, 15, '#ddd');
            px(ctx, 10, 13, '#ddd');
        });
    }

    // ====== STAGE PARTY MODE ======
    // Activates when musicians are at the stage section (last ~15% of scroll)
    function initStageParty() {
        const PIXEL = 4;
        const section = document.querySelector('.section-stage');
        if (!section) return;

        const canvas = document.createElement('canvas');
        canvas.width = section.offsetWidth;
        canvas.height = section.offsetHeight;
        canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:58;';
        section.querySelector('.stage-bg').appendChild(canvas);

        const ctx = canvas.getContext('2d');
        const W = canvas.width / PIXEL;
        const H = canvas.height / PIXEL;
        ctx.imageSmoothingEnabled = false;
        ctx.setTransform(PIXEL, 0, 0, PIXEL, 0, 0);

        const stageY = Math.floor(H * 0.855);

        // Confetti particles
        const confetti = [];
        const CONFETTI_COLORS = [
            '#ff1144', '#ff4488', '#ffdd00', '#ffaa00',
            '#44ff44', '#00ddff', '#4488ff', '#aa44ff',
            '#ff6600', '#ffffff', '#ff0066', '#00ff88'
        ];

        // Crowd hands
        const hands = [];
        for (let i = 0; i < 30; i++) {
            hands.push({
                x: 5 + Math.random() * (W - 10),
                baseY: stageY + 4 + Math.random() * 8,
                phase: Math.random() * Math.PI * 2,
                speed: 1.5 + Math.random() * 2.5,
                height: 4 + Math.random() * 5,
                skin: Math.random() > 0.5 ? '#e8b87a' : '#c49458'
            });
        }

        // Smoke particles
        const smoke = [];

        // Laser beams
        const lasers = [
            { angle: 0, speed: 0.7, color: '#ff0044', phase: 0 },
            { angle: 0, speed: 0.5, color: '#00aaff', phase: 2 },
            { angle: 0, speed: 0.9, color: '#44ff00', phase: 4 },
        ];

        let partyActive = false;
        let partyIntensity = 0; // 0 to 1, fades in
        let strobeTimer = 0;

        function getScrollProgress() {
            if (window.innerWidth <= 768) {
                const w = document.getElementById('horizontalWrapper');
                if (w) {
                    const maxX = w.scrollWidth - w.clientWidth;
                    return maxX > 0 ? Math.max(0, Math.min(1, w.scrollLeft / maxX)) : 0;
                }
            }
            const scrollY = window.scrollY;
            const maxScrollY = document.body.scrollHeight - window.innerHeight;
            return maxScrollY > 0 ? Math.max(0, Math.min(1, scrollY / maxScrollY)) : 0;
        }

        function animate() {
            const progress = getScrollProgress();
            // Party starts fading in at 62% scroll, full at 78% (stage is now section 4 of 5)
            const target = progress > 0.62 ? Math.min(1, (progress - 0.62) / 0.16) : 0;
            partyIntensity += (target - partyIntensity) * 0.05;
            partyActive = partyIntensity > 0.01;

            ctx.clearRect(0, 0, W, H);

            if (!partyActive) {
                requestAnimationFrame(animate);
                return;
            }

            const t = Date.now() * 0.001;
            const intensity = partyIntensity;

            // === STROBE FLASH ===
            strobeTimer += 0.016;
            if (intensity > 0.7 && Math.sin(t * 15) > 0.92) {
                ctx.fillStyle = `rgba(255,255,255,${0.04 * intensity})`;
                ctx.fillRect(0, 0, W, H);
            }

            // === LASER BEAMS from ceiling ===
            lasers.forEach(laser => {
                laser.angle = Math.sin(t * laser.speed + laser.phase) * 0.6;
                const startX = Math.floor(W * 0.5);
                const startY = 8;
                const len = H * 0.75;

                for (let d = 0; d < len; d++) {
                    const lx = startX + Math.floor(Math.sin(laser.angle) * d);
                    const ly = startY + Math.floor(Math.cos(laser.angle) * d);
                    if (ly >= H || lx < 0 || lx >= W) break;
                    const a = (1 - d / len) * 0.12 * intensity;
                    ctx.fillStyle = laser.color;
                    ctx.globalAlpha = a;
                    ctx.fillRect(lx, ly, 1, 1);
                    // Beam width
                    if (d > 10) {
                        ctx.globalAlpha = a * 0.5;
                        ctx.fillRect(lx - 1, ly, 1, 1);
                        ctx.fillRect(lx + 1, ly, 1, 1);
                    }
                }
                ctx.globalAlpha = 1;
            });

            // === CONFETTI ===
            // Spawn new confetti
            if (Math.random() < 0.3 * intensity) {
                confetti.push({
                    x: Math.random() * W,
                    y: -2,
                    vx: (Math.random() - 0.5) * 1.5,
                    vy: 0.3 + Math.random() * 0.8,
                    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
                    rot: Math.random() * Math.PI,
                    rotSpeed: (Math.random() - 0.5) * 0.2,
                    size: Math.random() > 0.5 ? 2 : 1,
                    life: 0
                });
            }

            for (let i = confetti.length - 1; i >= 0; i--) {
                const c = confetti[i];
                c.x += c.vx + Math.sin(t * 2 + c.rot) * 0.3;
                c.y += c.vy;
                c.rot += c.rotSpeed;
                c.life++;
                if (c.y > H + 5 || c.life > 400) {
                    confetti.splice(i, 1);
                    continue;
                }
                const alpha = intensity * (c.y < stageY ? 1 : 0.3);
                ctx.fillStyle = c.color;
                ctx.globalAlpha = alpha;
                // Rotating rectangle effect
                const w = Math.abs(Math.cos(c.rot)) * c.size + 0.5;
                ctx.fillRect(Math.floor(c.x), Math.floor(c.y), Math.ceil(w), c.size);
            }
            ctx.globalAlpha = 1;

            // === SMOKE / FOG at stage level ===
            if (Math.random() < 0.15 * intensity) {
                smoke.push({
                    x: Math.random() * W,
                    y: stageY - 2 + Math.random() * 4,
                    vx: (Math.random() - 0.5) * 0.4,
                    size: 3 + Math.random() * 6,
                    life: 0,
                    maxLife: 60 + Math.random() * 80
                });
            }

            for (let i = smoke.length - 1; i >= 0; i--) {
                const s = smoke[i];
                s.x += s.vx;
                s.y -= 0.05;
                s.size += 0.03;
                s.life++;
                if (s.life > s.maxLife) {
                    smoke.splice(i, 1);
                    continue;
                }
                const fade = 1 - s.life / s.maxLife;
                const alpha = fade * 0.06 * intensity;
                const r = Math.floor(s.size);
                for (let dy = -r; dy <= r; dy++) {
                    for (let dx = -r; dx <= r; dx++) {
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < r) {
                            const a = alpha * (1 - dist / r);
                            ctx.fillStyle = `rgba(200,200,220,${a})`;
                            ctx.fillRect(Math.floor(s.x + dx), Math.floor(s.y + dy), 1, 1);
                        }
                    }
                }
            }

            // === CROWD HANDS waving ===
            hands.forEach(h => {
                const wave = Math.sin(t * h.speed + h.phase);
                const handY = h.baseY - h.height * intensity - wave * 2 * intensity;
                const lean = Math.floor(wave * 1.5);

                // Arm
                for (let dy = 0; dy < Math.floor(h.height * intensity); dy++) {
                    const ax = Math.floor(h.x + lean * (dy / h.height));
                    ctx.fillStyle = h.skin;
                    ctx.globalAlpha = 0.7 * intensity;
                    ctx.fillRect(ax, Math.floor(handY + dy), 1, 1);
                }
                // Hand / fist at top
                ctx.fillStyle = h.skin;
                ctx.globalAlpha = 0.8 * intensity;
                ctx.fillRect(Math.floor(h.x + lean), Math.floor(handY), 2, 2);

                // Some hands hold phones (white glow)
                if (h.phase > 4) {
                    ctx.fillStyle = '#fff';
                    ctx.globalAlpha = (0.4 + Math.sin(t * 3 + h.phase) * 0.3) * intensity;
                    ctx.fillRect(Math.floor(h.x + lean), Math.floor(handY) - 1, 1, 2);
                }
            });
            ctx.globalAlpha = 1;

            // === EXTRA camera flashes (more intense) ===
            if (intensity > 0.5 && Math.random() < 0.2 * intensity) {
                const fx = Math.floor(5 + Math.random() * (W - 10));
                const fy = Math.floor(stageY + 3 + Math.random() * 10);
                ctx.fillStyle = '#fff';
                ctx.globalAlpha = 0.9;
                ctx.fillRect(fx, fy, 2, 2);
                ctx.globalAlpha = 0.4;
                ctx.fillRect(fx - 1, fy - 1, 4, 4);
                ctx.globalAlpha = 0.15;
                ctx.fillRect(fx - 2, fy - 2, 6, 6);
                ctx.globalAlpha = 1;
            }

            // === SPOTLIGHT color sweep on floor ===
            const sweepX = Math.floor(W * 0.5 + Math.sin(t * 0.8) * W * 0.3);
            const sweepColor = `hsl(${(t * 60) % 360}, 100%, 50%)`;
            for (let dx = -8; dx <= 8; dx++) {
                const dist = Math.abs(dx) / 8;
                ctx.fillStyle = sweepColor;
                ctx.globalAlpha = (1 - dist) * 0.05 * intensity;
                ctx.fillRect(sweepX + dx, stageY - 1, 1, 3);
            }
            ctx.globalAlpha = 1;

            requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);
    }

    // ====== SOCIAL ICONS (YouTube + Instagram, home section) ======
    function initSocialIcons() {
        const P = 4;
        const S = 20;

        function drawIcon(id, drawFn) {
            const c = document.getElementById(id);
            if (!c) return;
            const ctx = c.getContext('2d');
            ctx.imageSmoothingEnabled = false;
            ctx.setTransform(P, 0, 0, P, 0, 0);
            drawFn(ctx);
        }

        const px = (ctx, x, y, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1); };
        const rect = (ctx, x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };

        // ── YouTube — red rounded rectangle with play button ──
        drawIcon('iconYoutubeHome', ctx => {
            // Rounded rectangle
            for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
                let inside = true;
                const R = 3;
                if (x < R && y < R) inside = Math.sqrt((x-R)**2 + (y-R)**2) <= R;
                else if (x > S-1-R && y < R) inside = Math.sqrt((x-(S-1-R))**2 + (y-R)**2) <= R;
                else if (x < R && y > S-1-R) inside = Math.sqrt((x-R)**2 + (y-(S-1-R))**2) <= R;
                else if (x > S-1-R && y > S-1-R) inside = Math.sqrt((x-(S-1-R))**2 + (y-(S-1-R))**2) <= R;
                if (!inside) continue;
                const t = y / (S - 1);
                ctx.fillStyle = t < 0.3 ? '#ff1a1a' : t < 0.7 ? '#ee0000' : '#cc0000';
                ctx.fillRect(x, y, 1, 1);
            }
            // Outline
            rect(ctx, 3, 0, S-6, 1, '#aa0000');
            rect(ctx, 3, S-1, S-6, 1, '#880000');
            rect(ctx, 0, 3, 1, S-6, '#aa0000');
            rect(ctx, S-1, 3, 1, S-6, '#880000');
            // Play triangle (white)
            ctx.fillStyle = '#fff';
            rect(ctx, 7, 5, 1, 10, '#fff');
            rect(ctx, 8, 6, 1, 8, '#fff');
            rect(ctx, 9, 7, 1, 6, '#fff');
            rect(ctx, 10, 7, 1, 6, '#fff');
            rect(ctx, 11, 8, 1, 4, '#fff');
            rect(ctx, 12, 8, 1, 4, '#fff');
            rect(ctx, 13, 9, 1, 2, '#fff');
            // Shadow on triangle
            px(ctx, 7, 14, '#ddd');
            px(ctx, 8, 13, '#ddd');
        });

        // ── Instagram — gradient rounded square with camera icon ──
        drawIcon('iconInstagram', ctx => {
            const R = 3;
            for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
                let inside = true;
                if (x < R && y < R) inside = Math.sqrt((x-R)**2 + (y-R)**2) <= R;
                else if (x > S-1-R && y < R) inside = Math.sqrt((x-(S-1-R))**2 + (y-R)**2) <= R;
                else if (x < R && y > S-1-R) inside = Math.sqrt((x-R)**2 + (y-(S-1-R))**2) <= R;
                else if (x > S-1-R && y > S-1-R) inside = Math.sqrt((x-(S-1-R))**2 + (y-(S-1-R))**2) <= R;
                if (!inside) continue;
                // Instagram gradient: purple bottom-left → orange top-right → yellow
                const tx = x / (S-1), ty = y / (S-1);
                const diag = tx * 0.6 + (1 - ty) * 0.4;
                let r, g, b;
                if (diag < 0.3) { r = 130 + diag*300; g = 50; b = 180 - diag*100; }
                else if (diag < 0.6) { r = 220; g = 50 + (diag-0.3)*400; b = 80 - (diag-0.3)*200; }
                else { r = 240; g = 170 + (diag-0.6)*200; b = 30; }
                ctx.fillStyle = `rgb(${Math.floor(Math.min(255,r))},${Math.floor(Math.min(255,g))},${Math.floor(Math.max(0,b))})`;
                ctx.fillRect(x, y, 1, 1);
            }
            // Camera body (rounded inner square — white outline)
            ctx.fillStyle = '#fff';
            // Top
            rect(ctx, 5, 4, 10, 1, '#fff');
            // Bottom
            rect(ctx, 5, 15, 10, 1, '#fff');
            // Left
            rect(ctx, 4, 5, 1, 10, '#fff');
            // Right
            rect(ctx, 15, 5, 1, 10, '#fff');
            // Corners
            px(ctx, 5, 5, '#fff'); px(ctx, 14, 5, '#fff');
            px(ctx, 5, 14, '#fff'); px(ctx, 14, 14, '#fff');
            // Lens circle (white ring)
            const cx = 10, cy = 10;
            for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist <= 3.5 && dist > 2.2) px(ctx, cx+dx, cy+dy, '#fff');
            }
            // Flash dot top-right
            px(ctx, 13, 6, '#fff');
            px(ctx, 14, 6, '#fff');
            px(ctx, 13, 7, '#fff');
        });
    }

    // ====== INIT ======
    function init() {
        initRandomFlashes();
        initExtraStars();
        initRiverReflections();
        initTwinklingStars();
        initEagle();
        initTumbleweed();
        initPlanes();
        initPigeon();
        initPigeon();
        initRat();
        initRat();
        initFerry();
        initHelicopter();
        initStatueFirework();
        initHoverHighlights();
        initAnimalHoverCursors();
        initStageLightning();
        initForegroundInstruments();
        initStageParty();
        initMusicIcons();
        initSocialIcons();
        initPubBar();
    }


    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
