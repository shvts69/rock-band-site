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

// Draw outlined rectangle (fill + thin 2-real-pixel black border)
function drawOutlinedRect(ctx, x, y, w, h, fillColor) {
    drawRect(ctx, x, y, w, h, fillColor);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(x * PIXEL + 1, y * PIXEL + 1, w * PIXEL - 2, h * PIXEL - 2);
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

    // SKY — per-row smooth gradient
    for (let y = 0; y < Math.floor(H * 0.58); y++) {
        const t = y / (H * 0.58);
        const r = Math.floor(8 + t * t * 230);
        const g = Math.floor(6 + t * 50 + t * t * 60);
        const b = Math.floor(40 + t * 40 - t * t * 30);
        drawRect(ctx, 0, y, W, 1, `rgb(${Math.min(255,r)},${Math.min(255,g)},${Math.min(255,b)})`);
    }

    // SUN — left of center mountain
    const sunX = Math.floor(W * 0.3);
    const sunY = Math.floor(H * 0.28);
    // Outer glow ring
    for (let dy = -12; dy <= 12; dy++) {
        for (let dx = -12; dx <= 12; dx++) {
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= 12 && dist > 9) {
                drawPixel(ctx, sunX + dx, sunY + dy, '#cc6622');
            }
        }
    }
    // Mid ring
    for (let dy = -9; dy <= 9; dy++) {
        for (let dx = -9; dx <= 9; dx++) {
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= 9 && dist > 7) {
                drawPixel(ctx, sunX + dx, sunY + dy, '#ee8833');
            }
        }
    }
    // Black outline (BEFORE body so body draws on top)
    for (let dy = -7; dy <= 7; dy++) {
        for (let dx = -7; dx <= 7; dx++) {
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= 7 && dist > 5.5) {
                drawPixel(ctx, sunX + dx, sunY + dy, '#000');
            }
        }
    }
    // Sun body (on top of outline)
    for (let dy = -6; dy <= 6; dy++) {
        for (let dx = -6; dx <= 6; dx++) {
            if (Math.sqrt(dx * dx + dy * dy) <= 5.5) {
                drawPixel(ctx, sunX + dx, sunY + dy, '#ffcc44');
            }
        }
    }
    // Bright center
    for (let dy = -3; dy <= 3; dy++) {
        for (let dx = -3; dx <= 3; dx++) {
            if (Math.sqrt(dx * dx + dy * dy) <= 3) {
                drawPixel(ctx, sunX + dx, sunY + dy, '#ffee88');
            }
        }
    }

    // CLOUDS
    drawCloud(ctx, Math.floor(W * 0.15), Math.floor(H * 0.12), '#8b6090', '#6b4070');
    drawCloud(ctx, Math.floor(W * 0.6), Math.floor(H * 0.08), '#9b7090', '#7b5080');
    drawCloud(ctx, Math.floor(W * 0.85), Math.floor(H * 0.18), '#7b5080', '#5b3060');

    // DISTANT MOUNTAINS — 3 layers, back to front
    drawMountainRange(ctx, W, H, 0.45, '#2a1038', '#1a0828', 0.7);
    drawMountainRange(ctx, W, H, 0.48, '#3a1a4e', '#2a0a3e', 1.0);
    drawMountainRange(ctx, W, H, 0.52, '#4a2a3e', '#3a1a2e', 1.3);

    // DESERT GROUND — smooth gradient with texture
    const desertRoadY = Math.floor(H * 0.87);
    const desertTop = Math.floor(H * 0.55);
    const desertH = desertRoadY - desertTop;
    for (let y = desertTop; y < desertRoadY; y++) {
        const t = (y - desertTop) / desertH;
        const r = Math.floor(220 - t * 90);
        const g = Math.floor(185 - t * 100);
        const b = Math.floor(110 - t * 70);
        drawRect(ctx, 0, y, W, 1, `rgb(${r},${g},${b})`);
    }
    // Sand texture
    for (let i = 0; i < 60; i++) {
        const rx = Math.floor(Math.random() * W);
        const ry = desertTop + 3 + Math.floor(Math.random() * (desertH - 5));
        const rw = 1 + Math.floor(Math.random() * 2);
        drawRect(ctx, rx, ry, rw, 1, '#8a7030');
    }
    // Dead brush
    for (let i = 0; i < 12; i++) {
        const bx = Math.floor(Math.random() * W);
        const by = desertTop + 5 + Math.floor(Math.random() * (desertH - 8));
        drawPixel(ctx, bx, by, '#6b5a30');
        drawPixel(ctx, bx, by - 1, '#7b6a40');
    }

    // GRAND CANYON CROSS-SECTION (below road)
    const cutTop = desertRoadY + 2;
    const cutH = H - cutTop;
    // Layer colors — Grand Canyon style (top to bottom)
    const canyonLayers = [
        { h: 0.08, r: 180, g: 120, b: 70 },   // sandy topsoil
        { h: 0.15, r: 160, g: 80, b: 50 },     // red sandstone
        { h: 0.12, r: 200, g: 130, b: 80 },    // orange limestone
        { h: 0.18, r: 140, g: 55, b: 35 },      // deep red shale
        { h: 0.12, r: 180, g: 160, b: 130 },   // tan layer
        { h: 0.15, r: 120, g: 45, b: 30 },      // dark red
        { h: 0.20, r: 80, g: 60, b: 50 },       // dark brown granite
    ];
    let layerY = cutTop;
    canyonLayers.forEach((layer, li) => {
        const lh = Math.floor(cutH * layer.h);
        for (let y = layerY; y < layerY + lh && y < H; y++) {
            const wobble = Math.sin(y * 0.3 + li) * 3 + Math.cos(y * 0.15) * 2;
            const localT = (y - layerY) / lh;
            const darken = Math.floor(localT * 8);
            drawRect(ctx, 0, y, W, 1, `rgb(${Math.max(0, layer.r + Math.floor(wobble) - darken)},${Math.max(0, layer.g + Math.floor(wobble * 0.8) - darken)},${Math.max(0, layer.b - darken)})`);
            // Rock texture
            for (let x = 0; x < W; x += 2) {
                if (Math.random() > 0.7) {
                    const v = Math.floor(Math.random() * 20) - 10;
                    drawPixel(ctx, x, y, `rgb(${Math.max(0, Math.min(255, layer.r + v))},${Math.max(0, Math.min(255, layer.g + v))},${Math.max(0, Math.min(255, layer.b + v))})`);
                }
            }
            // Layer borders
            if (y === layerY || y === layerY + 1) {
                drawRect(ctx, 0, y, W, 1, `rgba(0,0,0,0.2)`);
            }
        }
        layerY += lh;
    });
    // Vertical cracks through all layers
    const crackPositions = [W * 0.15, W * 0.35, W * 0.55, W * 0.72, W * 0.88];
    crackPositions.forEach(cx => {
        const crackX = Math.floor(cx);
        let drift = 0;
        for (let y = cutTop; y < H; y++) {
            drift += Math.sin(y * 0.4) * 0.3;
            const px = crackX + Math.floor(drift);
            drawPixel(ctx, px, y, 'rgba(0,0,0,0.18)');
            drawPixel(ctx, px + 1, y, 'rgba(0,0,0,0.08)');
            // Branch cracks
            if (y % 8 === 0) {
                for (let bx = 0; bx < 4; bx++) {
                    drawPixel(ctx, px + bx + 1, y, 'rgba(0,0,0,0.1)');
                }
            }
        }
    });

    // CACTUS — on desert sand
    drawCactus(ctx, Math.floor(W * 0.16), Math.floor(H * 0.62), 1.2);
    drawCactus(ctx, Math.floor(W * 0.78), Math.floor(H * 0.60), 0.9);
    drawCactus(ctx, Math.floor(W * 0.92), Math.floor(H * 0.65), 1.5);
    drawCactus(ctx, Math.floor(W * 0.05), Math.floor(H * 0.68), 1.8);

    // ROUTE 66 SIGN — on road level, rusted and sun-bleached
    drawRouteSign(ctx, Math.floor(W * 0.82), Math.floor(H * 0.87));

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
    // Parse color1 for shading
    const m = color1.replace('#','');
    const cr = parseInt(m.substring(0,2),16);
    const cg = parseInt(m.substring(2,4),16);
    const cb = parseInt(m.substring(4,6),16);

    // Many overlapping round blobs — lumpy natural shape
    const blobs = [
        // Bottom layer (wide, flat)
        { cx: 5, cy: 2, rx: 5, ry: 2 },
        { cx: 11, cy: 2, rx: 6, ry: 2 },
        { cx: 18, cy: 2, rx: 5, ry: 2 },
        // Middle layer
        { cx: 3, cy: 0, rx: 4, ry: 3 },
        { cx: 9, cy: 0, rx: 5, ry: 3 },
        { cx: 15, cy: 0, rx: 5, ry: 3 },
        { cx: 21, cy: 0, rx: 3, ry: 2 },
        // Top bumps (different heights = natural)
        { cx: 5, cy: -3, rx: 3, ry: 2 },
        { cx: 10, cy: -4, rx: 4, ry: 3 },
        { cx: 16, cy: -3, rx: 3, ry: 2 },
        { cx: 13, cy: -2, rx: 3, ry: 2 },
        { cx: 7, cy: -2, rx: 3, ry: 2 },
    ];

    // Draw all blobs with shading based on height
    blobs.forEach(blob => {
        for (let dy = -blob.ry; dy <= blob.ry; dy++) {
            for (let dx = -blob.rx; dx <= blob.rx; dx++) {
                const dist = (dx * dx) / (blob.rx * blob.rx) + (dy * dy) / (blob.ry * blob.ry);
                if (dist <= 1) {
                    // Shade: lighter on top, darker on bottom
                    const shade = (dy / blob.ry); // -1 top, +1 bottom
                    const light = Math.floor(-shade * 15);
                    const r = Math.min(255, Math.max(0, cr + light));
                    const g = Math.min(255, Math.max(0, cg + light));
                    const b = Math.min(255, Math.max(0, cb + light));
                    drawPixel(ctx, x + blob.cx + dx, y + blob.cy + dy, `rgb(${r},${g},${b})`);
                }
            }
        }
    });

    // Bright highlights on top edges of bumps
    [blobs[7], blobs[8], blobs[9]].forEach(blob => {
        for (let dx = -blob.rx + 1; dx < blob.rx; dx++) {
            const r = Math.min(255, cr + 35);
            const g = Math.min(255, cg + 35);
            const b = Math.min(255, cb + 35);
            drawPixel(ctx, x + blob.cx + dx, y + blob.cy - blob.ry, `rgb(${r},${g},${b})`);
        }
    });

    // Soft shadow at very bottom
    for (let dx = 2; dx < 20; dx++) {
        drawPixel(ctx, x + dx, y + 4, `rgba(0,0,0,0.08)`);
    }
}

function drawMountainRange(ctx, W, H, baseY, color1, color2, scale) {
    const base = Math.floor(H * baseY);
    const s = scale || 1;
    const c1 = color1.replace('#','');
    const r1 = parseInt(c1.substring(0,2),16);
    const g1 = parseInt(c1.substring(2,4),16);
    const b1 = parseInt(c1.substring(4,6),16);

    // 4-color palette: highlight, mid, base, shadow
    const pal = {
        hi:   `rgb(${Math.min(255,r1+35)},${Math.min(255,g1+30)},${Math.min(255,b1+25)})`,
        mid:  color1,
        base: color2,
        dark: `rgb(${Math.max(0,r1-20)},${Math.max(0,g1-18)},${Math.max(0,b1-15)})`
    };

    const seed = baseY * 1000;
    const skyline = [];

    for (let x = 0; x < W; x++) {
        let h = 6 * s;
        h += Math.sin(x * 0.02 * s + seed) * 14 * s;
        h += Math.sin(x * 0.05 * s + seed * 2.1) * 9 * s;
        h += Math.sin(x * 0.09 * s + seed * 3.3) * 5 * s;
        h += Math.max(0, Math.sin(x * 0.04 * s + seed * 0.8) * 18 * s - 8 * s);
        h += Math.max(0, Math.cos(x * 0.07 * s + seed * 2.9) * 14 * s - 6 * s);
        h += Math.sin(x * 0.3 + seed) * 2 * s;
        skyline[x] = Math.max(2, Math.floor(h));
    }
    const maxH = Math.max(...skyline);

    // Draw — Punch Club style: flat zones with hard edges
    for (let x = 0; x < W; x++) {
        const h = skyline[x];
        // Determine which side of peak we're on (for lighting)
        const hL = x > 0 ? skyline[x-1] : h;
        const hR = x < W-1 ? skyline[x+1] : h;
        const onLeftSlope = h > hL; // facing left (lit by sunset)
        const onRightSlope = h > hR;
        const isPeak = h >= hL && h >= hR;

        for (let row = 0; row < h; row++) {
            const py = base - h + row;
            const t = row / h; // 0 = top, 1 = bottom

            // Pick color from palette based on zone
            let c;
            if (t < 0.15) {
                // Top ridge — highlight
                c = pal.hi;
            } else if (t < 0.45) {
                // Upper body — lit or mid depending on slope
                c = onLeftSlope ? pal.hi : pal.mid;
            } else if (t < 0.7) {
                // Middle — base color
                c = pal.mid;
            } else {
                // Lower — shadow
                c = onRightSlope ? pal.dark : pal.base;
            }

            drawPixel(ctx, x, py, c);
        }

        // Black outline on top edge
        drawPixel(ctx, x, base - h, '#000');

        // Snow — hard white block on tallest peaks
        if (h > maxH * 0.8) {
            const snowH = Math.floor((h - maxH * 0.8) * 0.4) + 1;
            for (let sy = 1; sy <= snowH && sy < h; sy++) {
                drawPixel(ctx, x, base - h + sy, '#ccbbaa');
            }
        }
    }

    // Hard shadow on right side of peaks — draw dark column next to drops
    for (let x = 1; x < W; x++) {
        const drop = skyline[x-1] - skyline[x];
        if (drop > 3) {
            const shadowH = Math.min(drop, skyline[x]);
            for (let sy = 0; sy < shadowH; sy++) {
                drawPixel(ctx, x, base - skyline[x] + sy, pal.dark);
            }
        }
    }

    // Fill below
    drawRect(ctx, 0, base, W, Math.floor(H * 0.1), pal.base);
}

