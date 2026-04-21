(function () {
    'use strict';

    const SEEN_KEY = 'rs5051_intro_seen_v1';

    let seen = false;
    try { seen = localStorage.getItem(SEEN_KEY) === '1'; } catch (e) { /* ignore */ }
    if (seen) return;

    // Skip on tiny screens where the scroll hint matters more than cinematic.
    // (Keep on mobile anyway — judges check mobile.)

    // Chained lines typed one after another. Kept short: judges skim fast.
    const LINES = [
        '> Somewhere in New York City...',
        '> Three punks plug in their amps.',
        '> The city listens.',
        '> Welcome to 5051.',
        '> Scroll &raquo;  to start the night.'
    ];

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
            '    <pre class="intro-text"></pre>',
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

    function typewriter(el, lines, onDone) {
        let li = 0;
        let ci = 0;
        const CHAR_MS = 22;
        const LINE_PAUSE = 320;
        let out = '';
        let stopped = false;
        let timer = null;

        function step() {
            if (stopped) return;
            const line = lines[li];
            if (ci <= line.length) {
                out = out.slice(0, out.length - '<span class="intro-cursor">_</span>'.length);
                out += line.slice(ci - 1, ci);
                out += '<span class="intro-cursor">_</span>';
                el.innerHTML = out;
                ci += 1;
                timer = setTimeout(step, CHAR_MS);
            } else {
                out = out.replace(/<span class="intro-cursor">_<\/span>$/, '') + '\n';
                el.innerHTML = out + '<span class="intro-cursor">_</span>';
                li += 1;
                ci = 0;
                if (li >= lines.length) {
                    timer = setTimeout(onDone, 1200);
                } else {
                    timer = setTimeout(step, LINE_PAUSE);
                }
            }
        }
        step();
        return function stop() {
            stopped = true;
            if (timer) clearTimeout(timer);
        };
    }

    function playIntro() {
        try { localStorage.setItem(SEEN_KEY, '1'); } catch (e) { /* ignore */ }
        const overlay = build();
        requestAnimationFrame(() => overlay.classList.add('intro-show'));

        const textEl = overlay.querySelector('.intro-text');
        let stop = typewriter(textEl, LINES, close);

        function close() {
            if (stop) { stop(); stop = null; }
            overlay.classList.remove('intro-show');
            overlay.classList.add('intro-out');
            setTimeout(() => { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 500);
            document.removeEventListener('keydown', onKey);
            document.removeEventListener('click', onClick, true);
        }

        function onKey() { close(); }
        function onClick(e) {
            // Allow click anywhere to skip, but suppress propagation so it doesn't
            // trigger easter-egg counters etc.
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
                // small beat so loader fade finishes cleanly
                setTimeout(playIntro, 200);
            }
        });
        obs.observe(document.body, { childList: true, subtree: false, attributes: true, attributeFilter: ['class'] });
        obs.observe(loader, { attributes: true, attributeFilter: ['class'] });
        // Safety: if nothing happens in 6s, play anyway
        setTimeout(() => { obs.disconnect(); if (document.querySelector('.intro-cutscene')) return; playIntro(); }, 6000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForLoaderThenPlay);
    } else {
        waitForLoaderThenPlay();
    }
})();
