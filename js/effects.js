/* ========================================
   VISUAL EFFECTS
   ======================================== */

(function() {

    // ====== CAMERA FLASHES (рандомні спалахи в натовпі) ======
    function initRandomFlashes() {
        const stage = document.querySelector('.section-stage');
        if (!stage) return;

        setInterval(() => {
            const flash = document.createElement('div');
            flash.style.cssText = `
                position: absolute;
                width: 6px;
                height: 6px;
                background: #fff;
                border-radius: 50%;
                bottom: ${20 + Math.random() * 60}px;
                left: ${10 + Math.random() * 80}%;
                z-index: 25;
                pointer-events: none;
                box-shadow: 0 0 20px #fff, 0 0 40px #fff;
            `;
            stage.querySelector('.crowd').appendChild(flash);

            setTimeout(() => flash.remove(), 150);
        }, 800 + Math.random() * 1200);
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

    // ====== INIT ======
    function init() {
        initRandomFlashes();
        initExtraStars();
        initRiverReflections();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
