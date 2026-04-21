(function () {
    'use strict';

    const SEEN_KEY = 'rs5051_intro_seen_v2';
    const HOLD_MS = 2800;

    let seen = false;
    try { seen = localStorage.getItem(SEEN_KEY) === '1'; } catch (e) { /* ignore */ }
    if (seen) return;

    function build() {
        const overlay = document.createElement('div');
        overlay.className = 'intro-cutscene';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-label', 'Intro');
        overlay.innerHTML = [
            '<div class="intro-crt">',
            '  <div class="intro-grid"></div>',
            '  <div class="intro-scanlines"></div>',
            '  <div class="intro-stack">',
            '    <div class="intro-frame">',
            '      <span class="intro-chip">5051.sys</span>',
            '      <span class="intro-chip intro-chip-dim">READY</span>',
            '    </div>',
            '    <pre class="intro-text">&gt; ARIZONA, 04:40 AM\n&gt; Three punks. One way. Next stop: New York.<span class="intro-cursor">_</span></pre>',
            '    <div class="intro-actions">',
            '      <span class="intro-hint">[ press any key or click to skip ]</span>',
            '      <button type="button" class="intro-skip">SKIP &#9654;</button>',
            '    </div>',
            '  </div>',
            '</div>'
        ].join('');
        document.body.appendChild(overlay);
        return overlay;
    }

    function playIntro() {
        try { localStorage.setItem(SEEN_KEY, '1'); } catch (e) { /* ignore */ }
        const overlay = build();
        requestAnimationFrame(() => overlay.classList.add('intro-show'));

        let autoTimer = setTimeout(close, HOLD_MS);

        function close() {
            if (autoTimer) { clearTimeout(autoTimer); autoTimer = null; }
            overlay.classList.remove('intro-show');
            overlay.classList.add('intro-out');
            setTimeout(() => { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 500);
            document.removeEventListener('keydown', onKey);
            document.removeEventListener('click', onClick, true);
        }

        function onKey() { close(); }
        function onClick(e) {
            if (!overlay.contains(e.target) && e.target !== overlay) return close();
            e.stopPropagation();
            close();
        }

        overlay.querySelector('.intro-skip').addEventListener('click', (e) => {
            e.stopPropagation();
            close();
        });
        document.addEventListener('keydown', onKey);
        document.addEventListener('click', onClick, true);
    }

    // Wait for preloader to finish before showing intro — otherwise they stack.
    function waitForLoaderThenPlay() {
        const loader = document.getElementById('site-loader');
        if (!loader) return playIntro();
        const obs = new MutationObserver(() => {
            const gone = !document.getElementById('site-loader');
            const hidden = loader.classList && loader.classList.contains('hidden');
            if (gone || hidden) {
                obs.disconnect();
                setTimeout(playIntro, 200);
            }
        });
        obs.observe(document.body, { childList: true, subtree: false, attributes: true, attributeFilter: ['class'] });
        obs.observe(loader, { attributes: true, attributeFilter: ['class'] });
        setTimeout(() => { obs.disconnect(); if (document.querySelector('.intro-cutscene')) return; playIntro(); }, 6000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForLoaderThenPlay);
    } else {
        waitForLoaderThenPlay();
    }
})();
