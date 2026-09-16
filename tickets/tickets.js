const tournaments = [
    {
        id: "brazil-2027",
        shortLogo: {
            fifa: "FIFA",
            main: "W",
            sub: "Women's World Cup Brazil 2027"
        },
        title: "FIFA Women's World Cup Brazil 2027™",
        date: "24 June – 25 July 2027",
        accent: "#1f10ee",
        heroBg: "linear-gradient(150deg, rgba(2, 70, 18, 0.88), rgba(6, 113, 39, 0.92)), linear-gradient(26deg, transparent 0 30%, #d2aa00 31% 47%, transparent 48%), linear-gradient(154deg, transparent 0 35%, #d2aa00 36% 54%, transparent 55%)",
        cards: [
            {
                icon: "ticket",
                headingKey: "ticketsCard",
                textKey: "ticketsBrazilText",
                buttonKey: "registerInterest"
            },
            {
                icon: "diamond",
                headingKey: "hospitalityCard",
                textKey: "hospitalityBrazilText",
                buttonKey: "registerInterest"
            },
            {
                icon: "info",
                headingKey: "moreInfoCard",
                textKey: "moreInfoBrazilText",
                buttonKey: "viewFaq"
            }
        ]
    },
    {
        id: "poland-2026",
        shortLogo: {
            fifa: "FIFA",
            main: "U20",
            sub: "Women's World Cup Poland 2026"
        },
        title: "FIFA U-20 Women's World Cup Poland 2026™",
        date: "5 - 27 September 2026",
        accent: "#7f3b86",
        heroBg: "linear-gradient(135deg, rgba(8, 78, 35, 0.78), rgba(166, 191, 58, 0.82)), radial-gradient(circle at 25% 18%, rgba(255, 255, 255, 0.18), transparent 28%), repeating-linear-gradient(135deg, rgba(255,255,255,0.12) 0 8px, transparent 8px 28px)",
        cards: [
            {
                icon: "ticket",
                headingKey: "ticketsCard",
                textKey: "ticketsPolandText",
                buttonKey: "buyNow"
            }
        ]
    },
    {
        id: "morocco-2026",
        shortLogo: {
            fifa: "FIFA",
            main: "U17",
            sub: "Women's World Cup Morocco 2026"
        },
        title: "FIFA U-17 Women's World Cup Morocco 2026™",
        date: "17 October - 7 November 2026",
        accent: "#9258f1",
        heroBg: "linear-gradient(135deg, rgba(9, 138, 107, 0.94), rgba(7, 155, 121, 0.9)), repeating-radial-gradient(circle at 50% 42%, transparent 0 40px, rgba(33, 44, 159, 0.72) 42px 50px)",
        cards: [
            {
                icon: "ticket",
                headingKey: "ticketsCard",
                textKey: "ticketsMoroccoText",
                buttonKey: "buyNow"
            }
        ]
    },
    {
        id: "qatar-2026",
        shortLogo: {
            fifa: "FIFA",
            main: "U17",
            sub: "World Cup Qatar 2026"
        },
        title: "FIFA U-17 World Cup Qatar 2026™",
        date: "19 November - 13 December 2026",
        accent: "#75002d",
        heroBg: "linear-gradient(135deg, rgba(159, 0, 65, 0.96), rgba(111, 0, 45, 0.96)), radial-gradient(circle at 78% 42%, rgba(234, 26, 90, 0.46), transparent 28%), linear-gradient(108deg, transparent 0 78%, #f16b18 79% 82%, #f8dd24 83% 85%, transparent 86%)",
        cards: [
            {
                icon: "ticket",
                headingKey: "ticketsCard",
                textKey: "ticketsQatarText",
                buttonKey: "registerNow"
            }
        ]
    },
    {
        id: "champions-cup",
        shortLogo: {
            fifa: "",
            main: "W",
            sub: "Women's Champions Cup"
        },
        title: "FIFA Women's Champions Cup Miami 2027™",
        date: "27 - 31 January 2027",
        accent: "#202b8c",
        heroBg: "linear-gradient(135deg, rgba(4, 14, 45, 0.97), rgba(6, 18, 63, 0.96)), linear-gradient(130deg, transparent 0 17%, rgba(245, 199, 67, 0.9) 18% 20%, transparent 21%), linear-gradient(315deg, transparent 0 16%, rgba(255,255,255,0.88) 17% 18%, transparent 19%)",
        cards: [
            {
                icon: "ticket",
                headingKey: "ticketsCard",
                textKey: "ticketsChampionsText",
                buttonKey: "registerInterest"
            }
        ]
    }
];