function drawCactus(ctx, x, y, scale) {
    const s = Math.floor;
    const h = s(18 * scale);
    const w = s(3 * scale);
    const dark = '#1a5a0c';
    const mid = '#2d6b1e';
    const light = '#3d8b2e';
    const highlight = '#4d9a3e';

    // Ground shadow
    drawRect(ctx, x - 1, y, s(h * 0.5), 1, 'rgba(0,0,0,0.15)');
    drawRect(ctx, x, y + 1, s(h * 0.3), 1, 'rgba(0,0,0,0.08)');

    // Main trunk
    drawOutlinedRect(ctx, x, y - h, w, h, mid);
    // Light side (right)
    for (let i = 0; i < h; i++) {
        drawPixel(ctx, x + w - 2, y - i, light);
        if (w > 3) drawPixel(ctx, x + w - 3, y - i, i % 3 === 0 ? light : mid);
    }
    // Dark side (left)
    for (let i = 0; i < h; i++) {
        drawPixel(ctx, x, y - i, dark);
    }
    // Vertical ridges
    for (let i = 2; i < h - 1; i += 2) {
        drawPixel(ctx, x + s(w / 2), y - i, '#268518');
        if (w > 4) drawPixel(ctx, x + s(w / 2) + 1, y - i, '#2a7a1a');
    }
    // Top cap highlight
    drawRect(ctx, x + 1, y - h, w - 2, 1, highlight);

    // Left arm
    const armY = y - s(h * 0.6);
    const armLen = s(4 * scale);
    drawOutlinedRect(ctx, x - armLen, armY, armLen, w, mid);
    drawOutlinedRect(ctx, x - armLen, armY - s(6 * scale), w, s(6 * scale), mid);
    // Left arm shading
    drawRect(ctx, x - armLen, armY, armLen, 1, dark); // top shadow
    drawRect(ctx, x - armLen + 1, armY - s(6 * scale) + 1, 1, s(6 * scale) - 1, light); // right highlight
    drawRect(ctx, x - armLen, armY - s(6 * scale), 1, s(6 * scale), dark); // left shadow
    drawPixel(ctx, x - armLen + 1, armY - s(6 * scale), highlight); // top cap

    // Right arm
    const armY2 = y - s(h * 0.4);
    const armLen2 = s(3 * scale);
    drawOutlinedRect(ctx, x + w, armY2, armLen2, w, mid);
    drawOutlinedRect(ctx, x + w + s(2 * scale), armY2 - s(5 * scale), w, s(5 * scale), mid);
    // Right arm shading
    drawRect(ctx, x + w, armY2 + w - 1, armLen2, 1, dark); // bottom shadow
    drawRect(ctx, x + w + s(2 * scale) + w - 1, armY2 - s(5 * scale) + 1, 1, s(5 * scale) - 1, light);
    drawRect(ctx, x + w + s(2 * scale), armY2 - s(5 * scale), 1, s(5 * scale), dark);
    drawPixel(ctx, x + w + s(2 * scale) + 1, armY2 - s(5 * scale), highlight);

    // Spines — more on bigger cacti
    const spineCount = s(scale * 4);
    for (let si = 0; si < spineCount; si++) {
        const sy = y - s(h * (0.2 + si * 0.6 / spineCount));
        drawPixel(ctx, x - 1, sy, '#5a8a3e');
        drawPixel(ctx, x + w, sy + 1, '#5a8a3e');
        if (scale > 1.3) {
            drawPixel(ctx, x - 2, sy, '#4a7a2e');
            drawPixel(ctx, x + w + 1, sy + 1, '#4a7a2e');
        }
    }
    // Shadow on ground
    drawRect(ctx, x + 1, y, s(h * 0.4), 1, 'rgba(0,0,0,0.15)');
}

function drawRouteSign(ctx, x, y) {
    // Rusted post — stands on road (y = road surface)
    drawRect(ctx, x + 2, y - 18, 1, 18, '#6b4a2a');
    drawPixel(ctx, x + 2, y - 12, '#8a5a2a');
    // Shield shape — sun-bleached, small
    drawRect(ctx, x, y - 25, 7, 8, '#d4c8a0');
    drawRect(ctx, x + 1, y - 24, 5, 6, '#ccc0a0');
    // Border — faded and rusted
    drawRect(ctx, x, y - 25, 7, 1, '#4a3a2a');
    drawRect(ctx, x, y - 18, 7, 1, '#4a3a2a');
    drawRect(ctx, x, y - 25, 1, 8, '#4a3a2a');
    drawRect(ctx, x + 6, y - 25, 1, 8, '#4a3a2a');
    // "66" text — faded
    drawRect(ctx, x + 1, y - 23, 2, 3, '#5a4a3a');
    drawRect(ctx, x + 4, y - 23, 2, 3, '#5a4a3a');
    // Red trim — sun-bleached
    drawPixel(ctx, x + 1, y - 24, '#8a4a2a');
    drawPixel(ctx, x + 5, y - 19, '#8a4a2a');
    // Rust stain
    drawPixel(ctx, x + 3, y - 21, '#7a5530');
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
    const groundY = Math.floor(H * 0.55);
    const poleH = 20;
    const poleTop = groundY - poleH;
    // Evenly spaced wooden poles across full width
    const poleCount = Math.max(2, Math.floor(W / 50));
    const poleSpacing = W / (poleCount - 1);
    const poles = [];
    for (let i = 0; i < poleCount; i++) {
        poles.push(Math.floor(i * poleSpacing));
    }

    // Draw poles
    poles.forEach(px => {
        // Wooden pole
        drawRect(ctx, px, poleTop, 2, poleH, '#6b5030');
        drawRect(ctx, px + 1, poleTop, 1, poleH, '#5a4020');
        // Wood grain
        drawPixel(ctx, px, poleTop + 5, '#5a4020');
        drawPixel(ctx, px + 1, poleTop + 12, '#5a4020');
        drawPixel(ctx, px, poleTop + 18, '#5a4020');
        // Crossbar
        drawRect(ctx, px - 4, poleTop + 1, 10, 1, '#7b6040');
        drawRect(ctx, px - 4, poleTop + 2, 10, 1, '#6b5030');
        // Insulators at crossbar ends
        drawPixel(ctx, px - 4, poleTop, '#8899aa');
        drawPixel(ctx, px + 5, poleTop, '#8899aa');
    });

    // Wires between poles (two lines with sag)
    for (let i = 0; i < poles.length - 1; i++) {
        const x1 = poles[i];
        const x2 = poles[i + 1];
        for (let x = x1; x <= x2; x++) {
            const t = (x - x1) / (x2 - x1);
            const sag = Math.floor(5 * Math.sin(t * Math.PI));
            // Upper wire
            drawPixel(ctx, x, poleTop + sag, '#333');
            // Lower wire
            drawPixel(ctx, x, poleTop + 1 + Math.floor(sag * 1.1), '#2a2a2a');
        }
    }
}


