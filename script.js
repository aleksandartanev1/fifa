(function () {
    const tabs = Array.from(document.querySelectorAll('.tab-item'));
    const categoryEl = document.querySelector('.category-tag');
    const titleEl = document.querySelector('.hero-title');
    const descEl = document.querySelector('.hero-description');
    const textCard = document.querySelector('.hero-text-card');
    const prevBtn = document.getElementById('prevArrow');
    const nextBtn = document.getElementById('nextArrow');

    let activeIndex = tabs.findIndex(t => t.classList.contains('active'));
    if (activeIndex === -1) activeIndex = 0;

    let autoplayTimer = null;
    const AUTOPLAY_MS = 6000;

    function renderTab(index, { fade = true } = {}) {
        const tab = tabs[index];
        const category = tab.querySelector('.tab-category').textContent.trim();
        const headline = tab.querySelector('.tab-headline').textContent.trim();
        const desc = tab.dataset.desc || '';

        const applyContent = () => {
            categoryEl.textContent = category;
            titleEl.textContent = headline;
            descEl.textContent = desc;
            descEl.style.display = desc ? '' : 'none';
            if (fade) {
                requestAnimationFrame(() => textCard.classList.remove('is-swapping'));
            }
        };

        if (fade) {
            textCard.classList.add('is-swapping');
            setTimeout(applyContent, 200);
        } else {
            applyContent();
        }

        tabs.forEach((t, i) => t.classList.toggle('active', i === index));
        activeIndex = index;
    }

    function goTo(index, opts) {
        const wrapped = (index + tabs.length) % tabs.length;
        renderTab(wrapped, opts);
    }

    function startAutoplay() {
        stopAutoplay();
        autoplayTimer = setInterval(() => goTo(activeIndex + 1), AUTOPLAY_MS);
    }

    function stopAutoplay() {
        if (autoplayTimer) {
            clearInterval(autoplayTimer);
            autoplayTimer = null;
        }
    }

    tabs.forEach((tab, i) => {
        tab.addEventListener('click', () => {
            goTo(i);
            startAutoplay();
        });
    });

    prevBtn.addEventListener('click', () => {
        goTo(activeIndex - 1);
        startAutoplay();
    });

    nextBtn.addEventListener('click', () => {
        goTo(activeIndex + 1);
        startAutoplay();
    });

    const heroBanner = document.getElementById('hero-banner');
    heroBanner.addEventListener('mouseenter', stopAutoplay);
    heroBanner.addEventListener('mouseleave', startAutoplay);

    // Initialize hero text to match the tab already marked active,
    // without a fade on first load.
    renderTab(activeIndex, { fade: false });
    startAutoplay();
})();