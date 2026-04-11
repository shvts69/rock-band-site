/* ========================================
   PUNCH CLUB STYLE PIXEL ART SCENE RENDERER
   Each section gets a detailed canvas background
   ======================================== */

const PIXEL = 4; // base pixel size for scaling

// ====== UTILITY FUNCTIONS ======
function drawRect(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * PIXEL, y * PIXEL, w * PIXEL, h * PIXEL);
}

function drawPixel(ctx, x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * PIXEL, y * PIXEL, PIXEL, PIXEL);
}

// Draw a row of pixels from color array
function drawRow(ctx, startX, y, colors) {
    colors.forEach((color, i) => {
        if (color) drawPixel(ctx, startX + i, y, color);
    });
}

// ====== SECTION 1: HOME — American Highway ======
function drawHomeScene(canvas) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width / PIXEL;
    const H = canvas.height / PIXEL;

    // SKY — gradient
    for (let y = 0; y < H * 0.45; y++) {
        const t = y / (H * 0.45);
        const r = Math.floor(20 + t * 60);
        const g = Math.floor(10 + t * 80);
        const b = Math.floor(80 + t * 100);
        drawRect(ctx, 0, y, W, 1, `rgb(${r},${g},${b})`);
    }

    // Sunset band
    for (let y = Math.floor(H * 0.3); y < Math.floor(H * 0.5); y++) {
        const t = (y - H * 0.3) / (H * 0.2);
        const r = Math.floor(80 + t * 175);
        const g = Math.floor(30 + t * 80);
        const b = Math.floor(100 - t * 60);
        drawRect(ctx, 0, y, W, 1, `rgba(${r},${g},${b},${0.3 + t * 0.7})`);
    }

    // SUN
    const sunX = Math.floor(W * 0.5);
    const sunY = Math.floor(H * 0.32);
    for (let dy = -8; dy <= 8; dy++) {
        for (let dx = -8; dx <= 8; dx++) {
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= 8) {
                const bright = Math.floor(255 - dist * 8);
                drawPixel(ctx, sunX + dx, sunY + dy, `rgb(${bright},${Math.floor(bright * 0.7)},${Math.floor(bright * 0.2)})`);
            }
            if (dist > 8 && dist <= 14) {
                drawPixel(ctx, sunX + dx, sunY + dy, `rgba(255,${Math.floor(180 - dist * 5)},0,${0.3 - dist * 0.015})`);
            }
        }
    }

    // CLOUDS
    drawCloud(ctx, Math.floor(W * 0.15), Math.floor(H * 0.12), '#8b6090', '#6b4070');
    drawCloud(ctx, Math.floor(W * 0.6), Math.floor(H * 0.08), '#9b7090', '#7b5080');
    drawCloud(ctx, Math.floor(W * 0.85), Math.floor(H * 0.18), '#7b5080', '#5b3060');

    // DISTANT MOUNTAINS
    drawMountainRange(ctx, W, H, 0.48, '#3a1a4e', '#2a0a3e');
    drawMountainRange(ctx, W, H, 0.52, '#4a2a3e', '#3a1a2e');

    // DESERT GROUND
    for (let y = Math.floor(H * 0.55); y < H; y++) {
        const t = (y - H * 0.55) / (H * 0.45);
        const r = Math.floor(180 - t * 40);
        const g = Math.floor(140 - t * 50);
        const b = Math.floor(80 - t * 30);
        drawRect(ctx, 0, y, W, 1, `rgb(${r},${g},${b})`);
        // Desert texture
        for (let x = 0; x < W; x += 3) {
            if (Math.random() > 0.7) {
                drawPixel(ctx, x, y, `rgba(0,0,0,${0.05 + Math.random() * 0.1})`);
            }
        }
    }

    // CACTUS
    drawCactus(ctx, Math.floor(W * 0.12), Math.floor(H * 0.5), 1.2);
    drawCactus(ctx, Math.floor(W * 0.78), Math.floor(H * 0.48), 1.5);
    drawCactus(ctx, Math.floor(W * 0.92), Math.floor(H * 0.52), 0.8);
    drawCactus(ctx, Math.floor(W * 0.05), Math.floor(H * 0.55), 0.6);

    // ROUTE 66 SIGN
    drawRouteSign(ctx, Math.floor(W * 0.82), Math.floor(H * 0.35));

    // US FLAG on pole
    drawFlagPole(ctx, Math.floor(W * 0.2), Math.floor(H * 0.2));

    // TUMBLEWEED
    drawTumbleweed(ctx, Math.floor(W * 0.4), Math.floor(H * 0.65));
    drawTumbleweed(ctx, Math.floor(W * 0.7), Math.floor(H * 0.68));

    // POWER LINES
    drawPowerLines(ctx, W, H);

    // Small rocks/pebbles on ground
    for (let i = 0; i < 30; i++) {
        const rx = Math.floor(Math.random() * W);
        const ry = Math.floor(H * 0.6 + Math.random() * H * 0.3);
        drawPixel(ctx, rx, ry, `rgba(100,80,50,${0.3 + Math.random() * 0.4})`);
    }
}

