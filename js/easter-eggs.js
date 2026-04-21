// 5051 easter-egg system — 6 hidden categories across the city
// API: window.EasterEggs.find(cat), .isFound(cat), .count(), .all(), .reset()
// Fires CustomEvent 'easterEggsChanged' on each find, 'easterEggsComplete' on 6/6.
(function () {
    'use strict';

    const STORAGE_KEY = 'rs5051_secrets_v2';
    const CATEGORIES = ['eagle', 'rat', 'pigeon', 'liberty', 'ferry', 'logo'];
    const LABELS = {
        eagle: '\uD83E\uDD85 Eagle spotted!',
        rat: '\uD83D\uDC00 Rat found!',
        pigeon: '\uD83D\uDD4A Pigeon flipped!',
        liberty: '\uD83D\uDDFD Liberty noticed you!',
        ferry: '\u26F4\uFE0F Ferry honked!',
        logo: '\uD83C\uDFB8 5051 logo lives!'
    };

    const found = new Set();
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        if (Array.isArray(saved)) saved.forEach(k => { if (CATEGORIES.includes(k)) found.add(k); });
    } catch (e) { /* ignore */ }

    let dom = null;
    let finaleShown = false;

    function save() {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...found])); } catch (e) { /* ignore */ }
    }

    function buildDom() {
        const counter = document.createElement('div');
        counter.className = 'egg-counter';
        counter.setAttribute('aria-live', 'polite');
        counter.innerHTML =
            '<span class="egg-counter-icon">\uD83D\uDD0D</span>' +
            '<span class="egg-counter-text">Secrets <b class="egg-count">0</b>/6 &mdash; explore the city</span>';
        document.body.appendChild(counter);

        const toastHost = document.createElement('div');
        toastHost.className = 'egg-toast-host';
        document.body.appendChild(toastHost);

        const finale = document.createElement('div');
        finale.className = 'egg-finale';
        finale.innerHTML =
            '<canvas class="egg-fireworks"></canvas>' +
            '<div class="egg-finale-inner">' +
            '<h2 class="egg-finale-title">\uD83C\uDF89 You now know this city \uD83C\uDF89</h2>' +
            '<p class="egg-finale-msg">All secrets revealed.</p>' +
            '<p class="egg-finale-sub">Welcome to the real 5051.</p>' +
            '<button type="button" class="egg-finale-close">close</button>' +
            '</div>';
        finale.addEventListener('click', hideFinale);
        document.body.appendChild(finale);

        return { counter, toastHost, finale };
    }

    function ensureDom() {
        if (!dom) dom = buildDom();
        return dom;
    }

    function renderCounter() {
        const d = ensureDom();
        const el = d.counter.querySelector('.egg-count');
        if (el) el.textContent = found.size;
        d.counter.classList.toggle('complete', found.size === CATEGORIES.length);
    }

    function showToast(cat) {
        const d = ensureDom();
        const t = document.createElement('div');
        t.className = 'egg-toast';
        t.textContent = LABELS[cat] || cat;
        d.toastHost.appendChild(t);
        requestAnimationFrame(() => t.classList.add('show'));
        setTimeout(() => {
            t.classList.remove('show');
            t.classList.add('leave');
            setTimeout(() => t.remove(), 450);
        }, 2400);
    }

    function find(cat) {
        if (!CATEGORIES.includes(cat)) return false;
        if (found.has(cat)) return false;
        found.add(cat);
        save();
        showToast(cat);
        renderCounter();
        window.dispatchEvent(new CustomEvent('easterEggsChanged', { detail: { cat, found: [...found] } }));
        if (found.size === CATEGORIES.length && !finaleShown) {
            finaleShown = true;
            setTimeout(showFinale, 900);
        }
        return true;
    }

    function isFound(cat) { return found.has(cat); }
    function count() { return found.size; }
    function all() { return [...found]; }
    function reset() {
        found.clear();
        finaleShown = false;
        save();
        renderCounter();
        document.body.classList.remove('egg-party');
        if (dom) dom.finale.classList.remove('active');
    }

    function showFinale() {
        const d = ensureDom();
        d.finale.classList.add('active');
        document.body.classList.add('egg-party');
        startFireworks(d.finale.querySelector('.egg-fireworks'));
        window.dispatchEvent(new CustomEvent('easterEggsComplete'));
    }

    function hideFinale() {
        const d = ensureDom();
        d.finale.classList.remove('active');
    }

    function startFireworks(canvas) {
        if (!canvas || canvas.dataset.running === '1') return;
        canvas.dataset.running = '1';
        const ctx = canvas.getContext('2d');
        const resize = () => { canvas.width = innerWidth; canvas.height = innerHeight; };
        resize();
        window.addEventListener('resize', resize);

        const COLORS = ['#ff3366', '#ffcc33', '#66ccff', '#99ff66', '#ff66cc', '#ffffff', '#ffaa00'];
        const particles = [];

        function launch() {
            const cx = innerWidth * (0.15 + Math.random() * 0.7);
            const cy = innerHeight * (0.15 + Math.random() * 0.45);
            const color = COLORS[Math.floor(Math.random() * COLORS.length)];
            const n = 50 + Math.floor(Math.random() * 30);
            for (let i = 0; i < n; i++) {
                const a = Math.random() * Math.PI * 2;
                const v = 2 + Math.random() * 3.5;
                particles.push({ x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, color });
            }
        }

        let launchTimer = 0;
        function frame() {
            const active = ensureDom().finale.classList.contains('active');
            if (!active) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                canvas.dataset.running = '';
                return;
            }
            ctx.fillStyle = 'rgba(0,0,0,0.18)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            launchTimer--;
            if (launchTimer <= 0) { launch(); launchTimer = 30 + Math.floor(Math.random() * 35); }
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.06;
                p.vx *= 0.985;
                p.vy *= 0.985;
                p.life -= 0.012;
                if (p.life <= 0) { particles.splice(i, 1); continue; }
                ctx.globalAlpha = Math.max(0, p.life);
                ctx.fillStyle = p.color;
                ctx.fillRect(p.x, p.y, 3, 3);
            }
            ctx.globalAlpha = 1;
            requestAnimationFrame(frame);
        }
        frame();
    }

    window.EasterEggs = { find, isFound, count, all, reset, CATEGORIES: [...CATEGORIES] };

    function start() {
        ensureDom();
        renderCounter();
        if (found.size === CATEGORIES.length) {
            finaleShown = true;
            document.body.classList.add('egg-party');
        }
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();
