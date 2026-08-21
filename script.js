(function () {

    const tabs = Array.from(document.querySelectorAll(".tab-item"));
    const categoryEl = document.querySelector(".category-tag");
    const titleEl = document.querySelector(".hero-title");
    const descEl = document.querySelector(".hero-description");
    const heroImage = document.getElementById("hero-image");
    const textCard = document.querySelector(".hero-text-card");

    const prevBtn = document.getElementById("prevArrow");
    const nextBtn = document.getElementById("nextArrow");

    const menuBtn = document.getElementById("menu-btn");
    const mainMenu = document.getElementById("main-menu");

    const navLinks = document.querySelectorAll(".nav-link");
    const pageSections = document.querySelectorAll(".page-section");

    let activeIndex = tabs.findIndex(function (tab) {
        return tab.classList.contains("active");
    });

    if (activeIndex === -1) {
        activeIndex = 0;
    }

    let autoplayTimer;
    const autoplayTime = 6000;

    function changeSlide(index) {

        if (index >= tabs.length) {
            index = 0;
        }

        if (index < 0) {
            index = tabs.length - 1;
        }

        const tab = tabs[index];

        textCard.classList.add("is-swapping");

        setTimeout(function () {

            categoryEl.textContent = tab.dataset.category;
            titleEl.textContent = tab.dataset.title;
            descEl.textContent = tab.dataset.desc;

            if (tab.dataset.image) {
                heroImage.src = tab.dataset.image;
            }

            tabs.forEach(function (item) {
                item.classList.remove("active");
            });

            tab.classList.add("active");

            activeIndex = index;

            textCard.classList.remove("is-swapping");

        }, 200);
    }

    function startAutoplay() {

        stopAutoplay();

        autoplayTimer = setInterval(function () {
            changeSlide(activeIndex + 1);
        }, autoplayTime);
    }

    function stopAutoplay() {

        if (autoplayTimer) {
            clearInterval(autoplayTimer);
        }
    }

    tabs.forEach(function (tab, index) {

        tab.addEventListener("click", function () {

            changeSlide(index);
            startAutoplay();

        });

    });

    prevBtn.addEventListener("click", function () {

        changeSlide(activeIndex - 1);
        startAutoplay();

    });

    nextBtn.addEventListener("click", function () {

        changeSlide(activeIndex + 1);
        startAutoplay();

    });

    menuBtn.addEventListener("click", function () {

        mainMenu.classList.toggle("open");

        if (mainMenu.classList.contains("open")) {
            menuBtn.textContent = "✕";
        } else {
            menuBtn.textContent = "☰";
        }

    });

    navLinks.forEach(function (link) {

        link.addEventListener("click", function () {

            const sectionName = link.dataset.section;

            pageSections.forEach(function (section) {
                section.classList.remove("active-section");
            });

            navLinks.forEach(function (item) {
                item.classList.remove("active-nav");
            });

            document.getElementById(sectionName).classList.add("active-section");

            link.classList.add("active-nav");

            mainMenu.classList.remove("open");
            menuBtn.textContent = "☰";

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        });

    });

    window.addEventListener("resize", function () {

        if (window.innerWidth > 800) {
            mainMenu.classList.remove("open");
            menuBtn.textContent = "☰";
        }

    });

    startAutoplay();

})();