function drawCloud(ctx, x, y, color1, color2) {
    drawRect(ctx, x, y, 12, 3, color1);
    drawRect(ctx, x - 2, y + 1, 16, 2, color1);
    drawRect(ctx, x + 2, y - 1, 8, 1, color2);
    drawRect(ctx, x + 1, y + 3, 10, 1, color2);
}

function drawMountainRange(ctx, W, H, baseY, color1, color2) {
    const base = Math.floor(H * baseY);
    // Multiple peaks
    const peaks = [
        { x: W * 0.1, h: 20 }, { x: W * 0.25, h: 30 },
        { x: W * 0.4, h: 22 }, { x: W * 0.55, h: 35 },
        { x: W * 0.7, h: 25 }, { x: W * 0.85, h: 28 }
    ];
    peaks.forEach(peak => {
        for (let row = 0; row < peak.h; row++) {
            const width = Math.floor((peak.h - row) * 1.5);
            const px = Math.floor(peak.x) - Math.floor(width / 2);
            drawRect(ctx, px, base - row, width, 1, row % 3 === 0 ? color2 : color1);
        }
    });
    // Fill below peaks
    drawRect(ctx, 0, base, W, Math.floor(H * 0.1), color1);
}

function drawCactus(ctx, x, y, scale) {
    const s = Math.floor;
    const h = s(18 * scale);
    const w = s(3 * scale);
    // Main trunk
    for (let i = 0; i < h; i++) {
        const shade = i < h / 2 ? '#2d6b1e' : '#1d5b0e';
        drawRect(ctx, x, y - i, w, 1, shade);
        // Highlight
        drawPixel(ctx, x + w - 1, y - i, '#3d8b2e');
    }
    // Left arm
    const armY = y - s(h * 0.6);
    drawRect(ctx, x - s(4 * scale), armY, s(4 * scale), w, '#2d6b1e');
    for (let i = 0; i < s(6 * scale); i++) {
        drawRect(ctx, x - s(4 * scale), armY - i, w, 1, '#2d6b1e');
    }
    // Right arm
    const armY2 = y - s(h * 0.4);
    drawRect(ctx, x + w, armY2, s(3 * scale), w, '#2d6b1e');
    for (let i = 0; i < s(5 * scale); i++) {
        drawRect(ctx, x + w + s(2 * scale), armY2 - i, w, 1, '#1d5b0e');
    }
}

function drawRouteSign(ctx, x, y) {
    // Post
    drawRect(ctx, x + 3, y, 2, 25, '#888');
    drawRect(ctx, x + 4, y, 1, 25, '#999');
    // Shield shape
    drawRect(ctx, x - 2, y - 12, 12, 14, '#fff');
    drawRect(ctx, x - 1, y - 11, 10, 12, '#fff');
    drawRect(ctx, x, y - 10, 8, 10, '#fff');
    // Border
    drawRect(ctx, x - 2, y - 12, 12, 1, '#000');
    drawRect(ctx, x - 2, y + 1, 12, 1, '#000');
    drawRect(ctx, x - 2, y - 12, 1, 14, '#000');
    drawRect(ctx, x + 9, y - 12, 1, 14, '#000');
    // "66" text
    drawRect(ctx, x + 1, y - 8, 3, 5, '#000');
    drawRect(ctx, x + 5, y - 8, 3, 5, '#000');
    // Red trim
    drawRect(ctx, x - 1, y - 11, 10, 1, '#cc0000');
    drawRect(ctx, x - 1, y, 10, 1, '#cc0000');
}

function drawFlagPole(ctx, x, y) {
    // Pole
    drawRect(ctx, x, y, 1, 35, '#aaa');
    drawRect(ctx, x + 1, y, 1, 35, '#888');
    // Ball on top
    drawPixel(ctx, x, y - 1, '#ddd');
    // Flag
    const flagW = 16;
    const flagH = 10;
    for (let fy = 0; fy < flagH; fy++) {
        for (let fx = 0; fx < flagW; fx++) {
            if (fx < 6 && fy < 5) {
                // Blue canton
                drawPixel(ctx, x + 2 + fx, y + fy, '#003388');
                if ((fx + fy) % 3 === 0) drawPixel(ctx, x + 2 + fx, y + fy, '#4466aa');
            } else {
                // Stripes
                const isRed = fy % 2 === 0;
                drawPixel(ctx, x + 2 + fx, y + fy, isRed ? '#cc0000' : '#ffffff');
            }
        }
    }
}

function drawTumbleweed(ctx, x, y) {
    const colors = ['#8b6914', '#7b5904', '#6b4904', '#9b7924'];
    for (let dy = -3; dy <= 3; dy++) {
        for (let dx = -3; dx <= 3; dx++) {
            if (Math.sqrt(dx * dx + dy * dy) <= 3 && Math.random() > 0.3) {
                drawPixel(ctx, x + dx, y + dy, colors[Math.floor(Math.random() * colors.length)]);
            }
        }
    }
}

