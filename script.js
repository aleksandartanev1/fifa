(function () {
    const translations = {
        en: {
            topRewards: 'FIFA REWARDS',
            topFifaPlus: 'FIFA+',
            topStore: 'FIFA STORE',
            topCollect: 'FIFA COLLECT',
            language: 'Language',
            navTournaments: 'TOURNAMENTS & EVENTS',
            navMatches: 'MATCHES & STATS',
            navNews: 'NEWS',
            navRankings: 'RANKINGS',
            navTickets: 'TICKETS & HOSPITALITY',
            navPlay: 'PLAY',
            navInside: 'INSIDE FIFA',
            readMore: 'Read more',
            showLess: 'Show less',
            footerApp: 'Download the FIFA App today to enjoy more',
            viewTournament: 'View tournament',
            viewTickets: 'View tickets',
            readStory: 'Read more',
            watchNow: 'Watch now',
            exploreStore: 'View item',
            viewCollectible: 'View collectible',
            startNow: 'Start now'
        },
        mk: {
            topRewards: 'FIFA НАГРАДИ',
            topFifaPlus: 'FIFA+',
            topStore: 'FIFA ПРОДАВНИЦА',
            topCollect: 'FIFA КОЛЕКЦИЈА',
            language: 'Јазик',
            navTournaments: 'ТУРНИРИ И НАСТАНИ',
            navMatches: 'НАТПРЕВАРИ И СТАТИСТИКА',
            navNews: 'ВЕСТИ',
            navRankings: 'РАНГ ЛИСТА',
            navTickets: 'БИЛЕТИ И ГОСТИНСТВО',
            navPlay: 'ИГРАЈ',
            navInside: 'ВО FIFA',
            readMore: 'Прочитај повеќе',
            showLess: 'Прикажи помалку',
            footerApp: 'Преземете ја FIFA апликацијата за повеќе содржини',
            viewTournament: 'Види турнир',
            viewTickets: 'Види билети',
            readStory: 'Прочитај повеќе',
            watchNow: 'Гледај сега',
            exploreStore: 'Види производ',
            viewCollectible: 'Види колекционерски предмет',
            startNow: 'Започни'
        },
        sr: {
            topRewards: 'FIFA NAGRADE',
            topFifaPlus: 'FIFA+',
            topStore: 'FIFA PRODAVNICA',
            topCollect: 'FIFA KOLEKCIJA',
            language: 'Jezik',
            navTournaments: 'TURNIRI I DOGAĐAJI',
            navMatches: 'MEČEVI I STATISTIKA',
            navNews: 'VESTI',
            navRankings: 'RANG LISTA',
            navTickets: 'ULAZNICE I HOSPITALITY',
            navPlay: 'IGRAJ',
            navInside: 'UNUTAR FIFA',
            readMore: 'Pročitaj više',
            showLess: 'Prikaži manje',
            footerApp: 'Preuzmite FIFA aplikaciju za još sadržaja',
            viewTournament: 'Pogledaj turnir',
            viewTickets: 'Pogledaj ulaznice',
            readStory: 'Pročitaj više',
            watchNow: 'Gledaj sada',
            exploreStore: 'Pogledaj proizvod',
            viewCollectible: 'Pogledaj kolekcionarski predmet',
            startNow: 'Pokreni'
        }
    };

    const savedLanguage = localStorage.getItem('fifaLanguage') || 'en';
    const languageToggle = document.getElementById('languageToggle');
    const languageDropdown = document.getElementById('languageDropdown');
    const languageOptions = Array.from(document.querySelectorAll('.language-option'));
    const readMoreBtn = document.querySelector('.btn-read-more');
    const extraInfoEl = document.getElementById('heroExtraInfo');

    function applyTranslations(language) {
        const dictionary = translations[language] || translations.en;
        document.documentElement.lang = language;

        document.querySelectorAll('[data-i18n]').forEach((element) => {
            const key = element.dataset.i18n;
            if (dictionary[key]) {
                element.textContent = dictionary[key];
            }
        });

        if (readMoreBtn && extraInfoEl) {
            readMoreBtn.textContent = extraInfoEl.classList.contains('open') ? dictionary.showLess : dictionary.readMore;
        }

        languageOptions.forEach((option) => {
            option.classList.toggle('active', option.dataset.language === language);
        });
    }

    function closeLanguageDropdown() {
        if (languageDropdown) {
            languageDropdown.classList.remove('open');
        }
    }

    if (languageToggle && languageDropdown) {
        languageToggle.addEventListener('click', () => {
            languageDropdown.classList.toggle('open');
        });

        document.addEventListener('click', (event) => {
            const clickedInside = event.target.closest('.language-menu');
            if (!clickedInside) {
                closeLanguageDropdown();
            }
        });
    }

    languageOptions.forEach((option) => {
        option.addEventListener('click', () => {
            const selectedLanguage = option.dataset.language;
            localStorage.setItem('fifaLanguage', selectedLanguage);
            applyTranslations(selectedLanguage);
            closeLanguageDropdown();
        });
    });

    if (readMoreBtn && extraInfoEl) {
        readMoreBtn.addEventListener('click', (event) => {
            event.preventDefault();
            extraInfoEl.classList.toggle('open');
            applyTranslations(localStorage.getItem('fifaLanguage') || 'en');
        });
    }

    const tabs = Array.from(document.querySelectorAll('.tab-item'));
    const categoryEl = document.querySelector('.category-tag');
    const titleEl = document.querySelector('.hero-title');
    const descEl = document.querySelector('.hero-description');
    const textCard = document.querySelector('.hero-text-card');
    const heroImage = document.getElementById('heroMainImage');
    const nextUpTitle = document.getElementById('nextUpTitle');
    const nextUpImage = document.getElementById('nextUpImage');
    const nextUpCard = document.getElementById('heroSidebarCard');
    const prevBtn = document.getElementById('prevArrow');
    const nextBtn = document.getElementById('nextArrow');
    const heroBanner = document.getElementById('hero-banner');

    if (tabs.length && categoryEl && titleEl && descEl && textCard && heroImage && nextUpTitle && nextUpImage && prevBtn && nextBtn && heroBanner) {
        let activeIndex = tabs.findIndex((tab) => tab.classList.contains('active'));
        let autoplayTimer = null;
        const autoplayMs = 6000;

        if (activeIndex === -1) {
            activeIndex = 0;
        }

        function renderTab(index, fade) {
            const tab = tabs[index];
            const category = tab.querySelector('.tab-category').textContent.trim();
            const headline = tab.querySelector('.tab-headline').textContent.trim();
            const description = tab.dataset.desc || '';
            const image = tab.dataset.image || '';
            const imageAlt = tab.dataset.imageAlt || headline;
            const nextTitle = tab.dataset.nextTitle || 'Next featured story';
            const nextImage = tab.dataset.nextImage || image;

            function updateContent() {
                categoryEl.textContent = category;
                titleEl.textContent = headline;
                descEl.textContent = description;
                heroImage.src = image;
                heroImage.alt = imageAlt;
                nextUpTitle.textContent = nextTitle;
                nextUpImage.src = nextImage;
                nextUpImage.alt = nextTitle;

                if (fade) {
                    requestAnimationFrame(() => textCard.classList.remove('is-swapping'));
                }
            }

            if (fade) {
                textCard.classList.add('is-swapping');
                setTimeout(updateContent, 200);
            } else {
                updateContent();
            }

            tabs.forEach((item, itemIndex) => {
                item.classList.toggle('active', itemIndex === index);
            });

            activeIndex = index;
        }

        function goTo(index, fade) {
            const wrappedIndex = (index + tabs.length) % tabs.length;
            renderTab(wrappedIndex, fade);
        }

        function startAutoplay() {
            stopAutoplay();
            autoplayTimer = setInterval(() => {
                goTo(activeIndex + 1, true);
            }, autoplayMs);
        }

        function stopAutoplay() {
            if (autoplayTimer) {
                clearInterval(autoplayTimer);
                autoplayTimer = null;
            }
        }

        tabs.forEach((tab, index) => {
            tab.addEventListener('click', () => {
                goTo(index, true);
                startAutoplay();
            });
        });

        prevBtn.addEventListener('click', () => {
            goTo(activeIndex - 1, true);
            startAutoplay();
        });

        nextBtn.addEventListener('click', () => {
            goTo(activeIndex + 1, true);
            startAutoplay();
        });

        if (nextUpCard) {
            nextUpCard.addEventListener('click', () => {
                goTo(activeIndex + 1, true);
                startAutoplay();
            });
        }

        heroBanner.addEventListener('mouseenter', stopAutoplay);
        heroBanner.addEventListener('mouseleave', startAutoplay);

        renderTab(activeIndex, false);
        startAutoplay();
    }

    applyTranslations(savedLanguage);
})();
