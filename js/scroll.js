/* ========================================
   HORIZONTAL SCROLL ENGINE
   Desktop: vertical scroll → horizontal translateX
   Mobile: native horizontal scroll + scroll-snap
   ======================================== */

(function() {
    const wrapper = document.getElementById('horizontalWrapper');
    const roadDesert = document.getElementById('roadDesert');
    const roadCity = document.getElementById('roadCity');
    const roadBridge = document.getElementById('roadBridge');
    const roadVenue = document.getElementById('roadVenue');
    const roadPub = document.getElementById('roadPub');

    let maxScroll = 0;
    let scheduled = false;
    const isMobile = window.innerWidth <= 768;

    function positionRoads() {
        const brickWalls = document.querySelectorAll('.brick-wall');
        const firstWall = brickWalls[0];
        const secondWall = brickWalls[1];
        const thirdWall = brickWalls[2];
        const fourthWall = brickWalls[3];
        const pubSection = document.getElementById('pub');

        if (roadDesert && firstWall) {
            roadDesert.style.left = '0px';
            roadDesert.style.width = firstWall.offsetLeft + 'px';
        }
        if (roadCity && firstWall && secondWall) {
            const cityStart = firstWall.offsetLeft + firstWall.offsetWidth;
            roadCity.style.left = cityStart + 'px';
            roadCity.style.width = (secondWall.offsetLeft - cityStart) + 'px';
        }
        if (roadBridge && secondWall && thirdWall) {
            const bridgeStart = secondWall.offsetLeft + secondWall.offsetWidth;
            roadBridge.style.left = bridgeStart + 'px';
            roadBridge.style.width = (thirdWall.offsetLeft - bridgeStart) + 'px';
        }
        if (roadVenue && thirdWall && fourthWall) {
            const venueStart = thirdWall.offsetLeft + thirdWall.offsetWidth;
            roadVenue.style.left = venueStart + 'px';
            roadVenue.style.width = (fourthWall.offsetLeft - venueStart) + 'px';
        }
        if (roadPub && fourthWall && pubSection) {
            const pubStart = fourthWall.offsetLeft + fourthWall.offsetWidth;
            const pubEnd = pubSection.offsetLeft + pubSection.offsetWidth;
            roadPub.style.left = pubStart + 'px';
            roadPub.style.width = (pubEnd - pubStart) + 'px';
        }
    }

    // ====== DESKTOP: vertical scroll → horizontal ======
    function initDesktop() {
        const totalWidth = wrapper.scrollWidth;
        maxScroll = totalWidth - window.innerWidth;
        document.body.style.height = totalWidth + 'px';

        wrapper.style.position = 'fixed';
        wrapper.style.top = '0';
        wrapper.style.left = '0';
        wrapper.style.willChange = 'transform';

        positionRoads();
        onScrollDesktop();

        window.addEventListener('scroll', onScrollDesktop, { passive: true });
    }

    function onScrollDesktop() {
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(() => {
            const scrollY = window.scrollY;
            const maxScrollY = document.body.scrollHeight - window.innerHeight;
            const progress = maxScrollY > 0 ? Math.max(0, Math.min(1, scrollY / maxScrollY)) : 0;
            wrapper.style.transform = `translateX(${-progress * maxScroll}px)`;
            scheduled = false;
        });
    }

    // Reset scroll — backup for in-app browsers (Telegram etc.) that restore late.
    // Bail out once the user has interacted so we don't yank them back mid-scroll.
    let userInteracted = false;
    function markInteracted() { userInteracted = true; }
    ['wheel', 'touchstart', 'keydown', 'mousedown', 'pointerdown'].forEach(function(ev) {
        window.addEventListener(ev, markInteracted, { passive: true, once: true });
    });

    function resetScroll() {
        if (userInteracted) return;
        window.scrollTo(0, 0);
        if (wrapper) wrapper.scrollLeft = 0;
    }
    resetScroll();
    [100, 300, 600, 1000, 1500, 2000].forEach(function(ms) {
        setTimeout(resetScroll, ms);
    });

    // ====== MOBILE: native horizontal scroll with snap ======
    function initMobile() {
        // Make wrapper a native horizontal scroll container
        document.body.style.height = '100vh';
        document.body.style.overflow = 'hidden';

        wrapper.style.position = 'fixed';
        wrapper.style.top = '0';
        wrapper.style.left = '0';
        wrapper.style.width = '100%';
        wrapper.style.height = '100vh';
        wrapper.style.overflowX = 'auto';
        wrapper.style.overflowY = 'hidden';
        wrapper.style.webkitOverflowScrolling = 'touch';
        wrapper.style.scrollSnapType = 'x mandatory';
        wrapper.style.transform = 'none';

        // Each section snaps
        document.querySelectorAll('.section').forEach(s => {
            s.style.scrollSnapAlign = 'start';
            s.style.scrollSnapStop = 'always';
        });

        positionRoads();

        // Reset to first section on load
        wrapper.scrollLeft = 0;

        // Sync walkers & effects with horizontal scroll position
        wrapper.addEventListener('scroll', onScrollMobile, { passive: true });
    }

    function onScrollMobile() {
        // Expose scroll progress globally for effects/walkers
        const scrollX = wrapper.scrollLeft;
        const maxScrollX = wrapper.scrollWidth - wrapper.clientWidth;
        const progress = maxScrollX > 0 ? Math.max(0, Math.min(1, scrollX / maxScrollX)) : 0;

        // Fake window.scrollY for effects that read it
        window._mobileScrollProgress = progress;
        window._mobileScrollX = scrollX;
    }

    function init() {
        if (isMobile) {
            initMobile();
        } else {
            initDesktop();
        }

        // Reload on resize — canvases are sized once and don't reflow, so the
        // page needs a fresh init when width or height changes. The loader and
        // intro both short-circuit on subsequent loads in the same session
        // (sessionStorage flags), so the user sees an instant re-layout
        // without a repeated "loading" flash or intro replay. Debounced so
        // rapid drags don't trigger multiple reloads mid-movement.
        let lastSize = window.innerWidth + 'x' + window.innerHeight;
        let resizeTimer = null;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                const newSize = window.innerWidth + 'x' + window.innerHeight;
                if (newSize !== lastSize) {
                    lastSize = newSize;
                    location.reload();
                }
            }, 250);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