function drawPowerLines(ctx, W, H) {
    const poleH = 30;
    const poles = [Math.floor(W * 0.3), Math.floor(W * 0.6)];
    const groundY = Math.floor(H * 0.55);
    poles.forEach(px => {
        drawRect(ctx, px, groundY - poleH, 2, poleH, '#5a4a3a');
        drawRect(ctx, px - 3, groundY - poleH, 8, 1, '#5a4a3a');
        drawRect(ctx, px - 1, groundY - poleH + 1, 4, 1, '#4a3a2a');
    });
    // Wires (catenary curve approximation)
    if (poles.length >= 2) {
        for (let x = poles[0]; x <= poles[1]; x++) {
            const t = (x - poles[0]) / (poles[1] - poles[0]);
            const sag = Math.floor(4 * Math.sin(t * Math.PI));
            drawPixel(ctx, x, groundY - poleH + sag, '#333');
        }
    }
}


// ====== SECTION 2: ABOUT — Brooklyn Street ======
function drawBrooklynScene(canvas) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width / PIXEL;
    const H = canvas.height / PIXEL;

    // NIGHT SKY
    for (let y = 0; y < H; y++) {
        const t = y / H;
        drawRect(ctx, 0, y, W, 1, `rgb(${Math.floor(10 + t * 15)},${Math.floor(8 + t * 12)},${Math.floor(30 + t * 20)})`);
    }

    // Stars
    for (let i = 0; i < 50; i++) {
        const sx = Math.floor(Math.random() * W);
        const sy = Math.floor(Math.random() * H * 0.3);
        drawPixel(ctx, sx, sy, Math.random() > 0.5 ? '#ffffff' : '#aaaacc');
    }

    // Moon
    const moonX = Math.floor(W * 0.85);
    const moonY = Math.floor(H * 0.1);
    for (let dy = -5; dy <= 5; dy++) {
        for (let dx = -5; dx <= 5; dx++) {
            if (Math.sqrt(dx * dx + dy * dy) <= 5) {
                drawPixel(ctx, moonX + dx, moonY + dy, '#eeeedd');
            }
            if (Math.sqrt(dx * dx + dy * dy) <= 4) {
                drawPixel(ctx, moonX + dx, moonY + dy, '#ffffee');
            }
        }
    }
    // Moon craters
    drawPixel(ctx, moonX - 2, moonY - 1, '#ccccbb');
    drawPixel(ctx, moonX + 1, moonY + 2, '#ccccbb');

    // BUILDINGS — multiple brownstones
    const buildings = [];
    const totalBuildings = Math.floor(W / 20);
    for (let i = 0; i < totalBuildings; i++) {
        buildings.push({
            x: i * 20,
            w: 18 + Math.floor(Math.random() * 4),
            h: 60 + Math.floor(Math.random() * 40),
            color: ['#4a2a1a', '#3a2a2a', '#5a3a2a', '#4a3020', '#3a2018'][Math.floor(Math.random() * 5)],
            trim: ['#6a4a3a', '#5a3a3a', '#7a5a4a'][Math.floor(Math.random() * 3)]
        });
    }

    const groundY = Math.floor(H * 0.82);

    // GRASS AREA — fill between buildings and bottom
    for (let y = groundY; y < H; y++) {
        const t = (y - groundY) / (H - groundY);
        for (let x = 0; x < W; x++) {
            const shade = Math.random() * 0.15;
            const r = Math.floor(30 + t * 10 - shade * 40);
            const g = Math.floor(80 + t * 15 - shade * 30 + Math.sin(x * 0.8) * 8);
            const b = Math.floor(20 + t * 5);
            drawPixel(ctx, x, y, `rgb(${Math.max(0,r)},${Math.max(0,g)},${Math.max(0,b)})`);
        }
    }
    // Grass blades
    for (let i = 0; i < 200; i++) {
        const gx = Math.floor(Math.random() * W);
        const gy = groundY + Math.floor(Math.random() * (H - groundY));
        const gh = 1 + Math.floor(Math.random() * 3);
        const gc = ['#2d7a1e', '#3d8a2e', '#1d6a0e', '#4d9a3e'][Math.floor(Math.random() * 4)];
        drawRect(ctx, gx, gy - gh, 1, gh, gc);
    }

    // BUILDINGS
    buildings.forEach(b => {
        const bTop = groundY - b.h;
        drawRect(ctx, b.x, bTop, b.w, b.h, b.color);
        drawRect(ctx, b.x, bTop, b.w, 2, b.trim);
        drawRect(ctx, b.x - 1, bTop - 1, b.w + 2, 1, b.trim);
        drawRect(ctx, b.x, bTop + 3, b.w, 1, b.trim);

        for (let wy = bTop + 6; wy < groundY - 10; wy += 8) {
            for (let wx = b.x + 3; wx < b.x + b.w - 3; wx += 5) {
                const lit = Math.random() > 0.3;
                if (lit) {
                    const warmth = Math.random();
                    drawRect(ctx, wx, wy, 3, 4, `rgb(${Math.floor(200 + warmth * 55)},${Math.floor(150 + warmth * 80)},${Math.floor(50 + warmth * 40)})`);
                    drawRect(ctx, wx - 1, wy - 1, 5, 1, '#2a1a0a');
                    drawRect(ctx, wx - 1, wy + 4, 5, 1, '#2a1a0a');
                    if (Math.random() > 0.6) drawRect(ctx, wx, wy, 1, 4, 'rgba(100,50,30,0.5)');
                } else {
                    drawRect(ctx, wx, wy, 3, 4, '#1a1020');
                    drawRect(ctx, wx - 1, wy - 1, 5, 1, '#2a1a0a');
                    drawRect(ctx, wx - 1, wy + 4, 5, 1, '#2a1a0a');
                }
            }
        }

        if (Math.random() > 0.5) {
            for (let fy = bTop + 10; fy < groundY - 15; fy += 12) {
                drawRect(ctx, b.x + b.w - 1, fy, 5, 1, '#555');
                drawRect(ctx, b.x + b.w + 3, fy, 1, 12, '#555');
                drawRect(ctx, b.x + b.w - 1, fy - 3, 1, 3, '#444');
                drawRect(ctx, b.x + b.w + 3, fy - 3, 1, 3, '#444');
            }
        }

        if (Math.random() > 0.4) {
            const doorX = b.x + Math.floor(b.w / 2) - 2;
            drawRect(ctx, doorX, groundY - 8, 4, 8, '#2a1a0a');
            drawRect(ctx, doorX, groundY - 9, 4, 1, b.trim);
            drawRect(ctx, doorX - 1, groundY - 2, 6, 2, '#666');
            drawPixel(ctx, doorX + 3, groundY - 4, '#aa8844');
        }
    });

    // TREES
    drawTree(ctx, Math.floor(W * 0.08), groundY);
    drawTree(ctx, Math.floor(W * 0.22), groundY);
    drawTree(ctx, Math.floor(W * 0.38), groundY);
    drawTree(ctx, Math.floor(W * 0.52), groundY);
    drawTree(ctx, Math.floor(W * 0.68), groundY);
    drawTree(ctx, Math.floor(W * 0.82), groundY);
    drawTree(ctx, Math.floor(W * 0.95), groundY);

    // HYDRANTS
    drawHydrant(ctx, Math.floor(W * 0.12), groundY);
    drawHydrant(ctx, Math.floor(W * 0.35), groundY);
    drawHydrant(ctx, Math.floor(W * 0.58), groundY);
    drawHydrant(ctx, Math.floor(W * 0.78), groundY);
    drawHydrant(ctx, Math.floor(W * 0.92), groundY);

    // Street lamps
    for (let lx = 15; lx < W; lx += 40) {
        drawRect(ctx, lx, groundY - 20, 1, 20, '#888');
        drawRect(ctx, lx - 2, groundY - 22, 5, 3, '#aa9944');
        for (let dy = -3; dy <= 5; dy++) {
            for (let dx = -4; dx <= 4; dx++) {
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 5) {
                    drawPixel(ctx, lx + dx, groundY - 22 + dy, `rgba(255,220,100,${0.15 - dist * 0.025})`);
                }
            }
        }
    }

    // GRAFFITI
    drawGraffiti(ctx, Math.floor(W * 0.15), groundY - 15);
    drawGraffiti(ctx, Math.floor(W * 0.55), groundY - 20);

    // Trash cans
    drawTrashCan(ctx, Math.floor(W * 0.25), groundY);
    drawTrashCan(ctx, Math.floor(W * 0.7), groundY);
}