// ====== SECTION 2: ABOUT — Brooklyn Street ======
function drawBrooklynScene(canvas) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width / PIXEL;
    const H = canvas.height / PIXEL;

    // NIGHT SKY — per-row smooth
    for (let y = 0; y < H; y++) {
        const t = y / H;
        const r = Math.floor(8 + t * 14);
        const g = Math.floor(6 + t * 12);
        const b = Math.floor(24 + t * 18);
        drawRect(ctx, 0, y, W, 1, `rgb(${r},${g},${b})`);
    }

    // Stars — varied sizes with aura glow
    for (let i = 0; i < 80; i++) {
        const sx = Math.floor(Math.random() * W);
        const sy = Math.floor(Math.random() * H * 0.35);
        const brightness = Math.floor(150 + Math.random() * 105);
        const size = Math.random();
        if (size > 0.92) {
            // Big bright star with aura
            for (let dy = -3; dy <= 3; dy++) {
                for (let dx = -3; dx <= 3; dx++) {
                    const d = Math.sqrt(dx * dx + dy * dy);
                    if (d > 0 && d <= 3) {
                        drawPixel(ctx, sx + dx, sy + dy, `rgba(${brightness},${brightness},255,${0.12 - d * 0.035})`);
                    }
                }
            }
            drawPixel(ctx, sx, sy, `rgb(${brightness},${brightness},${Math.floor(brightness * 0.95)})`);
            drawPixel(ctx, sx + 1, sy, `rgba(${brightness},${brightness},255,0.5)`);
            drawPixel(ctx, sx - 1, sy, `rgba(${brightness},${brightness},255,0.5)`);
            drawPixel(ctx, sx, sy + 1, `rgba(${brightness},${brightness},255,0.4)`);
            drawPixel(ctx, sx, sy - 1, `rgba(${brightness},${brightness},255,0.4)`);
        } else if (size > 0.7) {
            // Medium star with small glow
            drawPixel(ctx, sx, sy, `rgb(${brightness},${brightness},${Math.floor(brightness * 0.9)})`);
            drawPixel(ctx, sx + 1, sy, `rgba(${brightness},${brightness},255,0.25)`);
            drawPixel(ctx, sx - 1, sy, `rgba(${brightness},${brightness},255,0.15)`);
            drawPixel(ctx, sx, sy + 1, `rgba(${brightness},${brightness},255,0.15)`);
            drawPixel(ctx, sx, sy - 1, `rgba(${brightness},${brightness},255,0.15)`);
        } else {
            // Small dim star with faint glow
            drawPixel(ctx, sx, sy, `rgba(${brightness},${brightness},${Math.floor(brightness * 0.85)},0.8)`);
            drawPixel(ctx, sx + 1, sy, `rgba(${brightness},${brightness},255,0.06)`);
            drawPixel(ctx, sx - 1, sy, `rgba(${brightness},${brightness},255,0.06)`);
        }
    }

    // Moon with large aura
    const moonX = Math.floor(W * 0.85);
    const moonY = Math.floor(H * 0.1);
    // Wide soft aura
    for (let dy = -16; dy <= 16; dy++) {
        for (let dx = -16; dx <= 16; dx++) {
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 5 && dist <= 16) {
                const a = 0.15 - (dist - 5) * 0.012;
                if (a > 0) drawPixel(ctx, moonX + dx, moonY + dy, `rgba(220,220,200,${a})`);
            }
        }
    }
    // Moon body
    for (let dy = -5; dy <= 5; dy++) {
        for (let dx = -5; dx <= 5; dx++) {
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= 5) {
                const shade = Math.floor(240 - dist * 4);
                drawPixel(ctx, moonX + dx, moonY + dy, `rgb(${shade},${shade},${Math.floor(shade * 0.92)})`);
            }
        }
    }
    // Moon craters
    drawPixel(ctx, moonX - 2, moonY - 1, '#c8c8b8');
    drawPixel(ctx, moonX - 1, moonY - 1, '#d0d0c0');
    drawPixel(ctx, moonX + 1, moonY + 2, '#c8c8b8');
    drawPixel(ctx, moonX + 2, moonY + 2, '#d0d0c0');
    drawPixel(ctx, moonX - 1, moonY + 3, '#ccccc0');
    drawPixel(ctx, moonX + 3, moonY - 1, '#d4d4c8');

    // BUILDINGS — multiple brownstones, fill entire width
    const buildings = [];
    const totalBuildings = Math.ceil(W / 20) + 1;
    for (let i = 0; i < totalBuildings; i++) {
        buildings.push({
            x: i * 20,
            w: 20,
            h: 60 + Math.floor(Math.random() * 40),
            color: ['#7a3325', '#6a2a20', '#8a3a28', '#7a2e22', '#6a3328'][Math.floor(Math.random() * 5)],
            trim: ['#9a5a3a', '#8a4a35', '#aa6a4a'][Math.floor(Math.random() * 3)]
        });
    }

    // groundY = where buildings end, roadY = top of the CSS road overlay
    const groundY = Math.floor(H * 0.82);
    const roadY = Math.floor(H * 0.855); // matches CSS road top edge

    // GRASS AREA — dark, urban Brooklyn vibe
    const grassH = roadY - groundY;
    drawRect(ctx, 0, groundY, W, Math.floor(grassH * 0.5), '#1a5510');
    drawRect(ctx, 0, groundY + Math.floor(grassH * 0.5), W, grassH - Math.floor(grassH * 0.5), '#144a0c');
    drawRect(ctx, 0, roadY - 1, W, 1, '#0e3a08');
    drawRect(ctx, 0, groundY, W, 1, '#205a14');
    // Sparse grass blades
    for (let i = 0; i < 120; i++) {
        const gx = Math.floor(Math.random() * W);
        const gy = groundY + Math.floor(Math.random() * grassH);
        const gh = 1 + Math.floor(Math.random() * 2);
        const gc = Math.random() > 0.5 ? '#205a14' : '#124008';
        drawRect(ctx, gx, gy - gh, 1, gh, gc);
    }
    // Dirt patches in grass
    for (let i = 0; i < 8; i++) {
        const dx = Math.floor(Math.random() * W);
        const dy = groundY + 1 + Math.floor(Math.random() * (grassH - 2));
        drawRect(ctx, dx, dy, 2 + Math.floor(Math.random() * 3), 1, '#3a2a18');
    }

    // BUILDINGS — reddish-brown Brooklyn brownstones with outlines
    buildings.forEach(b => {
        const bTop = groundY - b.h;
        // Main building fill
        drawRect(ctx, b.x, bTop, b.w, b.h, b.color);
        // Detailed brick texture — Punch Club style
        const brickH = 3;
        const brickW = 4;
        // Parse building color for variations
        const bc = b.color.replace('#','');
        const br = parseInt(bc.substring(0,2),16);
        const bg = parseInt(bc.substring(2,4),16);
        const bb = parseInt(bc.substring(4,6),16);

        for (let by = bTop + 5; by < groundY - 2; by += brickH) {
            const rowOffset = ((by - bTop) % (brickH * 2) < brickH) ? 0 : Math.floor(brickW / 2);
            for (let bx = b.x + 1 + rowOffset; bx < b.x + b.w - 1; bx += brickW) {
                const bw = Math.min(brickW - 1, b.x + b.w - 1 - bx);
                if (bw < 2) continue;
                // Brick color variation
                const v = Math.floor(Math.random() * 16) - 8;
                const brickColor = `rgb(${Math.max(0,Math.min(255,br+v))},${Math.max(0,Math.min(255,bg+v))},${Math.max(0,Math.min(255,bb+v))})`;
                drawRect(ctx, bx, by, bw, brickH - 1, brickColor);
                // Top edge highlight
                drawRect(ctx, bx, by, bw, 1, `rgba(255,180,140,0.12)`);
                // Bottom edge shadow
                drawRect(ctx, bx, by + brickH - 2, bw, 1, `rgba(0,0,0,0.15)`);
                // Right edge shadow
                drawPixel(ctx, bx + bw - 1, by, `rgba(0,0,0,0.1)`);
                drawPixel(ctx, bx + bw - 1, by + 1, `rgba(0,0,0,0.1)`);
                // Mortar lines (dark gaps)
                drawRect(ctx, bx - 1, by + brickH - 1, bw + 1, 1, `rgba(0,0,0,0.2)`);
            }
        }
        // Random cracks
        for (let ci = 0; ci < 2; ci++) {
            const cx = b.x + 2 + Math.floor(Math.random() * (b.w - 4));
            const cy = bTop + 10 + Math.floor(Math.random() * (b.h - 20));
            for (let dy = 0; dy < 3 + Math.floor(Math.random() * 3); dy++) {
                drawPixel(ctx, cx + Math.floor(Math.sin(dy) * 0.5), cy + dy, 'rgba(0,0,0,0.2)');
            }
        }
        // Weathering stains — drips from rain
        if (Math.random() > 0.4) {
            const stainX = b.x + 2 + Math.floor(Math.random() * (b.w - 4));
            for (let sy = bTop + Math.floor(b.h * 0.2); sy < bTop + Math.floor(b.h * 0.5); sy++) {
                drawPixel(ctx, stainX, sy, `rgba(0,0,0,${0.06 + Math.random() * 0.04})`);
                if (Math.random() > 0.7) drawPixel(ctx, stainX + 1, sy, `rgba(0,0,0,0.04)`);
            }
        }
        // Black outline
        drawRect(ctx, b.x, bTop, b.w, 1, '#000');
        drawRect(ctx, b.x, bTop + b.h - 1, b.w, 1, '#000');
        drawRect(ctx, b.x, bTop, 1, b.h, '#000');
        drawRect(ctx, b.x + b.w - 1, bTop, 1, b.h, '#000');
        // Roof trim
        drawRect(ctx, b.x, bTop + 1, b.w, 2, b.trim);
        drawRect(ctx, b.x - 1, bTop - 1, b.w + 2, 1, b.trim);
        drawRect(ctx, b.x, bTop + 4, b.w, 1, b.trim);

        // Windows
        for (let wy = bTop + 7; wy < groundY - 10; wy += 8) {
            for (let wx = b.x + 3; wx < b.x + b.w - 3; wx += 5) {
                const lit = Math.random() > 0.3;
                if (lit) {
                    const warmth = Math.random();
                    drawRect(ctx, wx, wy, 3, 4, `rgb(${Math.floor(200 + warmth * 55)},${Math.floor(150 + warmth * 80)},${Math.floor(50 + warmth * 40)})`);
                } else {
                    drawRect(ctx, wx, wy, 3, 4, '#1a1020');
                }
                // Window frame (black outline)
                drawRect(ctx, wx - 1, wy - 1, 5, 1, '#111');
                drawRect(ctx, wx - 1, wy + 4, 5, 1, '#111');
                drawRect(ctx, wx - 1, wy - 1, 1, 6, '#111');
                drawRect(ctx, wx + 3, wy - 1, 1, 6, '#111');
            }
        }

        // Fire escapes
        if (Math.random() > 0.5) {
            for (let fy = bTop + 12; fy < groundY - 15; fy += 12) {
                drawRect(ctx, b.x + b.w - 1, fy, 5, 1, '#555');
                drawRect(ctx, b.x + b.w + 3, fy, 1, 12, '#555');
                drawRect(ctx, b.x + b.w - 1, fy - 3, 1, 3, '#444');
                drawRect(ctx, b.x + b.w + 3, fy - 3, 1, 3, '#444');
            }
        }

        // Door
        if (Math.random() > 0.4) {
            const doorX = b.x + Math.floor(b.w / 2) - 2;
            drawOutlinedRect(ctx, doorX, groundY - 8, 4, 8, '#2a1a0a');
            drawRect(ctx, doorX, groundY - 9, 4, 1, b.trim);
            drawRect(ctx, doorX - 1, groundY - 2, 6, 2, '#666');
            drawPixel(ctx, doorX + 3, groundY - 4, '#aa8844');
        }
    });

    // DELI SHOPS — evenly spread across all buildings (3 desktop / 2 mobile)
    const isMobileBK = (window.innerWidth <= 768);
    const deliCount = isMobileBK ? 2 : 3;
    const deliSpacing = Math.floor(buildings.length / deliCount);
    const deliIndexes = [];
    for (let di = 0; di < deliCount; di++) {
        const idx = Math.floor(deliSpacing * di + deliSpacing / 2);
        if (idx < buildings.length) deliIndexes.push(idx);
    }
    const awningColors = ['#cc3333', '#33aa55', '#cc8833'];

    deliIndexes.forEach((bi, di) => {
        const b = buildings[bi];
        const shopH = 14;
        const shopY = groundY - shopH;

        // Shop front (lighter color)
        drawRect(ctx, b.x + 1, shopY, b.w - 2, shopH, '#d4c4a0');
        // Black outline
        drawRect(ctx, b.x + 1, shopY, b.w - 2, 1, '#000');
        drawRect(ctx, b.x + 1, shopY, 1, shopH, '#000');
        drawRect(ctx, b.x + b.w - 2, shopY, 1, shopH, '#000');

        // Awning (striped)
        const awnColor = awningColors[di];
        for (let ax = b.x + 1; ax < b.x + b.w - 2; ax++) {
            const stripe = (ax % 4 < 2) ? awnColor : '#fff';
            drawRect(ctx, ax, shopY - 3, 1, 3, stripe);
        }
        drawRect(ctx, b.x, shopY - 4, b.w, 1, '#333');

        // Shop window (big glass)
        const winX = b.x + 3;
        const winW = Math.floor((b.w - 8) / 2);
        // Left window
        drawRect(ctx, winX, shopY + 3, winW, 8, '#446688');
        drawRect(ctx, winX, shopY + 3, winW, 1, '#5588aa');
        // Right window
        drawRect(ctx, winX + winW + 2, shopY + 3, winW, 8, '#446688');
        drawRect(ctx, winX + winW + 2, shopY + 3, winW, 1, '#5588aa');

        // Door between windows
        drawRect(ctx, winX + winW, shopY + 4, 2, 10, '#553311');
        drawPixel(ctx, winX + winW + 1, shopY + 8, '#aa8844');

        // "DELI" sign above awning
        const signX = b.x + Math.floor(b.w / 2) - 6;
        drawRect(ctx, signX, shopY - 8, 13, 4, '#111');
        // D
        drawPixel(ctx, signX + 2, shopY - 7, '#ffcc00');
        drawPixel(ctx, signX + 2, shopY - 6, '#ffcc00');
        drawPixel(ctx, signX + 3, shopY - 7, '#ffcc00');
        // E
        drawPixel(ctx, signX + 5, shopY - 7, '#ffcc00');
        drawPixel(ctx, signX + 5, shopY - 6, '#ffcc00');
        drawPixel(ctx, signX + 6, shopY - 7, '#ffcc00');
        // L
        drawPixel(ctx, signX + 8, shopY - 7, '#ffcc00');
        drawPixel(ctx, signX + 8, shopY - 6, '#ffcc00');
        drawPixel(ctx, signX + 9, shopY - 6, '#ffcc00');
        // I
        drawPixel(ctx, signX + 11, shopY - 7, '#ffcc00');
        drawPixel(ctx, signX + 11, shopY - 6, '#ffcc00');

        // Neon "OPEN" sign in window
        drawPixel(ctx, winX + 1, shopY + 5, '#ff3333');
        drawPixel(ctx, winX + 2, shopY + 5, '#ff3333');
        drawPixel(ctx, winX + 3, shopY + 5, '#ff3333');
        // Glow
        drawPixel(ctx, winX + 1, shopY + 4, 'rgba(255,50,50,0.3)');
        drawPixel(ctx, winX + 2, shopY + 4, 'rgba(255,50,50,0.3)');
        drawPixel(ctx, winX + 3, shopY + 4, 'rgba(255,50,50,0.3)');
    });

    // TREES — on road level (7 desktop / 4 mobile, evenly spaced)
    const treeRatios = isMobileBK
        ? [0.10, 0.37, 0.63, 0.90]
        : [0.08, 0.23, 0.38, 0.52, 0.68, 0.82, 0.95];
    const treeTypes = [0, 1, 2, 0, 1, 2, 0];
    treeRatios.forEach((r, i) => drawTree(ctx, Math.floor(W * r), roadY, treeTypes[i % treeTypes.length]));

    // HYDRANTS — on road level (3 desktop / 1 mobile)
    const hydrantRatios = isMobileBK ? [0.50] : [0.18, 0.55, 0.88];
    hydrantRatios.forEach(r => drawHydrant(ctx, Math.floor(W * r), roadY));

    // Street lamps — detailed with light cones (4 desktop / 3 mobile, evenly spaced)
    const lampCount = isMobileBK ? 3 : 4;
    const lampPositions = [];
    const lampSpacing = Math.floor(W / lampCount);
    for (let li = 0; li < lampCount; li++) {
        const lx = Math.floor(lampSpacing * 0.5 + li * lampSpacing);
        lampPositions.push(lx);

        // Light cone — visible warm triangle of light
        const lampCX = lx - 2;
        const lampTopY = roadY - 23;
        for (let cy = 1; cy < 24; cy++) {
            const t = cy / 24;
            const halfW = Math.floor(1 + t * 12);
            // Solid colored light rows — not just alpha overlay
            const r = Math.floor(255);
            const g = Math.floor(200 - t * 40);
            const b = Math.floor(80 - t * 40);
            const a = 0.25 * (1 - t * 0.5);
            drawRect(ctx, lampCX - halfW, lampTopY + cy, halfW * 2 + 1, 1, `rgba(${r},${g},${b},${a})`);
        }

        // Bright ground pool
        drawRect(ctx, lampCX - 10, roadY - 3, 21, 1, 'rgba(255,200,80,0.1)');
        drawRect(ctx, lampCX - 8, roadY - 2, 17, 1, 'rgba(255,200,80,0.12)');
        drawRect(ctx, lampCX - 6, roadY - 1, 13, 1, 'rgba(255,200,80,0.08)');

        // Pole base (wider)
        drawOutlinedRect(ctx, lx - 1, roadY - 2, 4, 2, '#555');
        // Pole — dark metal
        drawRect(ctx, lx, roadY - 22, 2, 20, '#666');
        drawRect(ctx, lx, roadY - 22, 1, 20, '#777'); // highlight left
        drawRect(ctx, lx + 1, roadY - 22, 1, 20, '#555'); // shadow right
        // Black outline
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(lx * PIXEL + 1, (roadY - 22) * PIXEL + 1, 2 * PIXEL - 2, 20 * PIXEL - 2);

        // Curved arm at top
        drawRect(ctx, lx - 1, roadY - 23, 1, 2, '#666');
        drawRect(ctx, lx - 2, roadY - 24, 1, 2, '#666');
        drawRect(ctx, lx - 3, roadY - 25, 1, 2, '#666');

        // Lamp housing
        drawOutlinedRect(ctx, lx - 5, roadY - 26, 6, 3, '#444');
        drawRect(ctx, lx - 5, roadY - 26, 6, 1, '#555'); // top highlight
        // Bulb (bright)
        drawRect(ctx, lx - 4, roadY - 24, 4, 1, '#ffdd88');
        drawRect(ctx, lx - 4, roadY - 23, 4, 1, '#ffcc66');

        // Bright glow around bulb
        for (let dy = -3; dy <= 3; dy++) {
            for (let dx = -4; dx <= 4; dx++) {
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 4 && dist > 0) {
                    drawPixel(ctx, lx - 2 + dx, roadY - 24 + dy, `rgba(255,220,120,${0.15 - dist * 0.03})`);
                }
            }
        }
    }

    // Trash cans — on road level

    // UNDERGROUND CROSS-SECTION (below road)
    const ugTop = roadY + 2;
    const ugH = H - ugTop;

    // Soil layer
    const soilH = Math.floor(ugH * 0.45);
    for (let y = ugTop; y < ugTop + soilH; y++) {
        const t = (y - ugTop) / soilH;
        const r = Math.floor(60 - t * 15);
        const g = Math.floor(40 - t * 10);
        const b = Math.floor(25 - t * 8);
        drawRect(ctx, 0, y, W, 1, `rgb(${r},${g},${b})`);
        // Dirt texture — small rocks and roots
        for (let x = 0; x < W; x += 3) {
            if (Math.random() > 0.8) {
                drawPixel(ctx, x, y, `rgba(80,60,40,${0.3 + Math.random() * 0.3})`);
            }
        }
        // Small rocks
        if (Math.random() > 0.9) {
            const rx = Math.floor(Math.random() * W);
            drawRect(ctx, rx, y, 2, 1, '#5a4a3a');
        }
    }

    // Dark rock layer
    const rockTop = ugTop + soilH;
    const rockH = Math.floor(ugH * 0.7);
    for (let y = rockTop; y < rockTop + rockH && y < H; y++) {
        const t = (y - rockTop) / rockH;
        const c = Math.floor(30 - t * 10);
        drawRect(ctx, 0, y, W, 1, `rgb(${c + 5},${c + 3},${c})`);
    }

    // TREE ROOTS — multiple roots per tree, starting from trunk center
    const treeXs = treeRatios.map(r => W * r);
    treeXs.forEach((tx) => {
        const cx = Math.floor(tx); // aligned with trunk left edge (trunk is x, x+1)
        const rootTop = roadY; // start right from road surface (under trunk)
        const rootDepth = ugH * 0.4;
        const rootColor = '#2a1508';
        const rootDark = '#1e0e05';
        const rootThin = '#1a0c04';

        // Helper: draw one root branch
        function drawRoot(startY, angle, length, color) {
            for (let i = 0; i < length; i++) {
                const t = i / length;
                const rx = cx + Math.floor(Math.sin(angle) * i * 0.5 + Math.sin(i * 0.3) * 0.8);
                const ry = rootTop + startY + i;
                if (ry >= H) break;
                drawPixel(ctx, rx, ry, color);
            }
        }

        // Thick main taproot — straight down from center
        for (let y = rootTop; y < rootTop + rootDepth; y++) {
            drawPixel(ctx, cx, y, rootColor);
            drawPixel(ctx, cx + 1, y, rootDark);
        }

        // Major roots spreading out (5-7 per tree)
        drawRoot(0, -0.8, Math.floor(rootDepth * 0.85), rootColor);  // far left
        drawRoot(1, -0.4, Math.floor(rootDepth * 0.7), rootColor);   // left
        drawRoot(2, 0.5, Math.floor(rootDepth * 0.75), rootColor);   // right
        drawRoot(0, 0.9, Math.floor(rootDepth * 0.8), rootColor);    // far right
        drawRoot(3, -0.2, Math.floor(rootDepth * 0.5), rootDark);    // slight left
        drawRoot(4, 0.15, Math.floor(rootDepth * 0.45), rootDark);   // slight right

        // Sub-branches forking from major roots
        drawRoot(6, -1.2, Math.floor(rootDepth * 0.4), rootThin);    // fork far left
        drawRoot(8, -0.6, Math.floor(rootDepth * 0.35), rootThin);   // fork left
        drawRoot(7, 1.1, Math.floor(rootDepth * 0.4), rootThin);     // fork far right
        drawRoot(9, 0.7, Math.floor(rootDepth * 0.3), rootThin);     // fork right
        drawRoot(5, -0.3, Math.floor(rootDepth * 0.25), rootThin);   // tiny left
        drawRoot(10, 0.3, Math.floor(rootDepth * 0.2), rootThin);    // tiny right
    });

    // HYDRANT PIPES — connecting down to main sewer pipe
    const hydrantXs = hydrantRatios.map(r => W * r);
    const mainPipeY = rockTop + Math.floor(rockH * 0.25);
    hydrantXs.forEach(hx => {
        const hxx = Math.floor(hx);
        // Vertical pipe from hydrant down to main pipe
        drawRect(ctx, hxx, ugTop, 3, mainPipeY - ugTop + 4, '#555');
        drawRect(ctx, hxx, ugTop, 1, mainPipeY - ugTop + 4, '#666');
        drawRect(ctx, hxx + 2, ugTop, 1, mainPipeY - ugTop + 4, '#444');
        // Interior
        drawRect(ctx, hxx + 1, ugTop + 1, 1, mainPipeY - ugTop + 2, '#333');
        // Joint at connection to main pipe
        drawRect(ctx, hxx - 1, mainPipeY, 5, 2, '#666');
        // Joint at road level
        drawRect(ctx, hxx - 1, ugTop, 5, 2, '#666');
    });

    // SEWER PIPES
    const pipes = [
        // Main horizontal pipe
        { x: 0, y: 0.25, w: W, h: 5, dir: 'h' },
    ];

    pipes.forEach(p => {
        const py = rockTop + Math.floor(rockH * p.y);
        const pColor = p.h >= 6 ? '#4a4a4a' : p.h >= 4 ? '#454545' : '#404040';
        const pHigh = p.h >= 6 ? '#5a5a5a' : '#505050';
        const pDark = '#2a2a2a';

        if (p.dir === 'h') {
            // Horizontal pipe
            drawRect(ctx, p.x, py, p.w, p.h, pColor);
            drawRect(ctx, p.x, py, p.w, 1, pHigh);
            drawRect(ctx, p.x, py + p.h - 1, p.w, 1, '#333');
            drawRect(ctx, p.x + 1, py + 1, p.w - 2, p.h - 2, pDark);
            // Joint rings — evenly spaced
            const jointCount = 3;
            const jointSpacing = Math.floor(p.w / (jointCount + 1));
            for (let ji = 1; ji <= jointCount; ji++) {
                const jx = p.x + ji * jointSpacing;
                drawRect(ctx, jx, py - 1, 2, p.h + 2, '#555');
            }
            // Drips from big pipes
            if (p.h >= 5 && Math.random() > 0.3) {
                const dx = p.x + Math.floor(p.w * 0.4);
                drawPixel(ctx, dx, py + p.h, '#334455');
                drawPixel(ctx, dx, py + p.h + 1, '#223344');
            }
        } else if (p.dir === 'v') {
            // Vertical pipe
            const vLen = Math.floor(rockH * p.vh);
            drawRect(ctx, p.x, py, p.h, vLen, pColor);
            drawRect(ctx, p.x, py, 1, vLen, pHigh);
            drawRect(ctx, p.x + p.h - 1, py, 1, vLen, '#333');
            drawRect(ctx, p.x + 1, py + 1, p.h - 2, vLen - 2, pDark);
            // Elbow at top
            drawRect(ctx, p.x - 1, py - 1, p.h + 2, 2, '#555');
        } else if (p.dir === 'd') {
            // Diagonal pipe
            const epy = rockTop + Math.floor(rockH * p.ey);
            const steps = Math.abs(p.ex - p.x);
            for (let t = 0; t <= 1; t += 1 / steps) {
                const dx = Math.floor(p.x + t * (p.ex - p.x));
                const dy = Math.floor(py + t * (epy - py));
                drawRect(ctx, dx, dy, p.h, p.h, pColor);
                drawPixel(ctx, dx, dy, pHigh);
            }
        }
    });
}

