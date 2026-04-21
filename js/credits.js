(function () {
    'use strict';

    const footer = document.getElementById('rs69Footer');
    if (!footer) return;

    // Trigger: three clicks on the footer within 800ms, OR secret key combo "r s 6 9"
    let clickTimes = [];
    const CLICK_WINDOW_MS = 900;
    const CLICKS_NEEDED = 3;

    footer.addEventListener('click', (e) => {
        // Let the RS69 link still open the portfolio on a single click
        const isLink = e.target.closest('.site-footer-link');
        const now = Date.now();
        clickTimes = clickTimes.filter(t => now - t < CLICK_WINDOW_MS);
        clickTimes.push(now);
        if (clickTimes.length >= CLICKS_NEEDED) {
            clickTimes = [];
            e.preventDefault();
            e.stopPropagation();
            openModal();
            return;
        }
        // on triple-click the link default still gets intercepted above; single/double
        // clicks let the anchor navigate naturally.
        void isLink;
    });

    // Secret key combo: typing "rs69" anywhere
    const combo = 'rs69';
    let buf = '';
    window.addEventListener('keydown', (e) => {
        if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        const k = (e.key || '').toLowerCase();
        if (k.length !== 1) { buf = ''; return; }
        buf = (buf + k).slice(-combo.length);
        if (buf === combo) { buf = ''; openModal(); }
    });

    let modal = null;

    function buildModal() {
        modal = document.createElement('div');
        modal.className = 'credits-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-label', 'Making of 5051');
        modal.innerHTML = [
            '<div class="credits-backdrop"></div>',
            '<div class="credits-panel">',
            '  <button class="credits-close" type="button" aria-label="Close">&#10005;</button>',
            '  <div class="credits-crt">',
            '    <h2 class="credits-title">&#9835; MAKING OF 5051 &#9835;</h2>',
            '    <p class="credits-sub">A hand-coded pixel-art postcard from NYC.</p>',
            '    <ul class="credits-list">',
            '      <li><span class="credits-k">BUILD</span><span class="credits-v">Vanilla HTML / CSS / JS &mdash; no framework</span></li>',
            '      <li><span class="credits-k">SCENES</span><span class="credits-v">Canvas 2D, every pixel drawn in code</span></li>',
            '      <li><span class="credits-k">SECRETS</span><span class="credits-v">6 hidden critters &mdash; find them all for a party</span></li>',
            '      <li><span class="credits-k">AUDIO</span><span class="credits-v">Web Audio API &mdash; procedural 8-bit sounds</span></li>',
            '      <li><span class="credits-k">FONT</span><span class="credits-v">Press Start 2P &middot; Google Fonts</span></li>',
            '      <li><span class="credits-k">PALETTE</span><span class="credits-v">Punk night: red, gold, bruise purple, sodium amber</span></li>',
            '    </ul>',
            '    <p class="credits-thanks">Thanks for scrolling the whole way down.</p>',
            '    <p class="credits-sig">Designed &amp; built by <a href="https://rs69.dev/" target="_blank" rel="noopener noreferrer">RS69</a> for 5051.</p>',
            '  </div>',
            '</div>'
        ].join('');
        document.body.appendChild(modal);

        modal.querySelector('.credits-close').addEventListener('click', closeModal);
        modal.querySelector('.credits-backdrop').addEventListener('click', closeModal);
        document.addEventListener('keydown', onKey);
    }

    function onKey(e) {
        if (e.key === 'Escape' && modal && modal.classList.contains('credits-open')) {
            closeModal();
        }
    }

    function openModal() {
        if (!modal) buildModal();
        modal.classList.add('credits-open');
        if (window.Sound && typeof window.Sound.play === 'function') {
            try { window.Sound.play('logo'); } catch (_) { /* non-fatal */ }
        }
    }

    function closeModal() {
        if (!modal) return;
        modal.classList.remove('credits-open');
    }
})();
