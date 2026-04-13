/* ========================================
   HORIZONTAL SCROLL ENGINE
   ======================================== */

(function() {
    const wrapper = document.getElementById('horizontalWrapper');
    const roadDesert = document.getElementById('roadDesert');
    const roadCity = document.getElementById('roadCity');
    const roadBridge = document.getElementById('roadBridge');
    const roadVenue = document.getElementById('roadVenue');

    let maxScroll = 0;

    function positionRoads() {
        const brickWalls = document.querySelectorAll('.brick-wall');
        const firstWall = brickWalls[0];
        const secondWall = brickWalls[1];
        const thirdWall = brickWalls[2];
        const stageSection = document.getElementById('stage');

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
        if (roadVenue && thirdWall && stageSection) {
            const venueStart = thirdWall.offsetLeft + thirdWall.offsetWidth;
            const venueEnd = stageSection.offsetLeft + stageSection.offsetWidth;
            roadVenue.style.left = venueStart + 'px';
            roadVenue.style.width = (venueEnd - venueStart) + 'px';
        }
    }

    function recalc() {
        const totalWidth = wrapper.scrollWidth;
        maxScroll = totalWidth - window.innerWidth;
        document.body.style.height = totalWidth + 'px';
        positionRoads();
        onScroll();
    }

    function onScroll() {
        const scrollY = window.scrollY;
        const maxScrollY = document.body.scrollHeight - window.innerHeight;
        const progress = maxScrollY > 0 ? scrollY / maxScrollY : 0;
        const translateX = -progress * maxScroll;

        wrapper.style.position = 'fixed';
        wrapper.style.top = '0';
        wrapper.style.left = '0';
        wrapper.style.transform = `translateX(${translateX}px)`;
    }

    function init() {
        recalc();
        window.addEventListener('scroll', onScroll, { passive: true });

        // Reload page on any resize — most reliable for canvas-heavy sites
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