function drawTree(ctx, x, groundY) {
    // Trunk
    drawRect(ctx, x, groundY - 15, 2, 15, '#4a3020');
    drawRect(ctx, x + 1, groundY - 15, 1, 15, '#5a4030');
    // Canopy layers
    const greens = ['#1d5a0e', '#2d6a1e', '#3d7a2e', '#2d5a1e'];
    for (let ly = 0; ly < 4; ly++) {
        const cw = 8 - ly;
        const cx = x - Math.floor(cw / 2) + 1;
        drawRect(ctx, cx, groundY - 18 - ly * 3, cw, 4, greens[ly % greens.length]);
        // Leaf texture
        for (let dx = 0; dx < cw; dx++) {
            if (Math.random() > 0.5) {
                drawPixel(ctx, cx + dx, groundY - 18 - ly * 3 + Math.floor(Math.random() * 3), greens[(ly + 1) % greens.length]);
            }
        }
    }
}

function drawGraffiti(ctx, x, y) {
    const colors = ['#ff4444', '#44ff44', '#ffff44', '#ff44ff'];
    const c = colors[Math.floor(Math.random() * colors.length)];
    // Simple pixel text-like graffiti
    for (let i = 0; i < 8; i++) {
        drawPixel(ctx, x + i, y + Math.floor(Math.sin(i) * 2), c);
        if (Math.random() > 0.5) drawPixel(ctx, x + i, y + 1 + Math.floor(Math.cos(i) * 2), c);
    }
}