function drawTree(ctx, x, y, type) {
    const dark = '#0e3a06';
    const mid = '#1a5510';
    const base = '#226a16';
    const light = '#2d7a1e';
    const highlight = '#3d8a2e';
    const bright = '#4d9a3e';

    // Shadow on ground
    drawRect(ctx, x - 4, y, 10, 1, 'rgba(0,0,0,0.15)');
    drawRect(ctx, x - 2, y + 1, 6, 1, 'rgba(0,0,0,0.08)');

    // Trunk — thicker with branches
    drawOutlinedRect(ctx, x - 1, y - 16, 3, 16, '#4a2a15');
    drawRect(ctx, x, y - 15, 1, 14, '#5a3a20'); // mid tone
    drawRect(ctx, x + 1, y - 15, 1, 14, '#6a4a30'); // light side
    drawRect(ctx, x - 1, y - 15, 1, 14, '#3a1a0a'); // dark side
    // Bark knots
    drawPixel(ctx, x, y - 10, '#3a1a0a');
    drawPixel(ctx, x, y - 5, '#3a1a0a');
    // Small branches sticking out
    drawPixel(ctx, x - 2, y - 12, '#4a2a15');
    drawPixel(ctx, x + 2, y - 9, '#4a2a15');

    if (type === 0) {
        // Wide spreading oak
        // Main canopy — rounded shape built from overlapping rects
        drawOutlinedRect(ctx, x - 6, y - 22, 14, 7, base);
        drawOutlinedRect(ctx, x - 4, y - 25, 10, 4, light);
        drawOutlinedRect(ctx, x - 8, y - 20, 4, 4, mid);
        drawOutlinedRect(ctx, x + 6, y - 21, 4, 5, mid);
        drawOutlinedRect(ctx, x - 2, y - 27, 6, 3, highlight);
        // Left dark mass
        drawRect(ctx, x - 7, y - 19, 3, 3, dark);
        // Right dark mass
        drawRect(ctx, x + 7, y - 19, 2, 3, dark);
        // Top highlights
        drawRect(ctx, x - 3, y - 27, 4, 1, bright);
        drawRect(ctx, x - 5, y - 25, 2, 1, highlight);
        drawRect(ctx, x + 4, y - 24, 2, 1, highlight);
        // Bottom shadow edge
        drawRect(ctx, x - 6, y - 16, 14, 1, dark);
    } else if (type === 1) {
        // Tall elm
        drawOutlinedRect(ctx, x - 4, y - 24, 10, 9, base);
        drawOutlinedRect(ctx, x - 6, y - 22, 3, 5, mid);
        drawOutlinedRect(ctx, x + 5, y - 21, 3, 4, mid);
        drawOutlinedRect(ctx, x - 2, y - 28, 6, 5, light);
        drawOutlinedRect(ctx, x - 1, y - 30, 4, 3, highlight);
        // Dark masses
        drawRect(ctx, x - 5, y - 20, 2, 3, dark);
        drawRect(ctx, x + 5, y - 19, 2, 2, dark);
        // Top highlight
        drawRect(ctx, x, y - 30, 2, 1, bright);
        drawRect(ctx, x - 2, y - 28, 1, 1, highlight);
        // Bottom shadow
        drawRect(ctx, x - 4, y - 16, 10, 1, dark);
    } else {
        // Full round maple
        drawOutlinedRect(ctx, x - 5, y - 23, 12, 8, base);
        drawOutlinedRect(ctx, x - 7, y - 21, 4, 5, mid);
        drawOutlinedRect(ctx, x + 5, y - 22, 4, 6, mid);
        drawOutlinedRect(ctx, x - 3, y - 27, 8, 5, light);
        drawOutlinedRect(ctx, x - 1, y - 29, 4, 3, highlight);
        // Bumps
        drawOutlinedRect(ctx, x - 8, y - 19, 2, 3, dark);
        drawOutlinedRect(ctx, x + 8, y - 20, 2, 4, dark);
        // Top
        drawRect(ctx, x, y - 29, 2, 1, bright);
        drawRect(ctx, x - 3, y - 27, 2, 1, highlight);
        drawRect(ctx, x + 3, y - 26, 2, 1, highlight);
        // Bottom shadow
        drawRect(ctx, x - 5, y - 16, 12, 1, dark);
    }

    // Leaf texture — scattered highlights and shadows
    const canopyTop = type === 1 ? y - 30 : (type === 0 ? y - 27 : y - 29);
    const canopyH = type === 1 ? 14 : 12;
    const canopyW = type === 0 ? 16 : (type === 1 ? 12 : 16);
    const canopyLeft = type === 0 ? x - 8 : (type === 1 ? x - 6 : x - 8);

    // Highlight clusters (top-right, lit side)
    for (let i = 0; i < 8; i++) {
        const hx = canopyLeft + Math.floor(canopyW * 0.4) + Math.floor(Math.random() * canopyW * 0.5);
        const hy = canopyTop + Math.floor(Math.random() * canopyH * 0.5);
        drawPixel(ctx, hx, hy, bright);
    }
    // Mid-tone leaf scatter
    for (let i = 0; i < 12; i++) {
        const hx = canopyLeft + 2 + Math.floor(Math.random() * (canopyW - 4));
        const hy = canopyTop + 2 + Math.floor(Math.random() * (canopyH - 4));
        drawPixel(ctx, hx, hy, Math.random() > 0.5 ? light : base);
    }
    // Shadow clusters (bottom-left)
    for (let i = 0; i < 6; i++) {
        const hx = canopyLeft + Math.floor(Math.random() * canopyW * 0.4);
        const hy = canopyTop + Math.floor(canopyH * 0.5) + Math.floor(Math.random() * canopyH * 0.4);
        drawPixel(ctx, hx, hy, dark);
    }
}

function drawRat(ctx, x, y) {
    // Body
    drawRect(ctx, x, y, 4, 2, '#555');
    drawPixel(ctx, x - 1, y + 1, '#555'); // nose
    // Outline
    drawPixel(ctx, x - 1, y, '#000');
    drawPixel(ctx, x + 4, y, '#000');
    drawPixel(ctx, x - 1, y + 2, '#000');
    drawPixel(ctx, x + 4, y + 1, '#000');
    drawRect(ctx, x, y - 1, 4, 1, '#000');
    drawRect(ctx, x, y + 2, 4, 1, '#000');
    // Eye
    drawPixel(ctx, x, y, '#ff0000');
    // Tail
    drawRect(ctx, x + 4, y + 1, 3, 1, '#444');
    drawPixel(ctx, x + 4, y + 1, '#000');
    // Ears
    drawPixel(ctx, x + 1, y - 1, '#666');
}

function drawPigeon(ctx, x, y) {
    // Body
    drawRect(ctx, x, y, 3, 2, '#888');
    // Head
    drawPixel(ctx, x - 1, y, '#999');
    // Beak
    drawPixel(ctx, x - 2, y, '#dd8800');
    // Outline
    drawPixel(ctx, x - 2, y - 1, '#000');
    drawPixel(ctx, x - 1, y - 1, '#000');
    drawRect(ctx, x, y - 1, 3, 1, '#000');
    drawPixel(ctx, x + 3, y, '#000');
    drawPixel(ctx, x + 3, y + 1, '#000');
    drawRect(ctx, x - 1, y + 2, 4, 1, '#000');
    drawPixel(ctx, x - 2, y + 1, '#000');
    // Eye
    drawPixel(ctx, x - 1, y, '#ff4400');
    // Feet
    drawPixel(ctx, x, y + 2, '#dd6600');
    drawPixel(ctx, x + 2, y + 2, '#dd6600');
}

function drawHydrantWithDog(ctx, x, y) {
    // Hydrant (bigger)
    drawOutlinedRect(ctx, x, y - 8, 4, 8, '#cc2200');
    drawOutlinedRect(ctx, x - 1, y - 6, 6, 2, '#dd3300');
    drawOutlinedRect(ctx, x, y - 10, 4, 2, '#cc2200');
    drawOutlinedRect(ctx, x + 1, y - 11, 2, 1, '#dd3300');
    drawRect(ctx, x + 1, y - 7, 1, 5, '#ee4422');

    // Dog next to hydrant
    const dx = x + 6;
    const dy = y;
    // Body
    drawOutlinedRect(ctx, dx, dy - 5, 6, 3, '#aa7744');
    // Head
    drawOutlinedRect(ctx, dx - 2, dy - 7, 3, 4, '#aa7744');
    // Ear
    drawPixel(ctx, dx - 2, dy - 8, '#886633');
    // Eye
    drawPixel(ctx, dx - 1, dy - 6, '#000');
    // Nose
    drawPixel(ctx, dx - 2, dy - 5, '#222');
    // Back legs
    drawOutlinedRect(ctx, dx + 4, dy - 2, 1, 2, '#aa7744');
    // Front leg on ground
    drawOutlinedRect(ctx, dx, dy - 2, 1, 2, '#aa7744');
    // Raised leg (peeing pose)
    drawRect(ctx, dx + 1, dy - 4, 2, 1, '#aa7744');
    drawRect(ctx, dx + 2, dy - 5, 1, 1, '#aa7744');
    // Tail up
    drawRect(ctx, dx + 6, dy - 6, 1, 2, '#aa7744');
    drawPixel(ctx, dx + 6, dy - 7, '#886633');

    // PEE stream — yellow arc from dog to hydrant
    drawPixel(ctx, dx + 1, dy - 3, '#ddcc00');
    drawPixel(ctx, x + 4, dy - 3, '#ddcc00');
    drawPixel(ctx, x + 5, dy - 3, '#ddcc00');
    drawPixel(ctx, x + 4, dy - 2, '#ccbb00');
    drawPixel(ctx, x + 5, dy - 2, '#ccbb00');
    // Puddle
    drawRect(ctx, x - 1, dy, 7, 1, '#ccbb00');
    drawRect(ctx, x, dy + 1, 5, 1, '#bbaa00');
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
    drawOutlinedRect(ctx, x, y - 6, 4, 6, '#555');
    drawOutlinedRect(ctx, x - 1, y - 7, 6, 1, '#666');
    // Rim detail
    drawRect(ctx, x - 1, y - 7, 6, 1, '#777');
    // Dent/shadow
    drawPixel(ctx, x + 1, y - 4, '#444');
    drawPixel(ctx, x + 2, y - 3, '#444');
    // Trash peeking out
    drawPixel(ctx, x + 1, y - 7, '#886633');
    drawPixel(ctx, x + 3, y - 8, '#668844');
}

