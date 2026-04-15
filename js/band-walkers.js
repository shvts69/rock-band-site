/* ========================================
   BAND WALKERS — 3 Pixel Art Musicians
   Adidas tracksuits, walk synced to scroll
   ======================================== */

(function() {
    const P = 4;
    const STRIPE = '#e8e8e8';

    // idx 0 = Денис (blue, bob/каре), 1 = Іван (red, stubble, light hair), 2 = Саша (black, man bun)
    const PAL = [
        {
            outline: '#080808',
            skin: '#e8b87a', skinDk: '#c49458', skinLt: '#f5d4a0',
            hair: '#2a1c10', hairHi: '#3a2c20',
            suit: '#1a55bb', suitHi: '#2a77dd', suitDk: '#0a3388',
            shoes: '#eee', shoesHi: '#fff', shoesDk: '#bbb',
            eyeW: '#e8e8e8', eye: '#1a2a3a',
            mouth: '#994433',
            stubble: null,
        },
        {
            outline: '#080808',
            skin: '#e8b87a', skinDk: '#c49458', skinLt: '#f5d4a0',
            hair: '#8b6b3a', hairHi: '#a8844a',   // світліше волосся
            suit: '#bb1818', suitHi: '#dd3333', suitDk: '#880808',
            shoes: '#eee', shoesHi: '#fff', shoesDk: '#bbb',
            eyeW: '#e8e8e8', eye: '#2a1a0a',
            mouth: '#994433',
            stubble: '#9a7a4a',  // щетина
        },
        {
            outline: '#080808',
            skin: '#e8b87a', skinDk: '#c49458', skinLt: '#f5d4a0',
            hair: '#1a1008', hairHi: '#2d1e10',
            suit: '#1a1a1a', suitHi: '#303030', suitDk: '#0c0c0c',
            shoes: '#eee', shoesHi: '#fff', shoesDk: '#bbb',
            eyeW: '#e8e8e8', eye: '#1a3020',
            mouth: '#994433',
            stubble: null,
        }
    ];

    function px(ctx, x, y, c) {
        if (!c) return;
        ctx.fillStyle = c;
        ctx.fillRect(x, y, 1, 1);
    }
    function hl(ctx, x, y, len, c) {
        if (!c) return;
        ctx.fillStyle = c;
        ctx.fillRect(x, y, len, 1);
    }

    // =============================================
    // HAIR — FRONT VIEW (per character)
    // =============================================
    function drawHairFront(ctx, ox, oy, p, idx) {
        if (idx === 0) {
            // ── КАРЕ (bob) — Денис ──
            hl(ctx, ox+4, oy-1, 10, p.hair);
            px(ctx, ox+6, oy-1, p.hairHi);
            hl(ctx, ox+3, oy+0, 12, p.hair);
            px(ctx, ox+5, oy+0, p.hairHi); px(ctx, ox+6, oy+0, p.hairHi);
            hl(ctx, ox+3, oy+1, 12, p.hair);
            px(ctx, ox+5, oy+1, p.hairHi); px(ctx, ox+7, oy+1, p.hairHi);
            hl(ctx, ox+2, oy+2, 14, p.hair);
            px(ctx, ox+4, oy+2, p.hairHi); px(ctx, ox+5, oy+2, p.hairHi);
            hl(ctx, ox+2, oy+3, 14, p.hair);
            px(ctx, ox+2, oy+4, p.hair); px(ctx, ox+3, oy+4, p.hair);
            px(ctx, ox+14, oy+4, p.hair); px(ctx, ox+15, oy+4, p.hair);
            px(ctx, ox+2, oy+5, p.hair); px(ctx, ox+3, oy+5, p.hair);
            px(ctx, ox+14, oy+5, p.hair); px(ctx, ox+15, oy+5, p.hair);
            px(ctx, ox+2, oy+6, p.hair); px(ctx, ox+3, oy+6, p.hair);
            px(ctx, ox+14, oy+6, p.hair); px(ctx, ox+15, oy+6, p.hair);
            px(ctx, ox+2, oy+7, p.hair); px(ctx, ox+3, oy+7, p.hair);
            px(ctx, ox+14, oy+7, p.hair); px(ctx, ox+15, oy+7, p.hair);
            px(ctx, ox+2, oy+8, p.hair);
            px(ctx, ox+15, oy+8, p.hair);
            px(ctx, ox+2, oy+9, p.hairHi);
            px(ctx, ox+15, oy+9, p.hairHi);
        } else if (idx === 1) {
            // ── SHORT MESSY HAIR — Іван ──
            hl(ctx, ox+5, oy+0, 8, p.hair);
            px(ctx, ox+5, oy+0, p.hairHi); px(ctx, ox+10, oy+0, p.hairHi);
            hl(ctx, ox+4, oy+1, 10, p.hair);
            px(ctx, ox+6, oy+1, p.hairHi); px(ctx, ox+7, oy+1, p.hairHi);
            hl(ctx, ox+3, oy+2, 12, p.hair);
            px(ctx, ox+5, oy+2, p.hairHi); px(ctx, ox+9, oy+2, p.hairHi);
            hl(ctx, ox+3, oy+3, 12, p.hair);
        } else {
            // ── MAN BUN (дулька) — Саша ──
            hl(ctx, ox+7, oy-3, 4, p.hair);
            hl(ctx, ox+6, oy-2, 6, p.hair);
            px(ctx, ox+7, oy-2, p.hairHi); px(ctx, ox+8, oy-2, p.hairHi);
            hl(ctx, ox+6, oy-1, 6, p.hair);
            px(ctx, ox+8, oy-1, p.hairHi);
            hl(ctx, ox+5, oy+0, 8, p.hair);
            hl(ctx, ox+4, oy+1, 10, p.hair);
            px(ctx, ox+3, oy+2, p.hairHi);
            hl(ctx, ox+4, oy+2, 2, p.hair);
            hl(ctx, ox+6, oy+2, 6, p.hair);
            hl(ctx, ox+12, oy+2, 2, p.hair);
            px(ctx, ox+14, oy+2, p.hairHi);
            px(ctx, ox+3, oy+3, p.hairHi);
            px(ctx, ox+4, oy+3, p.hair);
            px(ctx, ox+13, oy+3, p.hair);
            px(ctx, ox+14, oy+3, p.hairHi);
        }
    }

    // =============================================
    // HAIR — SIDE VIEW (per character)
    // =============================================
    function drawHairSide(ctx, ox, oy, p, idx) {
        if (idx === 0) {
            // ── КАРЕ side — Денис ──
            hl(ctx, ox+3, oy-1, 8, p.hair);
            px(ctx, ox+5, oy-1, p.hairHi);
            hl(ctx, ox+2, oy+0, 9, p.hair);
            px(ctx, ox+4, oy+0, p.hairHi); px(ctx, ox+5, oy+0, p.hairHi);
            hl(ctx, ox+2, oy+1, 9, p.hair);
            px(ctx, ox+4, oy+1, p.hairHi);
            hl(ctx, ox+2, oy+2, 9, p.hair);
            hl(ctx, ox+2, oy+3, 9, p.hair);
            px(ctx, ox+2, oy+4, p.hair); px(ctx, ox+3, oy+4, p.hair);
            px(ctx, ox+2, oy+5, p.hair); px(ctx, ox+3, oy+5, p.hair);
            px(ctx, ox+2, oy+6, p.hair); px(ctx, ox+3, oy+6, p.hair);
            px(ctx, ox+2, oy+7, p.hair); px(ctx, ox+3, oy+7, p.hair);
            px(ctx, ox+2, oy+8, p.hair);
            px(ctx, ox+2, oy+9, p.hairHi);
        } else if (idx === 1) {
            // ── SHORT HAIR side — Іван ──
            hl(ctx, ox+5, oy+0, 6, p.hair);
            px(ctx, ox+5, oy+0, p.hairHi);
            hl(ctx, ox+4, oy+1, 7, p.hair);
            px(ctx, ox+5, oy+1, p.hairHi); px(ctx, ox+6, oy+1, p.hairHi);
            hl(ctx, ox+3, oy+2, 8, p.hair);
            px(ctx, ox+5, oy+2, p.hairHi);
            hl(ctx, ox+3, oy+3, 8, p.hair);
        } else {
            // ── MAN BUN side — Саша ──
            px(ctx, ox+3, oy-2, p.hair);
            px(ctx, ox+2, oy-1, p.hair); px(ctx, ox+3, oy-1, p.hair);
            px(ctx, ox+2, oy+0, p.hair); px(ctx, ox+3, oy+0, p.hairHi);
            hl(ctx, ox+4, oy+0, 7, p.hair);
            hl(ctx, ox+4, oy+1, 7, p.hair);
            px(ctx, ox+5, oy+1, p.hairHi); px(ctx, ox+6, oy+1, p.hairHi);
            px(ctx, ox+3, oy+2, p.hairHi);
            hl(ctx, ox+4, oy+2, 7, p.hair);
            px(ctx, ox+3, oy+3, p.hairHi);
            px(ctx, ox+4, oy+3, p.hair);
        }
    }

    // =============================================
    // STUBBLE overlay for Іван (front + side)
    // =============================================
    function drawStubbleFront(ctx, ox, oy, p) {
        if (!p.stubble) return;
        const sb = p.stubble;
        const sbd = '#7a5a2a'; // darker stubble dots
        // Щільна щетина — щоки
        px(ctx, ox+4, oy+7, sb); px(ctx, ox+13, oy+7, sb);
        px(ctx, ox+4, oy+8, sb); px(ctx, ox+5, oy+8, sbd); px(ctx, ox+6, oy+8, sb);
        px(ctx, ox+11, oy+8, sb); px(ctx, ox+12, oy+8, sbd); px(ctx, ox+13, oy+8, sb);
        // Навколо рота
        px(ctx, ox+5, oy+9, sb); px(ctx, ox+6, oy+9, sbd); px(ctx, ox+7, oy+9, sb);
        px(ctx, ox+10, oy+9, sb); px(ctx, ox+11, oy+9, sbd); px(ctx, ox+12, oy+9, sb);
        // Підборіддя — щільно
        px(ctx, ox+6, oy+10, sb); px(ctx, ox+7, oy+10, sbd); px(ctx, ox+8, oy+10, sb);
        px(ctx, ox+9, oy+10, sbd); px(ctx, ox+10, oy+10, sb); px(ctx, ox+11, oy+10, sb);
        // Під підборіддям
        px(ctx, ox+7, oy+11, sb); px(ctx, ox+8, oy+11, sbd); px(ctx, ox+9, oy+11, sb); px(ctx, ox+10, oy+11, sb);
    }

    function drawStubbleSide(ctx, ox, oy, p) {
        if (!p.stubble) return;
        const sb = p.stubble;
        const sbd = '#7a5a2a';
        // Щока
        px(ctx, ox+9, oy+7, sb); px(ctx, ox+10, oy+7, sbd);
        px(ctx, ox+8, oy+8, sb); px(ctx, ox+10, oy+8, sb);
        // Біля рота
        px(ctx, ox+9, oy+9, sb); px(ctx, ox+10, oy+9, sbd);
        // Щелепа / підборіддя
        px(ctx, ox+7, oy+10, sb); px(ctx, ox+8, oy+10, sbd); px(ctx, ox+9, oy+10, sb);
        // Під підборіддям
        px(ctx, ox+7, oy+11, sb); px(ctx, ox+8, oy+11, sbd); px(ctx, ox+9, oy+11, sb);
    }

    // =============================================
    // FRONT IDLE — facing screen
    // =============================================
    function drawFront(ctx, ox, oy, p, idx) {
        const O = p.outline;
        const S = p.suit, SH = p.suitHi, SD = p.suitDk;

        // Hair first (some go above oy)
        drawHairFront(ctx, ox, oy, p, idx);

        // ── FACE ──
        px(ctx, ox+3, oy+4, O); hl(ctx, ox+4, oy+4, 10, p.skinLt); px(ctx, ox+14, oy+4, O);
        px(ctx, ox+3, oy+5, O); px(ctx, ox+4, oy+5, p.skin);
        hl(ctx, ox+5, oy+5, 3, O); px(ctx, ox+8, oy+5, p.skin); px(ctx, ox+9, oy+5, p.skin);
        hl(ctx, ox+10, oy+5, 3, O); px(ctx, ox+13, oy+5, p.skin); px(ctx, ox+14, oy+5, O);
        px(ctx, ox+3, oy+6, O); px(ctx, ox+4, oy+6, p.skin);
        px(ctx, ox+5, oy+6, p.eyeW); px(ctx, ox+6, oy+6, p.eyeW); px(ctx, ox+7, oy+6, p.eye);
        px(ctx, ox+8, oy+6, p.skin); px(ctx, ox+9, oy+6, p.skin);
        px(ctx, ox+10, oy+6, p.eyeW); px(ctx, ox+11, oy+6, p.eyeW); px(ctx, ox+12, oy+6, p.eye);
        px(ctx, ox+13, oy+6, p.skin); px(ctx, ox+14, oy+6, O);
        px(ctx, ox+3, oy+7, O); hl(ctx, ox+4, oy+7, 10, p.skin); px(ctx, ox+14, oy+7, O);
        px(ctx, ox+3, oy+8, O); hl(ctx, ox+4, oy+8, 4, p.skin);
        px(ctx, ox+8, oy+8, p.skinDk); px(ctx, ox+9, oy+8, p.skinDk);
        hl(ctx, ox+10, oy+8, 4, p.skin); px(ctx, ox+14, oy+8, O);
        px(ctx, ox+4, oy+9, O); hl(ctx, ox+5, oy+9, 3, p.skin);
        px(ctx, ox+8, oy+9, p.mouth); px(ctx, ox+9, oy+9, p.mouth);
        hl(ctx, ox+10, oy+9, 3, p.skin); px(ctx, ox+13, oy+9, O);
        px(ctx, ox+5, oy+10, O); hl(ctx, ox+6, oy+10, 6, p.skinDk); px(ctx, ox+12, oy+10, O);

        // Stubble
        drawStubbleFront(ctx, ox, oy, p);

        // ── NECK ──
        hl(ctx, ox+7, oy+11, 4, p.skinDk);

        // ── JACKET ──
        px(ctx, ox+1, oy+12, O);
        px(ctx, ox+2, oy+12, SH); px(ctx, ox+3, oy+12, STRIPE); px(ctx, ox+4, oy+12, SH);
        hl(ctx, ox+5, oy+12, 2, S);
        px(ctx, ox+7, oy+12, SD); px(ctx, ox+8, oy+12, '#555'); px(ctx, ox+9, oy+12, '#555'); px(ctx, ox+10, oy+12, SD);
        hl(ctx, ox+11, oy+12, 2, S);
        px(ctx, ox+13, oy+12, SH); px(ctx, ox+14, oy+12, STRIPE); px(ctx, ox+15, oy+12, SH);
        px(ctx, ox+16, oy+12, O);

        px(ctx, ox+0, oy+13, O);
        px(ctx, ox+1, oy+13, S); px(ctx, ox+2, oy+13, SH); px(ctx, ox+3, oy+13, STRIPE); px(ctx, ox+4, oy+13, S);
        px(ctx, ox+5, oy+13, SD); px(ctx, ox+6, oy+13, S);
        px(ctx, ox+7, oy+13, SD); px(ctx, ox+8, oy+13, '#555'); px(ctx, ox+9, oy+13, '#555'); px(ctx, ox+10, oy+13, SD);
        px(ctx, ox+11, oy+13, S); px(ctx, ox+12, oy+13, SD);
        px(ctx, ox+13, oy+13, S); px(ctx, ox+14, oy+13, STRIPE); px(ctx, ox+15, oy+13, SH);
        px(ctx, ox+16, oy+13, S); px(ctx, ox+17, oy+13, O);

        for (let r = 14; r <= 18; r++) {
            px(ctx, ox+0, oy+r, O);
            px(ctx, ox+1, oy+r, S); px(ctx, ox+2, oy+r, SH);
            px(ctx, ox+3, oy+r, STRIPE);
            px(ctx, ox+4, oy+r, S); px(ctx, ox+5, oy+r, SD); px(ctx, ox+6, oy+r, S);
            px(ctx, ox+7, oy+r, SD); px(ctx, ox+8, oy+r, '#555'); px(ctx, ox+9, oy+r, '#555'); px(ctx, ox+10, oy+r, SD);
            px(ctx, ox+11, oy+r, S); px(ctx, ox+12, oy+r, SD); px(ctx, ox+13, oy+r, S);
            px(ctx, ox+14, oy+r, STRIPE);
            px(ctx, ox+15, oy+r, SH); px(ctx, ox+16, oy+r, S); px(ctx, ox+17, oy+r, O);
        }

        // Arms
        for (let r = 13; r <= 17; r++) { px(ctx, ox+0, oy+r, S); px(ctx, ox+17, oy+r, S); }
        px(ctx, ox+0, oy+18, p.skin); px(ctx, ox+17, oy+18, p.skin);
        px(ctx, ox+0, oy+19, p.skinDk); px(ctx, ox+17, oy+19, p.skinDk);

        // Waistband
        px(ctx, ox+2, oy+19, O);
        hl(ctx, ox+3, oy+19, 5, SD);
        px(ctx, ox+8, oy+19, S); px(ctx, ox+9, oy+19, S);
        hl(ctx, ox+10, oy+19, 5, SD);
        px(ctx, ox+15, oy+19, O);

        // Pants
        for (let r = 20; r <= 24; r++) {
            px(ctx, ox+3, oy+r, O);
            px(ctx, ox+4, oy+r, S); px(ctx, ox+5, oy+r, STRIPE);
            px(ctx, ox+6, oy+r, S); px(ctx, ox+7, oy+r, SD);
            if (r >= 23) { px(ctx, ox+8, oy+r, O); px(ctx, ox+9, oy+r, O); }
            else { px(ctx, ox+8, oy+r, SD); px(ctx, ox+9, oy+r, SD); }
            px(ctx, ox+10, oy+r, SD); px(ctx, ox+11, oy+r, S);
            px(ctx, ox+12, oy+r, STRIPE); px(ctx, ox+13, oy+r, S); px(ctx, ox+14, oy+r, O);
        }

        // Shoes
        px(ctx, ox+2, oy+25, O);
        px(ctx, ox+3, oy+25, p.shoes); px(ctx, ox+4, oy+25, p.shoesHi);
        px(ctx, ox+5, oy+25, p.shoes); px(ctx, ox+6, oy+25, p.shoes); px(ctx, ox+7, oy+25, p.shoesDk);
        px(ctx, ox+10, oy+25, p.shoesDk);
        px(ctx, ox+11, oy+25, p.shoes); px(ctx, ox+12, oy+25, p.shoesHi);
        px(ctx, ox+13, oy+25, p.shoes); px(ctx, ox+14, oy+25, p.shoes); px(ctx, ox+15, oy+25, O);
        px(ctx, ox+2, oy+26, O); hl(ctx, ox+3, oy+26, 5, p.shoesDk);
        hl(ctx, ox+10, oy+26, 5, p.shoesDk); px(ctx, ox+15, oy+26, O);
    }

    // =============================================
    // SIDE WALK — facing right, 4 frames
    // =============================================
    function drawSide(ctx, ox, oy, p, frame, idx) {
        const O = p.outline;
        const S = p.suit, SH = p.suitHi, SD = p.suitDk;

        // Hair
        drawHairSide(ctx, ox, oy, p, idx);

        // ── FACE (side) ──
        px(ctx, ox+3, oy+4, O); hl(ctx, ox+4, oy+4, 7, p.skinLt); px(ctx, ox+11, oy+4, O);
        px(ctx, ox+3, oy+5, O); hl(ctx, ox+4, oy+5, 3, p.skin);
        hl(ctx, ox+7, oy+5, 3, O); px(ctx, ox+10, oy+5, p.skin); px(ctx, ox+11, oy+5, O);
        px(ctx, ox+3, oy+6, O); hl(ctx, ox+4, oy+6, 3, p.skin);
        px(ctx, ox+7, oy+6, p.eyeW); px(ctx, ox+8, oy+6, p.eyeW); px(ctx, ox+9, oy+6, p.eye);
        px(ctx, ox+10, oy+6, p.skin); px(ctx, ox+11, oy+6, O);
        px(ctx, ox+3, oy+7, O); hl(ctx, ox+4, oy+7, 7, p.skin); px(ctx, ox+11, oy+7, O);
        px(ctx, ox+4, oy+8, O); hl(ctx, ox+5, oy+8, 4, p.skin);
        px(ctx, ox+9, oy+8, p.skinDk); px(ctx, ox+10, oy+8, p.skin);
        px(ctx, ox+11, oy+8, p.skinDk); px(ctx, ox+12, oy+8, O);
        px(ctx, ox+4, oy+9, O); hl(ctx, ox+5, oy+9, 3, p.skin);
        px(ctx, ox+8, oy+9, p.mouth); px(ctx, ox+9, oy+9, p.skinDk); px(ctx, ox+10, oy+9, O);
        px(ctx, ox+5, oy+10, O); hl(ctx, ox+6, oy+10, 4, p.skinDk); px(ctx, ox+10, oy+10, O);

        // Stubble
        drawStubbleSide(ctx, ox, oy, p);

        // ── NECK ──
        hl(ctx, ox+6, oy+11, 4, p.skinDk);

        // ── BODY ──
        px(ctx, ox+2, oy+12, O);
        px(ctx, ox+3, oy+12, SH); px(ctx, ox+4, oy+12, S); px(ctx, ox+5, oy+12, SD);
        px(ctx, ox+6, oy+12, SD); px(ctx, ox+7, oy+12, S); px(ctx, ox+8, oy+12, S);
        px(ctx, ox+9, oy+12, SH); px(ctx, ox+10, oy+12, STRIPE); px(ctx, ox+11, oy+12, O);

        px(ctx, ox+1, oy+13, O);
        px(ctx, ox+2, oy+13, S); px(ctx, ox+3, oy+13, SH); px(ctx, ox+4, oy+13, S);
        px(ctx, ox+5, oy+13, SD); px(ctx, ox+6, oy+13, S); px(ctx, ox+7, oy+13, S);
        px(ctx, ox+8, oy+13, SD); px(ctx, ox+9, oy+13, S);
        px(ctx, ox+10, oy+13, SH); px(ctx, ox+11, oy+13, STRIPE); px(ctx, ox+12, oy+13, O);

        for (let r = 14; r <= 18; r++) {
            px(ctx, ox+2, oy+r, O);
            px(ctx, ox+3, oy+r, S); px(ctx, ox+4, oy+r, SH); px(ctx, ox+5, oy+r, S);
            px(ctx, ox+6, oy+r, SD); px(ctx, ox+7, oy+r, S); px(ctx, ox+8, oy+r, SD);
            px(ctx, ox+9, oy+r, S); px(ctx, ox+10, oy+r, SH); px(ctx, ox+11, oy+r, O);
        }

        // ── FRONT ARM ──
        const armData = [
            [{x:10,y:13},{x:11,y:14},{x:11,y:15},{x:12,y:16},{x:12,y:17}],
            [{x:11,y:14},{x:11,y:15},{x:11,y:16},{x:11,y:17},{x:11,y:18}],
            [{x:10,y:14},{x:9,y:15},{x:9,y:16},{x:8,y:17},{x:8,y:18}],
            [{x:11,y:14},{x:11,y:15},{x:11,y:16},{x:11,y:17},{x:11,y:18}],
        ];
        const fArm = armData[frame % 4];
        fArm.forEach(a => {
            px(ctx, ox+a.x, oy+a.y, S);
            px(ctx, ox+a.x+1, oy+a.y, STRIPE);
        });
        px(ctx, ox+fArm[fArm.length-1].x, oy+fArm[fArm.length-1].y+1, p.skin);

        // ── BACK ARM ──
        const bArm = armData[(frame + 2) % 4];
        bArm.forEach(a => px(ctx, ox+(14-a.x), oy+a.y, SD));
        px(ctx, ox+(14-bArm[bArm.length-1].x), oy+bArm[bArm.length-1].y+1, p.skinDk);

        // ── WAISTBAND ──
        px(ctx, ox+3, oy+19, O);
        hl(ctx, ox+4, oy+19, 7, SD);
        px(ctx, ox+11, oy+19, O);

        // ── LEGS ──
        const legData = [
            { front: [[8,20],[9,21],[10,22],[10,23],[10,24]],
              back:  [[5,20],[4,21],[3,22],[3,23],[3,24]],
              fShoe: {x:10,y:25}, bShoe: {x:2,y:25} },
            { front: [[7,20],[7,21],[7,22],[7,23],[7,24]],
              back:  [[6,20],[6,21],[6,22],[6,23],[6,24]],
              fShoe: {x:6,y:25}, bShoe: {x:5,y:25} },
            { front: [[5,20],[4,21],[3,22],[3,23],[3,24]],
              back:  [[8,20],[9,21],[10,22],[10,23],[10,24]],
              fShoe: {x:2,y:25}, bShoe: {x:10,y:25} },
            { front: [[6,20],[6,21],[6,22],[6,23],[6,24]],
              back:  [[7,20],[7,21],[7,22],[7,23],[7,24]],
              fShoe: {x:5,y:25}, bShoe: {x:6,y:25} }
        ];
        const leg = legData[frame % 4];

        leg.back.forEach(([lx,ly]) => { px(ctx, ox+lx, oy+ly, SD); px(ctx, ox+lx+1, oy+ly, SD); });
        hl(ctx, ox+leg.bShoe.x, oy+leg.bShoe.y, 3, p.shoesDk);
        hl(ctx, ox+leg.bShoe.x, oy+leg.bShoe.y+1, 3, O);

        leg.front.forEach(([lx,ly]) => {
            px(ctx, ox+lx, oy+ly, S);
            px(ctx, ox+lx+1, oy+ly, STRIPE);
            px(ctx, ox+lx+2, oy+ly, S);
        });
        hl(ctx, ox+leg.fShoe.x, oy+leg.fShoe.y, 3, p.shoes);
        px(ctx, ox+leg.fShoe.x+1, oy+leg.fShoe.y, p.shoesHi);
        hl(ctx, ox+leg.fShoe.x, oy+leg.fShoe.y+1, 3, O);
    }

    // =============================================
    // MAIN SYSTEM
    // =============================================
    const container = document.getElementById('bandWalkers');
    if (!container) return;
    container.innerHTML = '';

    const CHAR_W = 18;
    const CHAR_H = 27;
    const GAP = 14;
    const SPRITE_TOP_EXTRA = 4; // extra space above for bun/bob
    const TOTAL_W = CHAR_W * 3 + GAP * 2;
    const TOTAL_H = CHAR_H + SPRITE_TOP_EXTRA + 2;

    const canvas = document.createElement('canvas');
    canvas.width = TOTAL_W * P;
    canvas.height = TOTAL_H * P;
    canvas.style.imageRendering = 'pixelated';
    canvas.style.width = (TOTAL_W * P) + 'px';
    canvas.style.height = (TOTAL_H * P) + 'px';
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.setTransform(P, 0, 0, P, 0, 0);

    // State (exposed globally for effects.js beer sync)
    let isWalking = false;
    window._bandWalkersIsWalking = false;
    let walkFrame = 0;
    let scrollAccum = 0;
    const PX_PER_FRAME = 60;
    let stopTimeout = null;
    const STOP_DELAY = 200;

    function render() {
        ctx.clearRect(0, 0, TOTAL_W, TOTAL_H);

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        for (let i = 0; i < 3; i++) {
            const sx = i * (CHAR_W + GAP) + 4;
            for (let dx = 0; dx < CHAR_W - 8; dx++) {
                const dist = Math.abs(dx - (CHAR_W - 8) / 2) / ((CHAR_W - 8) / 2);
                if (dist < 0.8) ctx.fillRect(sx + dx, SPRITE_TOP_EXTRA + CHAR_H, 1, 1);
            }
        }

        for (let i = 0; i < 3; i++) {
            const ox = i * (CHAR_W + GAP);
            const oy = SPRITE_TOP_EXTRA; // offset down so bun/bob has room above
            if (isWalking) {
                drawSide(ctx, ox, oy, PAL[i], walkFrame, i);
            } else {
                drawFront(ctx, ox, oy, PAL[i], i);
            }
        }
    }

    // Position: absolute inside wrapper, update left on scroll to stay centered
    const wrapper = document.getElementById('horizontalWrapper');

    const isMobile = window.innerWidth <= 768;

    function getScrollState() {
        if (isMobile) {
            const scrollX = wrapper.scrollLeft || 0;
            const maxScrollX = wrapper.scrollWidth - wrapper.clientWidth;
            const translateX = scrollX;
            return { scrollPos: scrollX, translateX };
        } else {
            const scrollY = window.scrollY;
            const maxScrollY = document.body.scrollHeight - window.innerHeight;
            const totalWidth = wrapper.scrollWidth;
            const maxScroll = totalWidth - window.innerWidth;
            const progress = maxScrollY > 0 ? scrollY / maxScrollY : 0;
            const translateX = progress * maxScroll;
            return { scrollPos: scrollY, translateX };
        }
    }

    function updatePosition() {
        const { translateX } = getScrollState();
        const viewportCenterX = translateX + window.innerWidth / 2;

        container.style.position = 'absolute';
        container.style.left = (viewportCenterX - canvas.width / 2) + 'px';
        container.style.bottom = 'calc(13vh + 2px)';
        container.style.zIndex = '56';
        container.style.pointerEvents = 'none';
    }

    // Scroll-driven animation
    let lastScrollPos = 0;

    function onScroll() {
        const { scrollPos } = getScrollState();
        if (!isWalking) { isWalking = true; window._bandWalkersIsWalking = true; render(); }

        scrollAccum += Math.abs(scrollPos - lastScrollPos);
        lastScrollPos = scrollPos;

        while (scrollAccum >= PX_PER_FRAME) {
            scrollAccum -= PX_PER_FRAME;
            walkFrame = (walkFrame + 1) % 4;
        }
        render();
        updatePosition();

        if (stopTimeout) clearTimeout(stopTimeout);
        stopTimeout = setTimeout(() => {
            isWalking = false;
            window._bandWalkersIsWalking = false;
            walkFrame = 0;
            render();
        }, STOP_DELAY);
    }

    updatePosition();
    render();

    if (isMobile) {
        wrapper.addEventListener('scroll', onScroll, { passive: true });
    } else {
        window.addEventListener('scroll', onScroll, { passive: true });
    }
    window.addEventListener('resize', updatePosition);
})();