function drawTrashCan(ctx, x, y) {
    drawRect(ctx, x, y - 5, 3, 5, '#555');
    drawRect(ctx, x - 1, y - 6, 5, 1, '#666');
    drawRect(ctx, x, y - 5, 3, 1, '#666');
    drawPixel(ctx, x + 1, y - 3, '#444');
}

function drawHydrant(ctx, x, y) {
    drawRect(ctx, x, y - 5, 3, 5, '#cc2200');
    drawRect(ctx, x - 1, y - 3, 5, 1, '#dd3300');
    drawRect(ctx, x, y - 6, 3, 1, '#cc2200');
    drawPixel(ctx, x + 1, y - 7, '#dd3300');
}


// ====== SECTION 3: LIVE — Verrazano Bridge Night ======
function drawLiveScene(canvas) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width / PIXEL;
    const H = canvas.height / PIXEL;

    // DEEP NIGHT SKY
    for (let y = 0; y < H * 0.6; y++) {
        const t = y / (H * 0.6);
        drawRect(ctx, 0, y, W, 1, `rgb(${Math.floor(5 + t * 10)},${Math.floor(5 + t * 8)},${Math.floor(20 + t * 30)})`);
    }

    // STARS — twinkling mapped
    for (let i = 0; i < 80; i++) {
        const sx = Math.floor(Math.random() * W);
        const sy = Math.floor(Math.random() * H * 0.45);
        const brightness = Math.floor(150 + Math.random() * 105);
        const size = Math.random() > 0.85 ? 2 : 1;
        drawRect(ctx, sx, sy, size, size, `rgb(${brightness},${brightness},${Math.floor(brightness * 1.1)})`);
    }

    // Big stars with cross pattern
    const bigStars = [
        { x: W * 0.1, y: H * 0.05 }, { x: W * 0.35, y: H * 0.12 },
        { x: W * 0.6, y: H * 0.03 }, { x: W * 0.8, y: H * 0.15 },
        { x: W * 0.95, y: H * 0.08 }
    ];
    bigStars.forEach(s => {
        const bx = Math.floor(s.x);
        const by = Math.floor(s.y);
        drawPixel(ctx, bx, by, '#ffffff');
        drawPixel(ctx, bx - 1, by, 'rgba(255,255,255,0.5)');
        drawPixel(ctx, bx + 1, by, 'rgba(255,255,255,0.5)');
        drawPixel(ctx, bx, by - 1, 'rgba(255,255,255,0.5)');
        drawPixel(ctx, bx, by + 1, 'rgba(255,255,255,0.5)');
    });

    // CITY SKYLINE in background
    const skylineY = Math.floor(H * 0.4);
    for (let x = 0; x < W; x++) {
        const bh = 5 + Math.floor(Math.random() * 20);
        if (x % 3 === 0) {
            drawRect(ctx, x, skylineY - bh, 2, bh, '#0a0a15');
            // Tiny windows
            for (let wy = skylineY - bh + 2; wy < skylineY; wy += 3) {
                if (Math.random() > 0.5) {
                    drawPixel(ctx, x, wy, `rgba(255,200,100,${0.2 + Math.random() * 0.3})`);
                }
            }
        }
    }

    // WATER
    const waterY = Math.floor(H * 0.6);
    for (let y = waterY; y < H; y++) {
        const t = (y - waterY) / (H - waterY);
        for (let x = 0; x < W; x++) {
            const wave = Math.sin(x * 0.3 + y * 0.5) * 0.15;
            const r = Math.floor(5 + t * 10);
            const g = Math.floor(15 + t * 15 + wave * 20);
            const b = Math.floor(40 + t * 20 + wave * 30);
            drawPixel(ctx, x, y, `rgb(${r},${g},${b})`);
        }
    }

    // Water reflections
    for (let i = 0; i < 40; i++) {
        const rx = Math.floor(Math.random() * W);
        const ry = waterY + Math.floor(Math.random() * (H - waterY));
        const rw = 2 + Math.floor(Math.random() * 4);
        drawRect(ctx, rx, ry, rw, 1, `rgba(100,150,200,${0.1 + Math.random() * 0.15})`);
    }

    // STATUE OF LIBERTY (far background, left side)
    const statueX = Math.floor(W * 0.12);
    const statueBase = waterY - 2;
    // Pedestal
    drawRect(ctx, statueX - 3, statueBase - 8, 8, 8, '#4a5a4a');
    drawRect(ctx, statueX - 4, statueBase - 9, 10, 1, '#5a6a5a');
    drawRect(ctx, statueX - 2, statueBase, 6, 2, '#3a4a3a');
    // Body
    drawRect(ctx, statueX - 1, statueBase - 22, 4, 14, '#5a8a6a');
    drawRect(ctx, statueX, statueBase - 22, 2, 14, '#6a9a7a');
    // Head
    drawRect(ctx, statueX - 1, statueBase - 26, 4, 4, '#5a8a6a');
    // Crown
    drawPixel(ctx, statueX - 2, statueBase - 27, '#6a9a7a');
    drawPixel(ctx, statueX - 1, statueBase - 28, '#6a9a7a');
    drawPixel(ctx, statueX, statueBase - 28, '#7aaa8a');
    drawPixel(ctx, statueX + 1, statueBase - 28, '#6a9a7a');
    drawPixel(ctx, statueX + 2, statueBase - 27, '#6a9a7a');
    // Torch arm (raised right)
    drawRect(ctx, statueX + 2, statueBase - 32, 1, 10, '#5a8a6a');
    drawPixel(ctx, statueX + 2, statueBase - 33, '#ffaa00');
    drawPixel(ctx, statueX + 1, statueBase - 34, '#ffcc44');
    drawPixel(ctx, statueX + 2, statueBase - 34, '#ffdd66');
    drawPixel(ctx, statueX + 3, statueBase - 34, '#ffcc44');
    drawPixel(ctx, statueX + 2, statueBase - 35, '#ffcc44');
    // Torch glow
    for (let dy = -3; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
            const d = Math.sqrt(dx*dx+dy*dy);
            if (d < 3) drawPixel(ctx, statueX + 2 + dx, statueBase - 34 + dy, `rgba(255,200,50,${0.08 - d*0.02})`);
        }
    }
    // Statue reflection in water
    for (let ry = 0; ry < 10; ry++) {
        drawPixel(ctx, statueX, waterY + 2 + ry, `rgba(90,140,106,${0.12 - ry * 0.01})`);
    }

    // NY FERRY (under bridge area)
    const ferryX = Math.floor(W * 0.55);
    const ferryY = waterY + 3;
    // Hull
    drawRect(ctx, ferryX, ferryY, 18, 4, '#dd6600');
    drawRect(ctx, ferryX + 1, ferryY + 4, 16, 2, '#cc5500');
    // White top deck
    drawRect(ctx, ferryX + 2, ferryY - 4, 14, 4, '#eeeedd');
    drawRect(ctx, ferryX + 3, ferryY - 3, 12, 3, '#ffffff');
    // Windows
    for (let wx = ferryX + 4; wx < ferryX + 14; wx += 3) {
        drawPixel(ctx, wx, ferryY - 2, '#88ccff');
    }
    // Smokestack
    drawRect(ctx, ferryX + 8, ferryY - 7, 2, 3, '#dd6600');
    drawPixel(ctx, ferryX + 8, ferryY - 8, '#888');
    drawPixel(ctx, ferryX + 9, ferryY - 8, '#777');
    // Wake
    for (let wi = 0; wi < 8; wi++) {
        drawPixel(ctx, ferryX - 2 - wi * 2, ferryY + 3 + Math.floor(Math.sin(wi) * 1), `rgba(150,180,220,${0.2 - wi * 0.02})`);
    }
    // Ferry reflection
    for (let ry = 0; ry < 4; ry++) {
        drawRect(ctx, ferryX + 2, ferryY + 6 + ry, 14, 1, `rgba(200,100,0,${0.08 - ry * 0.015})`);
    }

    // VERRAZANO BRIDGE — spans full width (edge to edge, wall to wall)
    const bridgeY = Math.floor(H * 0.45);
    const towerL = Math.floor(W * 0.3);
    const towerR = Math.floor(W * 0.7);
    const towerH = 40;

    // Bridge deck — full width
    drawRect(ctx, 0, bridgeY + 10, W, 4, '#4a4a5a');
    drawRect(ctx, 0, bridgeY + 10, W, 1, '#5a5a6a');
    // Deck lights
    for (let x = 0; x < W; x += 6) {
        drawPixel(ctx, x, bridgeY + 9, '#ffcc44');
        drawPixel(ctx, x, bridgeY + 14, '#ffcc44');
        // Light reflections in water
        for (let ry = 0; ry < 8; ry++) {
            drawPixel(ctx, x + Math.floor(Math.random() * 3) - 1, bridgeY + 20 + ry * 3, `rgba(255,200,60,${0.1 - ry * 0.01})`);
        }
    }

    // Towers
    [towerL, towerR].forEach(tx => {
        drawRect(ctx, tx - 3, bridgeY - towerH, 6, towerH + 14, '#5a5a6a');
        drawRect(ctx, tx - 4, bridgeY - towerH, 8, 2, '#6a6a7a');
        drawRect(ctx, tx - 2, bridgeY - towerH - 3, 4, 3, '#6a6a7a');
        drawRect(ctx, tx - 2, bridgeY - towerH + 5, 1, towerH - 10, '#4a4a5a');
        drawRect(ctx, tx + 1, bridgeY - towerH + 5, 1, towerH - 10, '#6a6a7a');
        drawPixel(ctx, tx, bridgeY - towerH - 3, '#ff0000');
        for (let d = 1; d <= 3; d++) {
            drawPixel(ctx, tx - d, bridgeY - towerH - 3, `rgba(255,0,0,${0.3 / d})`);
            drawPixel(ctx, tx + d, bridgeY - towerH - 3, `rgba(255,0,0,${0.3 / d})`);
        }
    });

    // Cables between towers
    for (let x = towerL; x <= towerR; x++) {
        const t = (x - towerL) / (towerR - towerL);
        const cableY = bridgeY - towerH + Math.floor(towerH * 0.8 * Math.pow(2 * t - 1, 2));
        drawPixel(ctx, x, cableY, '#888');
        if (x % 4 === 0) {
            for (let sy = cableY; sy < bridgeY + 10; sy++) {
                drawPixel(ctx, x, sy, 'rgba(100,100,120,0.4)');
            }
        }
    }
    // Outer cables — left edge to tower
    for (let x = 0; x < towerL; x++) {
        const t = x / towerL;
        const cableY = bridgeY + 10 - Math.floor(t * towerH * 0.6);
        drawPixel(ctx, x, cableY, '#777');
    }
    // Outer cables — tower to right edge
    for (let x = towerR; x < W; x++) {
        const t = (x - towerR) / (W - towerR);
        const cableY = bridgeY - towerH * 0.6 + Math.floor(t * (towerH * 0.6 + 10));
        drawPixel(ctx, x, cableY, '#777');
    }
}