let activeTournamentId = tournaments[0].id;

function loadTicketsPage() {
    renderTournamentTabs();
    renderTournamentHero(tournaments[0]);
    translateEditorialCards();
}

function renderTournamentTabs() {
    const selector = document.getElementById("tournamentSelector");

    selector.innerHTML = tournaments.map((tournament) => `
        <button
          type="button"
          class="tournament-tab ${tournament.id === activeTournamentId ? "active" : ""}"
          style="--accent: ${tournament.accent}"
          data-tournament-id="${tournament.id}"
          aria-pressed="${tournament.id === activeTournamentId}"
        >
          <span class="tournament-logo">
            ${renderLogoMark(tournament.shortLogo)}
          </span>
        </button>
    `).join("");
}

function renderLogoMark(logo) {
    if (logo.sub === "Women's Champions Cup") {
        return `
            <span class="logo-symbol">W</span>
            <span class="logo-sub">${escapeHtml(logo.sub)}</span>
        `;
    }

    return `
        <span class="logo-fifa">${escapeHtml(logo.fifa)}</span>
        <span class="logo-main">${escapeHtml(logo.main)}</span>
        <span class="logo-sub">${escapeHtml(logo.sub)}</span>
    `;
}

function renderTournamentHero(tournament) {
    const hero = document.getElementById("tournamentHero");
    const title = document.getElementById("tournamentTitle");
    const date = document.getElementById("tournamentDate");
    const cardGrid = document.getElementById("ticketActionGrid");

    hero.classList.add("is-changing");

    window.setTimeout(() => {
        hero.style.setProperty("--hero-bg", tournament.heroBg);
        hero.style.setProperty("--accent", tournament.accent);
        title.textContent = tournament.title;
        date.textContent = tournament.date;
        cardGrid.className = tournament.cards.length === 1
            ? "ticket-action-grid single-card"
            : "ticket-action-grid";
        cardGrid.innerHTML = tournament.cards.map((card) => renderTicketCard(card, tournament.accent)).join("");
        hero.classList.remove("is-changing");
    }, 120);
}

function renderTicketCard(card, accent) {
    return `
        <article class="ticket-action-card" style="--accent: ${accent}">
          <div class="ticket-card-icon">${renderIcon(card.icon)}</div>
          <div class="ticket-action-head">${escapeHtml(t(card.headingKey))}</div>
          <div class="ticket-action-body">
            <p>${escapeHtml(t(card.textKey))}</p>
            <button type="button">${escapeHtml(t(card.buttonKey))}</button>
          </div>
        </article>
    `;
}

function renderIcon(icon) {
    if (icon === "diamond") {
        return `
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 4h12l3 5-9 11L3 9z"></path>
              <path d="M3 9h18"></path>
              <path d="M9 4 7 9l5 11 5-11-2-5"></path>
            </svg>
        `;
    }

    if (icon === "info") {
        return `
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="9"></circle>
              <path d="M12 10v7"></path>
              <path d="M12 7h.01"></path>
            </svg>
        `;
    }

    return `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 9a3 3 0 0 0 0 6v4h16v-4a3 3 0 0 0 0-6V5H4z"></path>
          <path d="M9 5v14"></path>
          <path d="M15 5v14"></path>
        </svg>
    `;
}

function handleTournamentClick(event) {
    const tab = event.target.closest(".tournament-tab");

    if (!tab) {
        return;
    }

    const selectedTournament = tournaments.find((tournament) => tournament.id === tab.dataset.tournamentId);

    if (!selectedTournament || selectedTournament.id === activeTournamentId) {
        return;
    }

    activeTournamentId = selectedTournament.id;
    renderTournamentTabs();
    renderTournamentHero(selectedTournament);
}

function translateEditorialCards() {
    document.querySelectorAll("[data-ticket-i18n]").forEach((element) => {
        element.textContent = t(element.dataset.ticketI18n);
    });
}

function t(key) {
    return window.FifaI18n ? window.FifaI18n.t(key) : key;
}

function escapeHtml(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

document.addEventListener("DOMContentLoaded", loadTicketsPage);
document.addEventListener("click", handleTournamentClick);
window.addEventListener("fifa-language-change", () => {
    const selectedTournament = tournaments.find((tournament) => tournament.id === activeTournamentId) || tournaments[0];
    renderTournamentTabs();
    renderTournamentHero(selectedTournament);
    translateEditorialCards();
});
