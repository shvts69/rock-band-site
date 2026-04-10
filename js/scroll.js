/* ========================================
   HORIZONTAL SCROLL ENGINE
   ======================================== */

(function() {
    const wrapper = document.getElementById('horizontalWrapper');
    const road = document.getElementById('road');
    const bandWalkers = document.getElementById('bandWalkers');

    // Конвертуємо вертикальний скрол в горизонтальний
    function initHorizontalScroll() {
        const totalWidth = wrapper.scrollWidth;
        const viewportWidth = window.innerWidth;
        const maxScroll = totalWidth - viewportWidth;

        // Встановлюємо висоту body для скролу
        document.body.style.height = totalWidth + 'px';

        function onScroll() {
            const scrollY = window.scrollY;
            const maxScrollY = document.body.scrollHeight - window.innerHeight;
            const progress = scrollY / maxScrollY;
            const translateX = -progress * maxScroll;

            wrapper.style.position = 'fixed';
            wrapper.style.top = '0';
            wrapper.style.left = '0';
            wrapper.style.transform = `translateX(${translateX}px)`;

            // Оновлюємо прогрес-бар на дорозі
            updateRoadProgress(progress);

            // Рухаємо розмітку дороги
            if (road) {
                const roadLine = road.querySelector('.road-line');
                if (roadLine) {
                    roadLine.style.transform = `translateX(${translateX * 0.5}px) translateY(-50%)`;
                }
            }
        }

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', () => {
            document.body.style.height = wrapper.scrollWidth + 'px';
            onScroll();
        });

        // Перший виклик
        onScroll();
    }

    // Прогрес-бар
    function updateRoadProgress(progress) {
        let progressBar = document.querySelector('.road-progress');
        if (!progressBar) {
            progressBar = document.createElement('div');
            progressBar.className = 'road-progress';
            document.body.appendChild(progressBar);
        }
        progressBar.style.width = (progress * 100) + '%';
    }

    // Ініціалізація після завантаження
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHorizontalScroll);
    } else {
        initHorizontalScroll();
    }
})();