function drawHydrant(ctx, x, y) {
    // Main body — muted red
    drawOutlinedRect(ctx, x, y - 8, 4, 8, '#882211');
    // Side nozzles
    drawOutlinedRect(ctx, x - 1, y - 6, 6, 2, '#993322');
    // Cap
    drawOutlinedRect(ctx, x, y - 10, 4, 2, '#882211');
    // Top knob
    drawOutlinedRect(ctx, x + 1, y - 11, 2, 1, '#993322');
    // Highlight
    drawRect(ctx, x + 1, y - 7, 1, 5, '#aa4433');
    // Shadow
    drawRect(ctx, x + 3, y - 7, 1, 5, '#661100');
}


// ====== SECTION 3: LIVE — Verrazano Bridge Night ======
function drawLiveScene(canvas) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width / PIXEL;
    const H = canvas.height / PIXEL;

    // DEEP NIGHT SKY — per-row smooth
    for (let y = 0; y < Math.floor(H * 0.6); y++) {
        const t = y / (H * 0.6);
        const r = Math.floor(4 + t * 10);
        const g = Math.floor(4 + t * 8);
        const b = Math.floor(18 + t * 20);
        drawRect(ctx, 0, y, W, 1, `rgb(${r},${g},${b})`);
    }

    // STARS — varied with colored tints and aura
    for (let i = 0; i < 120; i++) {
        const sx = Math.floor(Math.random() * W);
        const sy = Math.floor(Math.random() * H * 0.5);
        const brightness = Math.floor(120 + Math.random() * 135);
        const tint = Math.random();
        let r = brightness, g = brightness, b = brightness;
        if (tint > 0.9) { r += 30; b -= 20; }
        else if (tint > 0.8) { b += 30; r -= 10; }
        const size = Math.random();
        if (size > 0.95) {
            // Large star with aura
            for (let dy = -3; dy <= 3; dy++) {
                for (let dx = -3; dx <= 3; dx++) {
                    const d = Math.sqrt(dx * dx + dy * dy);
                    if (d > 0 && d <= 3) {
                        drawPixel(ctx, sx + dx, sy + dy, `rgba(${r},${g},${b},${0.15 - d * 0.04})`);
                    }
                }
            }
            drawRect(ctx, sx, sy, 2, 2, `rgb(${r},${g},${b})`);
        } else if (size > 0.8) {
            // Medium star with glow
            drawPixel(ctx, sx, sy, `rgb(${r},${g},${b})`);
            drawPixel(ctx, sx + 1, sy, `rgba(${r},${g},${b},0.35)`);
            drawPixel(ctx, sx - 1, sy, `rgba(${r},${g},${b},0.2)`);
            drawPixel(ctx, sx, sy + 1, `rgba(${r},${g},${b},0.2)`);
            drawPixel(ctx, sx, sy - 1, `rgba(${r},${g},${b},0.2)`);
        } else {
            // Small with faint glow
            drawPixel(ctx, sx, sy, `rgba(${r},${g},${b},${0.5 + Math.random() * 0.5})`);
            drawPixel(ctx, sx + 1, sy, `rgba(${r},${g},${b},0.07)`);
        }
    }

    // Big stars with large aura
    const bigStars = [
        { x: W * 0.1, y: H * 0.05 }, { x: W * 0.35, y: H * 0.12 },
        { x: W * 0.6, y: H * 0.03 }, { x: W * 0.8, y: H * 0.15 },
        { x: W * 0.95, y: H * 0.08 }
    ];
    bigStars.forEach(s => {
        const bx = Math.floor(s.x);
        const by = Math.floor(s.y);
        // Wide aura
        for (let dy = -5; dy <= 5; dy++) {
            for (let dx = -5; dx <= 5; dx++) {
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d > 1 && d <= 5) {
                    drawPixel(ctx, bx + dx, by + dy, `rgba(200,210,255,${0.12 - d * 0.02})`);
                }
            }
        }
        // Core + cross
        drawPixel(ctx, bx, by, '#ffffff');
        drawPixel(ctx, bx - 1, by, 'rgba(255,255,255,0.6)');
        drawPixel(ctx, bx + 1, by, 'rgba(255,255,255,0.6)');
        drawPixel(ctx, bx, by - 1, 'rgba(255,255,255,0.6)');
        drawPixel(ctx, bx, by + 1, 'rgba(255,255,255,0.6)');
        drawPixel(ctx, bx - 2, by, 'rgba(200,210,255,0.2)');
        drawPixel(ctx, bx + 2, by, 'rgba(200,210,255,0.2)');
        drawPixel(ctx, bx, by - 2, 'rgba(200,210,255,0.2)');
        drawPixel(ctx, bx, by + 2, 'rgba(200,210,255,0.2)');
    });

    // WATER — Punch Club style: flat bands with blocky wave highlights
    const waterY = Math.floor(H * 0.6);
    const waterH = H - waterY;
    const waterBands = [
        { from: 0, to: 0.25, color: '#0a1838' },
        { from: 0.25, to: 0.50, color: '#0c1c3a' },
        { from: 0.50, to: 0.75, color: '#0e2040' },
        { from: 0.75, to: 1.0, color: '#102444' },
    ];
    waterBands.forEach(band => {
        const y1 = waterY + Math.floor(waterH * band.from);
        const y2 = waterY + Math.floor(waterH * band.to);
        drawRect(ctx, 0, y1, W, y2 - y1, band.color);
    });
    // Blocky wave highlights
    for (let y = waterY; y < H; y += 3) {
        for (let x = 0; x < W; x += 4) {
            if (Math.sin(x * 0.15 + y * 0.3) > 0.5) {
                drawRect(ctx, x, y, 2, 1, '#1a3050');
            }
        }
    }
    // Surface line
    drawRect(ctx, 0, waterY, W, 1, '#1a3055');

    // CITY SKYLINE — varied heights with antenna and lit windows
    const skylineY = waterY;
    for (let x = 0; x < W; x += 3) {
        const bh = 5 + Math.floor(Math.random() * 25);
        const bw = 2 + (Math.random() > 0.7 ? 1 : 0);
        drawRect(ctx, x, skylineY - bh, bw, bh, '#0a0a18');
        // Antenna on tall buildings
        if (bh > 22 && Math.random() > 0.5) {
            drawRect(ctx, x + 1, skylineY - bh - 4, 1, 4, '#1a1a28');
            drawPixel(ctx, x + 1, skylineY - bh - 5, '#ff2200');
        }
        // Windows
        for (let wy = skylineY - bh + 2; wy < skylineY; wy += 3) {
            if (Math.random() > 0.4) {
                const warmth = Math.random();
                drawPixel(ctx, x, wy, `rgba(${Math.floor(255 - warmth * 50)},${Math.floor(200 - warmth * 60)},${Math.floor(100 - warmth * 40)},${0.25 + Math.random() * 0.35})`);
            }
        }
        // Building reflection in water
        for (let ry = 0; ry < Math.min(bh, 10); ry++) {
            drawPixel(ctx, x, skylineY + ry + 1, `rgba(10,10,25,${0.15 - ry * 0.012})`);
        }
    }

    // STATUE OF LIBERTY — detailed
    const statueX = Math.floor(W * 0.12);
    const statueBase = waterY + 4;
    // Island base
    drawOutlinedRect(ctx, statueX - 6, statueBase, 14, 3, '#3a4a3a');
    drawRect(ctx, statueX - 5, statueBase + 1, 12, 1, '#2a3a2a');
    // Star-shaped pedestal base
    drawOutlinedRect(ctx, statueX - 5, statueBase - 4, 12, 4, '#5a6a5a');
    drawRect(ctx, statueX - 4, statueBase - 3, 10, 2, '#6a7a6a');
    // Pedestal
    drawOutlinedRect(ctx, statueX - 3, statueBase - 10, 8, 6, '#4a5a4a');
    drawRect(ctx, statueX - 2, statueBase - 9, 6, 4, '#5a6a5a');
    // Pedestal detail — door
    drawRect(ctx, statueX, statueBase - 8, 2, 3, '#3a4a3a');
    // Pedestal top trim
    drawOutlinedRect(ctx, statueX - 4, statueBase - 11, 10, 1, '#6a7a6a');

    // Body/robe
    const green = '#4a7a5a';
    const greenLight = '#5a8a6a';
    const greenDark = '#3a6a4a';
    const greenHi = '#6a9a7a';
    drawOutlinedRect(ctx, statueX - 2, statueBase - 24, 6, 13, green);
    // Robe folds — light side
    drawRect(ctx, statueX + 2, statueBase - 23, 1, 11, greenLight);
    drawRect(ctx, statueX + 3, statueBase - 22, 1, 9, greenHi);
    // Robe folds — dark side
    drawRect(ctx, statueX - 2, statueBase - 23, 1, 11, greenDark);
    // Robe bottom flare
    drawPixel(ctx, statueX - 3, statueBase - 12, greenDark);
    drawPixel(ctx, statueX + 4, statueBase - 12, greenLight);
    // Tablet in left arm
    drawRect(ctx, statueX - 3, statueBase - 20, 2, 6, '#4a6a5a');
    drawRect(ctx, statueX - 3, statueBase - 20, 1, 6, '#3a5a4a');

    // Head
    drawOutlinedRect(ctx, statueX - 1, statueBase - 28, 4, 4, green);
    drawRect(ctx, statueX, statueBase - 27, 2, 2, greenLight);
    // Face detail
    drawPixel(ctx, statueX, statueBase - 27, greenHi);
    // Crown — 7 rays
    drawPixel(ctx, statueX - 3, statueBase - 29, greenLight);
    drawPixel(ctx, statueX - 2, statueBase - 30, greenHi);
    drawPixel(ctx, statueX - 1, statueBase - 30, greenLight);
    drawPixel(ctx, statueX, statueBase - 31, greenHi);
    drawPixel(ctx, statueX + 1, statueBase - 31, greenHi);
    drawPixel(ctx, statueX + 2, statueBase - 30, greenLight);
    drawPixel(ctx, statueX + 3, statueBase - 30, greenHi);
    drawPixel(ctx, statueX + 4, statueBase - 29, greenLight);

    // Torch arm (raised right)
    drawRect(ctx, statueX + 3, statueBase - 34, 1, 10, green);
    drawPixel(ctx, statueX + 3, statueBase - 33, greenLight);
    // Torch handle
    drawRect(ctx, statueX + 2, statueBase - 36, 3, 2, '#5a6a5a');
    // Flame
    drawPixel(ctx, statueX + 2, statueBase - 37, '#ffaa00');
    drawPixel(ctx, statueX + 3, statueBase - 38, '#ffdd44');
    drawPixel(ctx, statueX + 4, statueBase - 37, '#ffaa00');
    drawPixel(ctx, statueX + 3, statueBase - 39, '#ffcc33');
    drawPixel(ctx, statueX + 3, statueBase - 37, '#ffee66');
    // Static torch glow
    for (let dy = -4; dy <= 3; dy++) {
        for (let dx = -3; dx <= 3; dx++) {
            const d = Math.sqrt(dx*dx+dy*dy);
            if (d < 4 && d > 0) drawPixel(ctx, statueX + 3 + dx, statueBase - 38 + dy, `rgba(255,200,50,${0.1 - d*0.02})`);
        }
    }

    // Statue reflection in water — elongated
    for (let ry = 0; ry < 15; ry++) {
        const alpha = 0.1 - ry * 0.006;
        if (alpha > 0) {
            drawRect(ctx, statueX - 1, waterY + 2 + ry, 4, 1, `rgba(70,120,90,${alpha})`);
        }
    }

    // NY FERRY — drawn by animation in effects.js

    // BROOKLYN BRIDGE — with gothic arches and catenary cables
    const bridgeDeckY = Math.floor(H * 0.855);
    const towerL = Math.floor(W * 0.3);
    const towerR = Math.floor(W * 0.7);
    const towerH = 55;
    const towerW = 10;

    // Bridge deck
    drawRect(ctx, 0, bridgeDeckY, W, 4, '#5a4a3a');
    drawRect(ctx, 0, bridgeDeckY, W, 1, '#6a5a4a');
    drawRect(ctx, 0, bridgeDeckY + 3, W, 1, '#000');
    // Deck lights
    for (let x = 0; x < W; x += 6) {
        drawPixel(ctx, x, bridgeDeckY - 1, '#ffcc44');
        for (let ry = 0; ry < 5; ry++) {
            const reflY = bridgeDeckY + 8 + ry * 3;
            if (reflY < H) {
                drawPixel(ctx, x + Math.floor(Math.random() * 3) - 1, reflY, `rgba(255,200,60,${0.08 - ry * 0.01})`);
            }
        }
    }
    // Railing
    drawRect(ctx, 0, bridgeDeckY - 3, W, 1, '#4a3a2a');
    for (let x = 0; x < W; x += 3) {
        drawRect(ctx, x, bridgeDeckY - 3, 1, 3, '#5a4a3a');
    }

    // Support pillars with brick texture
    [towerL, towerR].forEach(tx => {
        const topY = bridgeDeckY + 4;
        const pillarH = H - topY;
        const pLeft = tx - towerW / 2;
        drawOutlinedRect(ctx, pLeft, topY, towerW, pillarH, '#6b5d4f');
        // Brick texture
        const pbr = 107, pbg = 93, pbb = 79;
        for (let by = topY + 1; by < H - 1; by += 3) {
            const rowOff = ((by - topY) % 6 < 3) ? 0 : 2;
            for (let bx = pLeft + 1 + rowOff; bx < pLeft + towerW - 1; bx += 4) {
                const bw = Math.min(3, pLeft + towerW - 1 - bx);
                if (bw < 2) continue;
                const v = Math.floor(Math.random() * 14) - 7;
                drawRect(ctx, bx, by, bw, 2, `rgb(${pbr+v},${pbg+v},${pbb+v})`);
                drawRect(ctx, bx, by, bw, 1, `rgba(255,220,180,0.08)`);
                drawRect(ctx, bx, by + 1, bw, 1, `rgba(0,0,0,0.1)`);
            }
            drawRect(ctx, pLeft + 1, by + 2, towerW - 2, 1, `rgba(0,0,0,0.15)`);
        }
        // Shadow right side
        drawRect(ctx, pLeft + towerW - 2, topY, 1, pillarH, 'rgba(0,0,0,0.15)');
        // Wider base at water
        drawOutlinedRect(ctx, pLeft - 1, waterY - 2, towerW + 2, 4, '#5a4d3f');
    });

    // Gothic towers with brick texture
    [towerL, towerR].forEach(tx => {
        const tBase = bridgeDeckY - towerH;
        const tLeft = tx - towerW / 2;
        // Main tower body
        drawOutlinedRect(ctx, tLeft, tBase, towerW, towerH + 4, '#6b5d4f');

        // Brick texture on tower
        const tbr = 107, tbg = 93, tbb = 79; // base color of #6b5d4f
        for (let by = tBase + 2; by < bridgeDeckY; by += 3) {
            const rowOff = ((by - tBase) % 6 < 3) ? 0 : 2;
            for (let bx = tLeft + 1 + rowOff; bx < tLeft + towerW - 1; bx += 4) {
                const bw = Math.min(3, tLeft + towerW - 1 - bx);
                if (bw < 2) continue;
                const v = Math.floor(Math.random() * 14) - 7;
                drawRect(ctx, bx, by, bw, 2, `rgb(${tbr+v},${tbg+v},${tbb+v})`);
                // Highlight top
                drawRect(ctx, bx, by, bw, 1, `rgba(255,220,180,0.08)`);
                // Shadow bottom
                drawRect(ctx, bx, by + 1, bw, 1, `rgba(0,0,0,0.1)`);
            }
            // Mortar line
            drawRect(ctx, tLeft + 1, by + 2, towerW - 2, 1, `rgba(0,0,0,0.15)`);
        }

        // Tower cap
        drawOutlinedRect(ctx, tLeft - 1, tBase, towerW + 2, 2, '#7b6d5f');
        // Pointed top
        drawOutlinedRect(ctx, tx - 2, tBase - 4, 4, 4, '#7b6d5f');
        drawOutlinedRect(ctx, tx - 1, tBase - 6, 2, 2, '#8b7d6f');

        // Gothic arch openings (two pointed arches per tower, full height to deck)
        const archW = 3;
        const archY = tBase + 10;
        const archH = bridgeDeckY - archY;
        const arch1X = tLeft + 1;
        const arch2X = tLeft + towerW - archW - 1;

        [arch1X, arch2X].forEach(ax => {
            // Water/sky visible through arch — lighter than surroundings
            for (let ay = archY; ay < archY + archH; ay++) {
                const t = (ay - archY) / archH;
                // Gradient: dark sky at top → water blue at bottom
                const r = Math.floor(8 + t * 5);
                const g = Math.floor(15 + t * 15);
                const b = Math.floor(35 + t * 20);
                drawRect(ctx, ax, ay, archW, 1, `rgb(${r},${g},${b})`);
                // Wave shimmer in lower part
                if (t > 0.5 && Math.sin(ax * 2 + ay * 0.5) > 0.3) {
                    drawRect(ctx, ax, ay, archW, 1, `rgba(60,100,140,0.15)`);
                }
            }
            // Pointed top
            drawPixel(ctx, ax + 1, archY - 1, '#0c1530');
            drawPixel(ctx, ax + 1, archY - 2, '#0c1530');
            // Arch outline (lighter to show edge)
            drawPixel(ctx, ax - 1, archY, '#5a4d3f');
            drawPixel(ctx, ax + archW, archY, '#5a4d3f');
            drawPixel(ctx, ax, archY - 1, '#5a4d3f');
            drawPixel(ctx, ax + archW - 1, archY - 1, '#5a4d3f');
            drawPixel(ctx, ax + 1, archY - 3, '#5a4d3f');
            // Side outlines along full arch
            for (let ay = archY; ay < archY + archH; ay++) {
                drawPixel(ctx, ax - 1, ay, '#4a3d2f');
                drawPixel(ctx, ax + archW, ay, '#4a3d2f');
            }
            // Railing visible through arch
            drawRect(ctx, ax, bridgeDeckY - 3, archW, 1, '#3a3028');
            for (let rx = ax; rx < ax + archW; rx++) {
                drawRect(ctx, rx, bridgeDeckY - 3, 1, 3, '#4a4038');
            }
        });

        // Shadow on right side of tower
        drawRect(ctx, tLeft + towerW - 2, tBase + 2, 1, towerH, 'rgba(0,0,0,0.15)');
        // Highlight on left side
        drawRect(ctx, tLeft + 1, tBase + 2, 1, towerH, 'rgba(255,220,180,0.06)');

        // Tower light
        drawPixel(ctx, tx, tBase - 7, '#ff4400');
        for (let d = 1; d <= 2; d++) {
            drawPixel(ctx, tx - d, tBase - 7, `rgba(255,68,0,${0.3 / d})`);
            drawPixel(ctx, tx + d, tBase - 7, `rgba(255,68,0,${0.3 / d})`);
        }
    });

    // Main catenary cables (drooping/sagging between towers)
    // Between towers — catenary curve (heavy sag)
    for (let x = towerL; x <= towerR; x++) {
        const t = (x - towerL) / (towerR - towerL);
        // Catenary: sags down in the middle using cosh-like parabola
        const sag = towerH * 0.7;
        const cableY = (bridgeDeckY - towerH) + Math.floor(sag * (1 - Math.pow(2 * t - 1, 2)) * 0.9);
        drawPixel(ctx, x, cableY, '#8a7b6b');
        // Second cable slightly higher
        const cableY2 = (bridgeDeckY - towerH) + Math.floor(sag * 0.6 * (1 - Math.pow(2 * t - 1, 2)));
        drawPixel(ctx, x, cableY2, '#6b5d4f');
        // Vertical suspender cables from main cable to deck
        if (x % 4 === 0) {
            for (let sy = cableY; sy < bridgeDeckY; sy++) {
                drawPixel(ctx, x, sy, 'rgba(100,90,70,0.35)');
            }
        }
    }
    // Outer cables — left edge to left tower (leftmost cable reaches tower top)
    for (let x = 0; x < towerL; x++) {
        const t = x / towerL;
        const sag = towerH * 0.3;
        const cableY = bridgeDeckY - Math.floor(t * towerH) + Math.floor(sag * t * (1 - t) * 2);
        drawPixel(ctx, x, cableY, '#7a6b5b');
    }
    // Outer cables — right tower to right edge (rightmost cable reaches tower top)
    for (let x = towerR; x < W; x++) {
        const t = (x - towerR) / (W - towerR);
        const sag = towerH * 0.3;
        const cableY = (bridgeDeckY - towerH) + Math.floor(t * towerH) + Math.floor(sag * t * (1 - t) * 2);
        drawPixel(ctx, x, cableY, '#7a6b5b');
    }

    // Diagonal stay cables from towers (Brooklyn Bridge signature)
    [towerL, towerR].forEach(tx => {
        const tTop = bridgeDeckY - towerH + 5;
        // Fan cables to the left
        for (let ci = 1; ci <= 6; ci++) {
            const endX = tx - ci * 8;
            if (endX < 0) continue;
            for (let t = 0; t <= 1; t += 0.02) {
                const cx = Math.floor(tx + t * (endX - tx));
                const cy = Math.floor(tTop + t * (bridgeDeckY - tTop));
                drawPixel(ctx, cx, cy, `rgba(120,100,80,${0.4 - ci * 0.04})`);
            }
        }
        // Fan cables to the right
        for (let ci = 1; ci <= 6; ci++) {
            const endX = tx + ci * 8;
            if (endX >= W) continue;
            for (let t = 0; t <= 1; t += 0.02) {
                const cx = Math.floor(tx + t * (endX - tx));
                const cy = Math.floor(tTop + t * (bridgeDeckY - tTop));
                drawPixel(ctx, cx, cy, `rgba(120,100,80,${0.4 - ci * 0.04})`);
            }
        }
    });
}


