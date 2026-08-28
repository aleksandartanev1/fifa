(function () {
    var track = document.getElementById('tournamentTrack');
    var prev = document.getElementById('carouselPrev');
    var next = document.getElementById('carouselNext');
    if (!track || !prev || !next) return;

    function step() {
        var card = track.querySelector('.poster-card');
        return card ? card.getBoundingClientRect().width + 20 : 300;
    }

    prev.addEventListener('click', function () {
        track.scrollBy({ left: -step(), behavior: 'smooth' });
    });

    next.addEventListener('click', function () {
        track.scrollBy({ left: step(), behavior: 'smooth' });
    });
})();