/* ========================================
   HORIZONTAL SCROLL ENGINE
   ======================================== */

(function() {
    const wrapper = document.getElementById('horizontalWrapper');
    const roadDesert = document.getElementById('roadDesert');
    const roadCity = document.getElementById('roadCity');
    const roadBridge = document.getElementById('roadBridge');
    const roadVenue = document.getElementById('roadVenue');
    const roadPub = document.getElementById('roadPub');

    let maxScroll = 0;
    const isMobile = window.innerWidth <= 768;

    // For smooth mobile scrolling
    let currentX = 0;
    let targetX = 0;
    let ticking = false;

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

    function getProgress() {
        const scrollY = window.scrollY;
        const maxScrollY = document.body.scrollHeight - window.innerHeight;
        if (maxScrollY <= 0) return 0;
        return Math.max(0, Math.min(1, scrollY / maxScrollY));
    }

    function applyTransform(x) {
        wrapper.style.transform = `translateX(${x}px)`;
    }

    function recalc() {
        const totalWidth = wrapper.scrollWidth;
        maxScroll = totalWidth - window.innerWidth;

        // Less vertical scroll needed on mobile
        const mult = isMobile ? 0.55 : 1;
        document.body.style.height = (totalWidth * mult) + 'px';

        wrapper.style.position = 'fixed';
        wrapper.style.top = '0';
        wrapper.style.left = '0';
        wrapper.style.willChange = 'transform';

        positionRoads();

        targetX = -getProgress() * maxScroll;
        currentX = targetX;
        applyTransform(currentX);
    }

    // Desktop — direct, no smoothing needed
    function onScrollDesktop() {
        const x = -getProgress() * maxScroll;
        applyTransform(x);
    }

    // Mobile — smoothed with RAF
    function onScrollMobile() {
        targetX = -getProgress() * maxScroll;
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(smoothStep);
        }
    }

    function smoothStep() {
        const diff = targetX - currentX;
        if (Math.abs(diff) < 0.3) {
            currentX = targetX;
            ticking = false;
        } else {
            currentX += diff * 0.15;
            requestAnimationFrame(smoothStep);
        }
        applyTransform(currentX);
    }

    function init() {
        recalc();

        if (isMobile) {
            window.addEventListener('scroll', onScrollMobile, { passive: true });
        } else {
            window.addEventListener('scroll', onScrollDesktop, { passive: true });
        }

        // Reload on resize
        let lastSize = window.innerWidth + 'x' + window.innerHeight;
        window.addEventListener('resize', () => {
            const newSize = window.innerWidth + 'x' + window.innerHeight;
            if (newSize !== lastSize) {
                lastSize = newSize;
                location.reload();
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
