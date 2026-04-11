/* ========================================
   HORIZONTAL SCROLL ENGINE
   ======================================== */

(function() {
    const wrapper = document.getElementById('horizontalWrapper');
    const road = document.getElementById('road');
    const bandWalkers = document.getElementById('bandWalkers');

    function initHorizontalScroll() {
        const totalWidth = wrapper.scrollWidth;
        const viewportWidth = window.innerWidth;
        const maxScroll = totalWidth - viewportWidth;

        document.body.style.height = totalWidth + 'px';

        // Find stage section position for road clipping
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

            // Update road progress bar
            updateRoadProgress(progress);

            // Move road line markings
            if (road) {
                const roadLine = road.querySelector('.road-line');
                if (roadLine) {
                    roadLine.style.transform = `translateX(${translateX * 0.5}px) translateY(-50%)`;
                }
            }

            // Hide road & walkers when entering stage section
            if (stageSection && road) {
                const stageRect = stageSection.getBoundingClientRect();
                // Road disappears as stage section enters viewport
                if (stageRect.left < viewportWidth * 0.3) {
                    road.style.opacity = '0';
                    road.style.pointerEvents = 'none';
                    if (bandWalkers) {
                        bandWalkers.style.opacity = '0';
                    }
                } else {
                    road.style.opacity = '1';
                    road.style.pointerEvents = 'auto';
                    if (bandWalkers) {
                        bandWalkers.style.opacity = '1';
                    }
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

    function updateRoadProgress(progress) {
        let progressBar = document.querySelector('.road-progress');
        if (!progressBar) {
            progressBar = document.createElement('div');
            progressBar.className = 'road-progress';
            document.body.appendChild(progressBar);
        }
        progressBar.style.width = (progress * 100) + '%';
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHorizontalScroll);
    } else {
        initHorizontalScroll();
    }
})();
