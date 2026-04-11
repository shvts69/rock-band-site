/* ========================================
   HORIZONTAL SCROLL ENGINE
   ======================================== */

(function() {
    const wrapper = document.getElementById('horizontalWrapper');
    const road = document.getElementById('road');

    function initHorizontalScroll() {
        const totalWidth = wrapper.scrollWidth;
        const viewportWidth = window.innerWidth;
        const maxScroll = totalWidth - viewportWidth;

        document.body.style.height = totalWidth + 'px';

        const stageSection = document.getElementById('stage');

        function onScroll() {
            const scrollY = window.scrollY;
            const maxScrollY = document.body.scrollHeight - window.innerHeight;
            const progress = scrollY / maxScrollY;
            const translateX = -progress * maxScroll;

            wrapper.style.position = 'fixed';
            wrapper.style.top = '0';
            wrapper.style.left = '0';
            wrapper.style.transform = `translateX(${translateX}px)`;

            // Road line animation
            if (road) {
                const roadLine = road.querySelector('.road-line');
                if (roadLine) {
                    roadLine.style.transform = `translateX(${translateX * 0.5}px) translateY(-50%)`;
                }
            }

            // Clip road so it ends exactly where the stage begins
            if (stageSection && road) {
                const stageRect = stageSection.getBoundingClientRect();
                if (stageRect.left < viewportWidth) {
                    // Stage is visible — clip the road at the stage's left edge
                    road.style.clipPath = `inset(0 ${viewportWidth - stageRect.left}px 0 0)`;
                } else {
                    road.style.clipPath = 'none';
                }
            }
        }

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', () => {
            document.body.style.height = wrapper.scrollWidth + 'px';
            onScroll();
        });

        onScroll();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHorizontalScroll);
    } else {
        initHorizontalScroll();
    }
})();