// ====== SECTION 4: STAGE ======
function drawStageScene(canvas) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width / PIXEL;
    const H = canvas.height / PIXEL;

    // Dark venue background — smooth
    for (let y = 0; y < H; y++) {
        const t = y / H;
        const r = Math.floor(5 + t * 7);
        const g = Math.floor(3 + t * 5);
        const b = Math.floor(8 + t * 12);
        drawRect(ctx, 0, y, W, 1, `rgb(${r},${g},${b})`);
    }

    // Ceiling rigging/truss — outlined
    drawRect(ctx, 0, 2, W, 4, '#1a1a1a');
    drawRect(ctx, 0, 2, W, 1, '#333');
    drawRect(ctx, 0, 5, W, 1, '#333');
    for (let x = 0; x < W; x += 6) {
        drawRect(ctx, x, 3, 1, 2, '#2a2a2a');
    }

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
        // Mount bracket
        drawRect(ctx, spotX - 1, 3, 3, 2, '#333');
        // Housing (dark metal)
        drawRect(ctx, spotX - 2, 5, 5, 3, '#222');
        drawRect(ctx, spotX - 2, 5, 5, 1, '#2a2a2a');
        // Lens (colored)
        drawRect(ctx, spotX - 1, 7, 3, 1, `rgb(${color.r},${color.g},${color.b})`);
        // Bright center
        drawPixel(ctx, spotX, 7, '#fff');
        // Lens glow
        drawRect(ctx, spotX - 2, 8, 5, 1, `rgba(${color.r},${color.g},${color.b},0.3)`);
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
    const stageY = Math.floor(H * 0.855);
    const stageLeft = Math.floor(W * 0.08);
    const stageRight = Math.floor(W * 0.92);
    const stageW = stageRight - stageLeft;

    // Venue floor — from left edge to stage, same color as stage
    const floorColor = '#1a1a22';
    drawRect(ctx, 0, stageY, W, H - stageY, floorColor);
    // Slight gradient on floor
    for (let y = stageY; y < H; y++) {
        const t = (y - stageY) / (H - stageY);
        const c = Math.floor(26 - t * 10);
        drawRect(ctx, 0, y, W, 1, `rgba(${c},${c},${c + 8},0.5)`);
    }

    // Stage edge highlight
    drawRect(ctx, 0, stageY, W, 2, '#050508');

    // SPEAKERS (left & right on stage)
    [stageLeft + 2, stageRight - 12].forEach(spX => {
        for (let sy = 0; sy < 3; sy++) {
            const spY = stageY - 21 + sy * 7;
            drawRect(ctx, spX, spY, 10, 7, '#1a1a1a');
            drawRect(ctx, spX, spY, 10, 1, '#333');
            drawRect(ctx, spX + 2, spY + 2, 6, 4, '#222');
            drawRect(ctx, spX + 3, spY + 3, 4, 2, '#2a2a2a');
            drawPixel(ctx, spX + 4, spY + 3, '#333');
        }
    });

    // HANGING SPEAKERS (ceiling, far left & right edges)
    [2, W - 12].forEach(spX => {
        // Chain/mount from ceiling
        drawRect(ctx, spX + 4, 6, 1, 6, '#444');
        drawRect(ctx, spX + 5, 6, 1, 6, '#333');
        // Speaker box
        for (let sy = 0; sy < 2; sy++) {
            const spY = 12 + sy * 7;
            drawRect(ctx, spX, spY, 10, 7, '#1a1a1a');
            drawRect(ctx, spX, spY, 10, 1, '#333');
            drawRect(ctx, spX + 9, spY, 1, 7, '#111');
            // Cones
            drawRect(ctx, spX + 2, spY + 2, 6, 4, '#222');
            drawRect(ctx, spX + 3, spY + 3, 4, 2, '#2a2a2a');
            drawPixel(ctx, spX + 4, spY + 3, '#333');
        }
        // Bottom bracket
        drawRect(ctx, spX, 26, 10, 1, '#333');
    });

    // INSTRUMENTS — positioned centered on each musician
    const centerX = Math.floor(W * 0.5);
    const mic1X = centerX - 32;   // Саша (bass) — mic + bass guitar
    const mic2X = centerX;        // Іван (vocals/guitar) — mic + electric guitar
    const drumCX = centerX + 32;  // Денис (drums) — drum kit

    // On mobile, skip background instruments (foreground JS-scaled ones are shown instead)
    if (W >= 120) {
    // ── MIC STAND 1 (Саша) with bass guitar leaning ──
    drawRect(ctx, mic1X, stageY - 16, 1, 16, '#888');
    drawRect(ctx, mic1X - 1, stageY, 3, 1, '#666');
    drawRect(ctx, mic1X - 1, stageY - 18, 3, 2, '#444');
    drawPixel(ctx, mic1X, stageY - 18, '#555');
    // Bass guitar — Precision Bass style, leaning right (RED)
    // Body — wider, rounded shape
    drawRect(ctx, mic1X - 7, stageY - 10, 6, 8, '#cc1111');
    drawRect(ctx, mic1X - 8, stageY - 9, 1, 6, '#cc1111');
    drawRect(ctx, mic1X - 1, stageY - 9, 1, 6, '#cc1111');
    drawRect(ctx, mic1X - 6, stageY - 11, 4, 1, '#cc1111');
    drawRect(ctx, mic1X - 6, stageY - 2, 4, 1, '#cc1111');
    // Body highlights
    drawRect(ctx, mic1X - 6, stageY - 9, 4, 1, '#dd3333');
    drawPixel(ctx, mic1X - 7, stageY - 8, '#dd2222');
    // Pickguard
    drawRect(ctx, mic1X - 6, stageY - 8, 4, 3, '#f0e8d8');
    drawRect(ctx, mic1X - 5, stageY - 9, 2, 1, '#f0e8d8');
    // Pickups
    drawRect(ctx, mic1X - 5, stageY - 7, 3, 1, '#333');
    drawRect(ctx, mic1X - 5, stageY - 5, 3, 1, '#333');
    // Bridge
    drawRect(ctx, mic1X - 5, stageY - 3, 3, 1, '#999');
    // Knobs
    drawPixel(ctx, mic1X - 3, stageY - 4, '#ddd');
    drawPixel(ctx, mic1X - 2, stageY - 4, '#ddd');
    // Neck — going up-right diagonal (2px wide)
    for (let i = 0; i < 8; i++) {
        drawPixel(ctx, mic1X - 1 + i, stageY - 12 - i, '#8b6535');
        drawPixel(ctx, mic1X + 0 + i, stageY - 12 - i, '#7a5525');
    }
    // Fret markers
    drawPixel(ctx, mic1X + 1, stageY - 14, '#c8b080');
    drawPixel(ctx, mic1X + 4, stageY - 17, '#c8b080');
    // Strings (thin line along neck)
    for (let i = 0; i < 8; i++) {
        drawPixel(ctx, mic1X - 1 + i, stageY - 12 - i, '#aaa');
    }
    // Headstock
    drawRect(ctx, mic1X + 7, stageY - 21, 2, 3, '#8b6535');
    drawPixel(ctx, mic1X + 6, stageY - 20, '#8b6535');
    // Tuning pegs
    drawPixel(ctx, mic1X + 9, stageY - 21, '#ccc');
    drawPixel(ctx, mic1X + 9, stageY - 20, '#ccc');
    drawPixel(ctx, mic1X + 9, stageY - 19, '#ccc');
    drawPixel(ctx, mic1X + 6, stageY - 21, '#ccc');

    // ── MIC STAND 2 (Іван) with electric guitar leaning ──
    drawRect(ctx, mic2X, stageY - 16, 1, 16, '#888');
    drawRect(ctx, mic2X - 1, stageY, 3, 1, '#666');
    drawRect(ctx, mic2X - 1, stageY - 18, 3, 2, '#444');
    drawPixel(ctx, mic2X, stageY - 18, '#555');
    // Electric guitar — Stratocaster style, leaning left (BLACK)
    // Body — curvy double cutaway
    drawRect(ctx, mic2X + 2, stageY - 10, 6, 8, '#1a1a1a');
    drawRect(ctx, mic2X + 8, stageY - 9, 1, 6, '#1a1a1a');
    drawRect(ctx, mic2X + 1, stageY - 9, 1, 6, '#1a1a1a');
    drawRect(ctx, mic2X + 3, stageY - 11, 4, 1, '#1a1a1a');
    drawRect(ctx, mic2X + 3, stageY - 2, 4, 1, '#1a1a1a');
    // Body highlights
    drawRect(ctx, mic2X + 3, stageY - 9, 4, 1, '#2a2a2a');
    drawPixel(ctx, mic2X + 7, stageY - 8, '#222');
    // Pickguard
    drawRect(ctx, mic2X + 3, stageY - 8, 4, 3, '#f5f0e0');
    drawRect(ctx, mic2X + 4, stageY - 9, 2, 1, '#f5f0e0');
    // Pickups (3 single coils — strat style)
    drawRect(ctx, mic2X + 4, stageY - 7, 2, 1, '#222');
    drawRect(ctx, mic2X + 4, stageY - 6, 2, 1, '#222');
    drawRect(ctx, mic2X + 4, stageY - 5, 2, 1, '#222');
    // Bridge / tremolo
    drawRect(ctx, mic2X + 4, stageY - 3, 2, 1, '#aaa');
    drawPixel(ctx, mic2X + 6, stageY - 3, '#888');
    // Knobs
    drawPixel(ctx, mic2X + 3, stageY - 4, '#fff');
    drawPixel(ctx, mic2X + 7, stageY - 5, '#fff');
    // Neck — going up-left diagonal (2px wide)
    for (let i = 0; i < 8; i++) {
        drawPixel(ctx, mic2X + 1 - i, stageY - 12 - i, '#8b6535');
        drawPixel(ctx, mic2X + 0 - i, stageY - 12 - i, '#7a5525');
    }
    // Fret markers
    drawPixel(ctx, mic2X - 1, stageY - 14, '#c8b080');
    drawPixel(ctx, mic2X - 4, stageY - 17, '#c8b080');
    // Strings
    for (let i = 0; i < 8; i++) {
        drawPixel(ctx, mic2X + 1 - i, stageY - 12 - i, '#aaa');
    }
    // Headstock — Fender style
    drawRect(ctx, mic2X - 8, stageY - 21, 2, 3, '#1a1a1a');
    drawPixel(ctx, mic2X - 6, stageY - 20, '#1a1a1a');
    // Tuning pegs
    drawPixel(ctx, mic2X - 10, stageY - 21, '#ccc');
    drawPixel(ctx, mic2X - 10, stageY - 20, '#ccc');
    drawPixel(ctx, mic2X - 10, stageY - 19, '#ccc');
    drawPixel(ctx, mic2X - 7, stageY - 21, '#ccc');

    // ── DRUM KIT (Денис) — centered on his position ──
    const drumX = drumCX - 5;
    const drumY = stageY;
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
    drawRect(ctx, drumX - 3, drumY - 11, 1, 11, '#666');
    drawRect(ctx, drumX - 4, drumY, 3, 1, '#666');
    drawRect(ctx, drumX + 12, drumY - 13, 1, 13, '#666');
    drawRect(ctx, drumX + 11, drumY, 3, 1, '#666');
    drawRect(ctx, drumX - 5, drumY - 9, 1, 9, '#666');
    drawRect(ctx, drumX - 6, drumY, 3, 1, '#666');
    } // end desktop-only instruments

    // STAGE LOGO — BIG "5051" neon style
    const gs = 3; // scale 3x
    const logoTotalW = (5 + 1 + 5 + 1 + 5 + 1 + 5) * gs; // 23 * 3 = 69
    const logoX = Math.floor(W * 0.5) - Math.floor(logoTotalW / 2);
    const logoY = stageY - 38 - 6 * gs;

    const drawChar5 = (ox, oy, c, s) => {
        drawRect(ctx, ox, oy, 5*s, s, c);
        drawRect(ctx, ox, oy+s, s, s, c);
        drawRect(ctx, ox, oy+2*s, 4*s, s, c);
        drawRect(ctx, ox+3*s, oy+3*s, s, s, c);
        drawRect(ctx, ox+3*s, oy+4*s, s, s, c);
        drawRect(ctx, ox, oy+5*s, 4*s, s, c);
    };
    const drawChar0 = (ox, oy, c, s) => {
        drawRect(ctx, ox, oy, 5*s, s, c);
        drawRect(ctx, ox, oy+5*s, 5*s, s, c);
        drawRect(ctx, ox, oy, s, 6*s, c);
        drawRect(ctx, ox+4*s, oy, s, 6*s, c);
    };
    const drawChar1 = (ox, oy, c, s) => {
        drawRect(ctx, ox+2*s, oy, s, 6*s, c);
        drawRect(ctx, ox+s, oy+s, s, s, c);
        drawRect(ctx, ox, oy+5*s, 5*s, s, c);
    };

    const sp = 6 * gs; // spacing between chars

    // Dark background behind logo
    drawRect(ctx, logoX - 4, logoY - 4, logoTotalW + 8, 6 * gs + 8, 'rgba(0,0,0,0.5)');

    // Red glow behind
    for (let dy = -6; dy <= 6 * gs + 6; dy++) {
        for (let dx = -6; dx <= logoTotalW + 6; dx++) {
            drawPixel(ctx, logoX + dx, logoY + dy, 'rgba(255,0,0,0.04)');
        }
    }

    // Shadow layer
    drawChar5(logoX + 2, logoY + 2, '#440000', gs);
    drawChar0(logoX + sp + 2, logoY + 2, '#440000', gs);
    drawChar5(logoX + sp * 2 + 2, logoY + 2, '#440000', gs);
    drawChar1(logoX + sp * 3 + 2, logoY + 2, '#440000', gs);

    // Black outline layer
    drawChar5(logoX + 1, logoY + 1, '#000', gs);
    drawChar0(logoX + sp + 1, logoY + 1, '#000', gs);
    drawChar5(logoX + sp * 2 + 1, logoY + 1, '#000', gs);
    drawChar1(logoX + sp * 3 + 1, logoY + 1, '#000', gs);

    // Main red
    drawChar5(logoX, logoY, '#ee2222', gs);
    drawChar0(logoX + sp, logoY, '#ee2222', gs);
    drawChar5(logoX + sp * 2, logoY, '#ee2222', gs);
    drawChar1(logoX + sp * 3, logoY, '#ee2222', gs);

    // Bright highlight on top edge
    drawChar5(logoX, logoY, '#ff4444', gs);
    drawRect(ctx, logoX, logoY, 5 * gs, 1, '#ff6666');
    drawRect(ctx, logoX + sp, logoY, 5 * gs, 1, '#ff6666');
    drawRect(ctx, logoX + sp * 2, logoY, 5 * gs, 1, '#ff6666');
    drawRect(ctx, logoX + sp * 3, logoY, 5 * gs, 1, '#ff6666');

    // CROWD — detailed with colored shirts and phone screens
    const crowdY = stageY + 12;
    const shirtColors = ['#1a1a2a', '#2a1a1a', '#1a2a1a', '#2a2a1a', '#1a1a3a', '#2a1a2a', '#1a2a2a'];
    for (let row = 0; row < 6; row++) {
        const rowY = crowdY + row * 6;
        const shade = Math.floor(15 + row * 8);
        for (let x = 0; x < W; x += 3) {
            const headH = 3 + Math.floor(Math.random() * 3);
            const skinShade = shade + Math.floor(Math.random() * 10);
            // Head with slight color variation
            drawRect(ctx, x, rowY - headH, 2, headH, `rgb(${skinShade + 5},${skinShade},${skinShade - 2})`);
            // Hair (darker top)
            drawRect(ctx, x, rowY - headH, 2, 1, `rgb(${Math.floor(shade * 0.5)},${Math.floor(shade * 0.4)},${Math.floor(shade * 0.4)})`);
            // Body with colored shirt
            const shirt = shirtColors[Math.floor(Math.random() * shirtColors.length)];
            drawRect(ctx, x - 1, rowY, 3, 4 + row, shirt);
            // Raised hands
            if (Math.random() > 0.65) {
                const handX = x + (Math.random() > 0.5 ? -1 : 2);
                drawRect(ctx, handX, rowY - headH - 4, 1, 4, `rgb(${skinShade},${skinShade},${skinShade})`);
                // Phone screen in hand (some)
                if (Math.random() > 0.6) {
                    drawPixel(ctx, handX, rowY - headH - 5, '#4488ff');
                    drawPixel(ctx, handX, rowY - headH - 4, '#3377ee');
                }
            }
            // Shoulders
            if (row < 3) {
                drawPixel(ctx, x - 1, rowY - 1, shirt);
                drawPixel(ctx, x + 2, rowY - 1, shirt);
            }
        }
    }

    // Camera flashes in crowd — more and brighter
    for (let i = 0; i < 8; i++) {
        const fx = Math.floor(Math.random() * W);
        const fy = crowdY + Math.floor(Math.random() * 25);
        drawPixel(ctx, fx, fy, '#fff');
        drawPixel(ctx, fx - 1, fy, 'rgba(255,255,255,0.6)');
        drawPixel(ctx, fx + 1, fy, 'rgba(255,255,255,0.6)');
        drawPixel(ctx, fx, fy - 1, 'rgba(255,255,255,0.3)');
        drawPixel(ctx, fx, fy + 1, 'rgba(255,255,255,0.3)');
    }

    // MONITOR WEDGES on stage front
    for (let mx = stageLeft + 15; mx < stageRight - 15; mx += 25) {
        drawRect(ctx, mx, stageY + 10, 8, 4, '#2a2a2a');
        drawRect(ctx, mx, stageY + 10, 8, 1, '#444');
        drawRect(ctx, mx + 1, stageY + 11, 6, 2, '#333');
    }

    // Stage front lights (on top of everything)
    for (let x = stageLeft + 10; x < stageRight - 10; x += 25) {
        drawRect(ctx, x, stageY, 2, 1, '#ffcc00');
        drawPixel(ctx, x, stageY - 1, 'rgba(255,204,0,0.4)');
        drawPixel(ctx, x + 1, stageY - 1, 'rgba(255,204,0,0.4)');
    }

    // === PUNK VIBE EXTRAS ===


    // Crowd hands holding lighters/phones at edges
    for (let i = 0; i < 6; i++) {
        const lx = Math.floor(Math.random() * W);
        const ly = crowdY + Math.floor(Math.random() * 10) - 8;
        if (Math.random() > 0.5) {
            // Lighter flame
            drawPixel(ctx, lx, ly, '#ffaa22');
            drawPixel(ctx, lx, ly - 1, '#ffcc44');
        }
    }
}