// ====== SECTION 4: STAGE ======
function drawStageScene(canvas) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width / PIXEL;
    const H = canvas.height / PIXEL;

    // Dark venue background
    for (let y = 0; y < H; y++) {
        const t = y / H;
        drawRect(ctx, 0, y, W, 1, `rgb(${Math.floor(5 + t * 8)},${Math.floor(3 + t * 5)},${Math.floor(8 + t * 12)})`);
    }

    // Ceiling rigging/truss
    for (let x = 0; x < W; x += 2) {
        drawRect(ctx, x, 3, 1, 2, '#333');
    }
    drawRect(ctx, 0, 5, W, 1, '#2a2a2a');

    // SPOTLIGHTS from ceiling
    const spotColors = [
        { r: 255, g: 50, b: 50 },
        { r: 255, g: 200, b: 50 },
        { r: 50, g: 100, b: 255 },
        { r: 255, g: 50, b: 200 }
    ];
    const spotPositions = [W * 0.2, W * 0.4, W * 0.6, W * 0.8];

    spotPositions.forEach((sx, idx) => {
        const color = spotColors[idx];
        const spotX = Math.floor(sx);
        // Light source
        drawRect(ctx, spotX - 1, 5, 3, 2, '#ddd');
        // Beam (cone shape)
        for (let y = 7; y < H * 0.65; y++) {
            const t = (y - 7) / (H * 0.65 - 7);
            const beamWidth = Math.floor(2 + t * 15);
            for (let dx = -beamWidth; dx <= beamWidth; dx++) {
                const dist = Math.abs(dx) / beamWidth;
                const alpha = (1 - dist) * (1 - t) * 0.08;
                drawPixel(ctx, spotX + dx, y, `rgba(${color.r},${color.g},${color.b},${alpha})`);
            }
        }
    });

    // STAGE PLATFORM — aligned with the fixed road (bottom: 60px + 50px height)
    // Road surface (top of road) = 110px from bottom ≈ 85% from top
    const stageY = Math.floor(H * 0.84);
    const stageLeft = Math.floor(W * 0.08);
    const stageRight = Math.floor(W * 0.92);
    const stageW = stageRight - stageLeft;

    // Stage edge highlight (no dark floor — road connects directly)
    drawRect(ctx, stageLeft, stageY, stageW, 2, '#555');
    // Stage front lights
    for (let x = stageLeft + 5; x < stageRight - 5; x += 8) {
        drawRect(ctx, x, stageY, 2, 1, '#ffcc00');
    }

    // SPEAKERS (left & right)
    [stageLeft + 2, stageRight - 12].forEach(spX => {
        // Speaker stack
        for (let sy = 0; sy < 3; sy++) {
            const spY = stageY - 10 + sy * 8;
            drawRect(ctx, spX, spY, 10, 7, '#1a1a1a');
            drawRect(ctx, spX, spY, 10, 1, '#333');
            // Cones
            drawRect(ctx, spX + 2, spY + 2, 6, 4, '#222');
            drawRect(ctx, spX + 3, spY + 3, 4, 2, '#2a2a2a');
            drawPixel(ctx, spX + 4, spY + 3, '#333');
        }
    });

    // DRUM KIT (center back)
    const drumX = Math.floor(W * 0.45);
    const drumY = stageY - 4;
    // Bass drum
    drawRect(ctx, drumX, drumY - 8, 10, 8, '#8b0000');
    drawRect(ctx, drumX + 1, drumY - 7, 8, 6, '#660000');
    drawRect(ctx, drumX + 3, drumY - 6, 4, 4, '#440000');
    // Cymbals
    drawRect(ctx, drumX - 4, drumY - 12, 6, 1, '#ccaa00');
    drawRect(ctx, drumX + 10, drumY - 14, 6, 1, '#ccaa00');
    // Hi-hat
    drawRect(ctx, drumX - 6, drumY - 10, 4, 1, '#aa8800');
    // Stands
    drawRect(ctx, drumX - 3, drumY - 11, 1, 8, '#666');
    drawRect(ctx, drumX + 12, drumY - 13, 1, 10, '#666');
    drawRect(ctx, drumX - 5, drumY - 9, 1, 6, '#666');

    // MICROPHONE STANDS
    [W * 0.3, W * 0.5, W * 0.7].forEach(mx => {
        const mxx = Math.floor(mx);
        drawRect(ctx, mxx, stageY - 16, 1, 14, '#888');
        drawRect(ctx, mxx - 1, stageY - 2, 3, 1, '#666');
        // Mic head
        drawRect(ctx, mxx - 1, stageY - 18, 3, 2, '#444');
    });

    // STAGE LOGO (glowing)
    const logoText = "ROAD REBELS";
    const logoX = Math.floor(W * 0.5) - 20;
    const logoY = stageY - 30;
    drawRect(ctx, logoX - 2, logoY - 2, 44, 10, 'rgba(0,0,0,0.5)');
    // Glow behind
    for (let dy = -4; dy <= 10; dy++) {
        for (let dx = -4; dx <= 48; dx++) {
            const dist = Math.min(
                Math.abs(dy - 3),
                Math.abs(dx - 22)
            ) * 0.3;
            if (dist < 4) {
                drawPixel(ctx, logoX + dx - 2, logoY + dy - 2, `rgba(255,0,0,${0.05 - dist * 0.01})`);
            }
        }
    }

    // CROWD
    const crowdY = stageY + 22;
    // Multiple rows of crowd silhouettes
    for (let row = 0; row < 4; row++) {
        const rowY = crowdY + row * 6;
        const shade = Math.floor(15 + row * 8);
        for (let x = 0; x < W; x += 3) {
            const headH = 3 + Math.floor(Math.random() * 3);
            // Head
            drawRect(ctx, x, rowY - headH, 2, headH, `rgb(${shade},${shade},${shade + 5})`);
            // Body
            drawRect(ctx, x - 1, rowY, 3, 4 + row, `rgb(${shade - 5},${shade - 5},${shade})`);
            // Raised hands (some)
            if (Math.random() > 0.7) {
                drawRect(ctx, x + (Math.random() > 0.5 ? -1 : 2), rowY - headH - 3, 1, 3, `rgb(${shade},${shade},${shade})`);
            }
        }
    }

    // Camera flashes in crowd
    for (let i = 0; i < 5; i++) {
        const fx = Math.floor(Math.random() * W);
        const fy = crowdY + Math.floor(Math.random() * 20);
        drawPixel(ctx, fx, fy, '#fff');
        drawPixel(ctx, fx - 1, fy, 'rgba(255,255,255,0.5)');
        drawPixel(ctx, fx + 1, fy, 'rgba(255,255,255,0.5)');
    }

    // MONITOR WEDGES on stage front
    for (let mx = stageLeft + 15; mx < stageRight - 15; mx += 25) {
        drawRect(ctx, mx, stageY + 10, 8, 4, '#2a2a2a');
        drawRect(ctx, mx, stageY + 10, 8, 1, '#444');
        drawRect(ctx, mx + 1, stageY + 11, 6, 2, '#333');
    }
}


// ====== INITIALIZATION ======
function initScenes() {
    const sections = [
        { selector: '.section-home .home-bg', draw: drawHomeScene },
        { selector: '.section-about .about-bg', draw: drawBrooklynScene },
        { selector: '.section-live .live-bg', draw: drawLiveScene },
        { selector: '.section-stage .stage-bg', draw: drawStageScene }
    ];

    sections.forEach(({ selector, draw }) => {
        const container = document.querySelector(selector);
        if (!container) return;

        const canvas = document.createElement('canvas');
        canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;image-rendering:pixelated;z-index:0;';

        // Set canvas size based on container
        const rect = container.getBoundingClientRect();
        canvas.width = Math.floor(rect.width);
        canvas.height = Math.floor(rect.height);

        container.insertBefore(canvas, container.firstChild);
        draw(canvas);
    });
}

// Run after DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScenes);
} else {
    initScenes();
}

// Redraw on resize
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        document.querySelectorAll('.home-bg canvas, .about-bg canvas, .live-bg canvas, .stage-bg canvas').forEach(c => c.remove());
        initScenes();
    }, 300);
});