// ====== SECTION 5: MANHATTAN BAR ======
function drawPubScene(canvas) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width / PIXEL;
    const H = canvas.height / PIXEL;

    // Dark moody interior
    for (let y = 0; y < H; y++) {
        const t = y / H;
        drawRect(ctx, 0, y, W, 1, `rgb(${Math.floor(12+t*8)},${Math.floor(10+t*6)},${Math.floor(14+t*8)})`);
    }

    const wallTop = Math.floor(H * 0.06);
    const wallBot = Math.floor(H * 0.62);
    const isMobilePub = (window.innerWidth <= 768);
    const barY = Math.floor(H * (isMobilePub ? 0.895 : 0.855));
    const barH = 10;
    const barTop = barY - barH;
    const barLeft = Math.floor(W * 0.12);
    const barRight = Math.floor(W * 0.88);
    const barW = barRight - barLeft;
    const centerX = Math.floor(W * 0.5);

    // ── CEILING ──
    drawRect(ctx, 0, 0, W, wallTop, '#0e0c10');
    for (let x = 0; x < W; x += 5) { drawRect(ctx,x,wallTop,4,2,'#3a1a0a'); drawRect(ctx,x,wallTop,4,1,'#4a2a1a'); }
    for (let x = 0; x < W; x += 8) { drawRect(ctx,x,wallTop-4,7,3,'#1a1820'); drawRect(ctx,x+1,wallTop-3,5,1,'#222028'); }

    // ── BACK WALL ──
    for (let y = wallTop+2; y < wallBot; y++) {
        const t=(y-wallTop)/(wallBot-wallTop);
        drawRect(ctx,0,y,W,1,`rgb(${Math.floor(22+t*4)},${Math.floor(20+t*3)},${Math.floor(25+t*5)})`);
    }
    for (let y = wallTop+2; y < wallBot; y += 6) drawRect(ctx,0,y,W,1,'rgba(0,0,0,0.15)');

    // ── SAME STREET in both windows ──
    // Shared street: buildings, sidewalk, road — continuous scene
    const winY = wallTop + 14;
    const winW = 35;
    const winH = 32;
    const winX1 = Math.floor(W * 0.05);
    const win2X = Math.floor(W * 0.82);
    // Gap between windows in "street world" = wall thickness ~60px
    const wallGap = 8; // pixels the taxi is hidden between windows

    // Draw window helper
    function drawWindow(wx) {
        // Frame
        drawRect(ctx, wx-2, winY-2, winW+4, winH+4, '#1a1a1a');
        drawRect(ctx, wx-1, winY-1, winW+2, winH+2, '#2a2a2a');
        // Night sky
        for (let y=0; y<winH; y++) {
            const t=y/winH;
            drawRect(ctx, wx, winY+y, winW, 1, `rgb(${Math.floor(6+t*12)},${Math.floor(6+t*10)},${Math.floor(18+t*18)})`);
        }
        // Skyline — same buildings in both windows
        const bldgs = [
            {x:0,w:3,h:16},{x:3,w:4,h:20},{x:7,w:2,h:12},{x:9,w:5,h:24},{x:14,w:3,h:15},
            {x:17,w:4,h:22},{x:21,w:2,h:10},{x:23,w:3,h:18},{x:26,w:4,h:25},{x:30,w:3,h:14},{x:33,w:2,h:19}
        ];
        bldgs.forEach(b => {
            const bx=wx+b.x, by=winY+winH-4-b.h;
            drawRect(ctx, bx, by, b.w, b.h, '#080810');
            for (let wy=by+2; wy<winY+winH-6; wy+=3) for (let bwx=bx+1; bwx<bx+b.w-1; bwx+=2) {
                if (Math.random()>0.4) drawPixel(ctx, bwx, wy, Math.random()>0.7?'#ffdd66':'#ffe8aa');
            }
        });
        // Antenna
        drawRect(ctx, wx+27, winY+winH-33, 1, 4, '#080810');
        // Stars
        drawPixel(ctx, wx+5, winY+3, '#aaa'); drawPixel(ctx, wx+18, winY+2, '#888');
        drawPixel(ctx, wx+30, winY+4, '#999'); drawPixel(ctx, wx+12, winY+5, '#777');
        // Sidewalk + street
        drawRect(ctx, wx, winY+winH-4, winW, 1, '#444448'); // curb
        drawRect(ctx, wx, winY+winH-3, winW, 3, '#222228'); // road
        // Street lamp
        drawRect(ctx, wx+4, winY+winH-14, 1, 10, '#555');
        drawRect(ctx, wx+3, winY+winH-15, 3, 1, '#555');
        drawPixel(ctx, wx+4, winY+winH-15, '#ffcc66');
        // Lamp glow
        for (let d=1;d<4;d++) { drawRect(ctx, wx+4-d, winY+winH-15+d, d*2+1, 1, `rgba(255,200,100,${0.04-d*0.01})`); }
        // Fire hydrant
        drawRect(ctx, wx+28, winY+winH-7, 2, 3, '#cc2222');
        drawPixel(ctx, wx+28, winY+winH-8, '#cc2222');
        // Cross bars
        drawRect(ctx, wx, winY+Math.floor(winH*0.45), winW, 1, '#2a2a2a');
    }
    drawWindow(winX1);
    drawWindow(win2X);
    // Moon (only left window)
    drawPixel(ctx, winX1+3, winY+2, '#eeeedd'); drawPixel(ctx, winX1+4, winY+2, '#dddccc');


    // ── SHELVES + BOTTLES (3 shelves, more bottles) ──
    const shelfY = wallBot - 24;
    // Mirror behind bottles
    drawRect(ctx, Math.floor(W*0.18), shelfY-12, Math.floor(W*0.64), 11, '#141420');
    drawRect(ctx, Math.floor(W*0.18), shelfY-12, Math.floor(W*0.64), 1, '#2a2a33');
    for (let x=Math.floor(W*0.2); x<Math.floor(W*0.8); x+=3) {
        drawPixel(ctx, x, shelfY-8, 'rgba(255,255,255,0.03)');
        drawPixel(ctx, x, shelfY-5, 'rgba(255,255,255,0.02)');
    }
    // 3 shelves
    for (let s=0; s<3; s++) {
        const sy2 = shelfY + s * 9;
        drawRect(ctx, Math.floor(W*0.18), sy2-1, Math.floor(W*0.64), 1, 'rgba(255,200,100,0.05)');
        drawRect(ctx, Math.floor(W*0.18), sy2, Math.floor(W*0.64), 1, '#222');
    }
    const bColors = ['#1a5a2a','#7a1800','#cc8800','#0a3a7a','#5a0a3a','#aa6600','#0a4422','#771818','#2a6688','#665522','#2a2a8a','#8a4400','#336633','#993355','#bb7700'];
    for (let i=0; i<42; i++) {
        const row = Math.floor(i/14);
        const col = i % 14;
        const bx = Math.floor(W*0.20) + col * Math.floor(W*0.043);
        const shelf = shelfY + row * 9;
        const bc = bColors[i % bColors.length];
        const bH = 4 + (col%4);
        drawRect(ctx, bx, shelf-bH, 2, bH, bc);
        drawRect(ctx, bx, shelf-bH-2, 1, 2, bc);
        drawPixel(ctx, bx, shelf-bH-3, '#aaa');
        drawRect(ctx, bx, shelf-bH+1, 2, 1, 'rgba(255,255,255,0.15)');
        drawPixel(ctx, bx+1, shelf-bH, 'rgba(255,255,255,0.1)');
    }

    // ── BAR COUNTER ──
    for (let y=barTop+3; y<barY; y++) {
        const t=(y-barTop)/barH; const c=Math.floor(16+t*5+Math.sin(t*10)*2);
        drawRect(ctx, barLeft, y, barW, 1, `rgb(${c},${c-2},${c+2})`);
    }
    for (let x=barLeft; x<barRight; x+=8) for (let y=barTop+4;y<barY;y++) drawPixel(ctx,x,y,'rgba(0,0,0,0.1)');
    drawRect(ctx, barLeft, barTop+4, barW, 1, '#6a5828');
    // Marble top
    drawRect(ctx, barLeft-1, barTop-1, barW+2, 1, '#333340');
    drawRect(ctx, barLeft-1, barTop, barW+2, 1, '#1a1a22');
    drawRect(ctx, barLeft-1, barTop+1, barW+2, 1, '#222230');
    drawRect(ctx, barLeft-1, barTop+2, barW+2, 1, '#181820');
    for (let x=barLeft; x<barRight; x+=5) drawPixel(ctx,x,barTop+1,'rgba(255,255,255,0.05)');
    // Foot rail
    drawRect(ctx, barLeft+2, barY-2, barW-4, 1, '#aa8822');
    drawRect(ctx, barLeft+2, barY-1, barW-4, 1, '#886618');

    // ── BEER TAPS (5) ──
    [centerX-10,centerX-4,centerX+2,centerX+8,centerX+14].forEach((tx,i) => {
        const tapC=['#222','#cc7700','#aa1100','#1a4a1a','#884411'][i];
        drawRect(ctx,tx,barTop-6,2,5,tapC); drawRect(ctx,tx-1,barTop-7,4,1,tapC);
        drawPixel(ctx,tx,barTop-7,'#ddd'); drawRect(ctx,tx-1,barTop-1,4,1,'#555');
    });
    drawRect(ctx, centerX-12, barTop-1, 28, 1, '#444');
    drawRect(ctx, centerX-11, barTop+1, 26, 1, '#333');

    // ── BAR STOOLS ──
    [centerX-32, centerX, centerX+32].forEach(sx => {
        drawRect(ctx,sx-4,barY+1,8,1,'#1a1a1a'); drawRect(ctx,sx-3,barY+2,6,2,'#222');
        drawRect(ctx,sx-4,barY+2,1,1,'#2a2a2a'); drawRect(ctx,sx+3,barY+2,1,1,'#2a2a2a');
        drawRect(ctx,sx-1,barY+4,2,5,'#555'); drawRect(ctx,sx-3,barY+9,6,1,'#444');
    });

    // ── FLOOR ──
    for (let y=barY; y<H; y++) {
        const t=(y-barY)/(H-barY);
        drawRect(ctx,0,y,W,1,`rgb(${Math.floor(20+t*4)},${Math.floor(16+t*3)},${Math.floor(12+t*2)})`);
    }
    for (let x=0;x<W;x+=10) for (let y=barY;y<H;y++) drawPixel(ctx,x,y,'rgba(0,0,0,0.08)');

    // ── PENDANT LIGHTS ──
    [W*0.15, W*0.35, W*0.5, W*0.65, W*0.85].forEach(lx => {
        const x=Math.floor(lx);
        for (let y=0;y<wallTop+4;y++) drawPixel(ctx,x,y,'#444');
        drawRect(ctx,x-2,wallTop+4,5,1,'#333'); drawRect(ctx,x-3,wallTop+5,7,4,'#222');
        drawRect(ctx,x-2,wallTop+9,5,1,'#333');
        drawPixel(ctx,x-3,wallTop+6,'#444'); drawPixel(ctx,x+3,wallTop+6,'#444');
        drawPixel(ctx,x-3,wallTop+8,'#444'); drawPixel(ctx,x+3,wallTop+8,'#444');
        drawRect(ctx,x-1,wallTop+6,3,2,'#ffbb44'); drawPixel(ctx,x,wallTop+5,'#ffcc66');
        for (let d=1;d<30;d++) { const w=Math.floor(d*0.7), a=0.04*(1-d/30); for (let dx=-w;dx<=w;dx++) drawPixel(ctx,x+dx,wallTop+10+d,`rgba(255,190,80,${a})`); }
    });

    // ── DARTBOARD (right wall) ──
    const dartX=Math.floor(W*0.93), dartY=Math.floor(H*0.45);
    // Backboard
    drawRect(ctx, dartX-9, dartY-9, 18, 18, '#2a1a0a');
    for (let dy=-8;dy<=8;dy++) for (let dx=-8;dx<=8;dx++) {
        const dist=Math.sqrt(dx*dx+dy*dy);
        if (dist<=8) {
            let c;
            if(dist<=1) c='#ee1111';
            else if(dist<=2) c='#11aa44';
            else if(dist<=3.5) c='#ee1111';
            else if(dist<=4.5) c='#eeeedd';
            else if(dist<=5.5) c='#11aa44';
            else if(dist<=6.5) c='#ee1111';
            else if(dist<=7.5) c='#1a1a1a';
            else c='#eeeedd';
            drawPixel(ctx,dartX+dx,dartY+dy,c);
        }
    }
    // Wire frame
    for (let a=0;a<Math.PI*2;a+=Math.PI/6) {
        for (let r=2;r<=8;r++) drawPixel(ctx,dartX+Math.round(Math.cos(a)*r),dartY+Math.round(Math.sin(a)*r),'rgba(150,150,150,0.3)');
    }
    // Darts stuck in board
    drawPixel(ctx,dartX+3,dartY-2,'#888'); drawPixel(ctx,dartX+4,dartY-3,'#aaa');
    drawPixel(ctx,dartX+5,dartY-4,'#cc3333'); drawPixel(ctx,dartX+5,dartY-5,'#cc3333');
    drawPixel(ctx,dartX-2,dartY+1,'#888'); drawPixel(ctx,dartX-3,dartY+1,'#aaa');
    drawPixel(ctx,dartX-4,dartY+1,'#3366cc'); drawPixel(ctx,dartX-5,dartY+1,'#3366cc');

    // ── FRAMED PHOTOS (2) ──
    const photoX=Math.floor(W*0.05), photoY=Math.floor(H*0.50);
    drawRect(ctx,photoX-1,photoY-1,14,12,'#2a2a2a'); drawRect(ctx,photoX,photoY,12,10,'#181818');
    drawRect(ctx,photoX+2,photoY+4,2,5,'#444'); drawRect(ctx,photoX+2,photoY+3,2,1,'#555');
    drawRect(ctx,photoX+5,photoY+3,2,6,'#444'); drawRect(ctx,photoX+5,photoY+2,2,1,'#555');
    drawRect(ctx,photoX+8,photoY+4,2,5,'#444'); drawRect(ctx,photoX+8,photoY+3,2,1,'#555');
    // Second photo
    const p2x=Math.floor(W*0.05), p2y=photoY-16;
    drawRect(ctx,p2x-1,p2y-1,14,12,'#3a2a1a'); drawRect(ctx,p2x,p2y,12,10,'#1a1a1a');
    drawRect(ctx,p2x+1,p2y+2,10,6,'#333'); // concert shot
    for (let i=0;i<5;i++) drawPixel(ctx,p2x+2+i*2,p2y+6,'#ffdd66');


    // ── EXPOSED BRICK (left wall only) ──
    for (let y=wallBot-12;y<wallBot;y+=3) for (let x=0;x<Math.floor(W*0.05);x+=5) { drawRect(ctx,x,y,4,2,'#3a1a0a'); drawRect(ctx,x,y,4,1,'#4a2a15'); }

}

// ====== INITIALIZATION ======
function initScenes() {
    const sections = [
        { selector: '.section-home .home-bg', draw: drawHomeScene },
        { selector: '.section-about .about-bg', draw: drawBrooklynScene },
        { selector: '.section-live .live-bg', draw: drawLiveScene },
        { selector: '.section-stage .stage-bg', draw: drawStageScene },
        { selector: '.section-pub .pub-bg', draw: drawPubScene }
    ];

    const canvases = [];

    sections.forEach(({ selector, draw }) => {
        const container = document.querySelector(selector);
        if (!container) return;

        const canvas = document.createElement('canvas');
        canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;image-rendering:pixelated;z-index:0;';

        container.insertBefore(canvas, container.firstChild);
        canvases.push({ canvas, container, draw });
    });

    function drawAll() {
        canvases.forEach(({ canvas, container, draw }) => {
            canvas.width = container.offsetWidth;
            canvas.height = container.offsetHeight;
            draw(canvas);
        });
    }

    drawAll();
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
        document.querySelectorAll('.home-bg canvas, .about-bg canvas, .live-bg canvas, .stage-bg canvas, .pub-bg canvas').forEach(c => c.remove());
        initScenes();
    }, 300);
});
