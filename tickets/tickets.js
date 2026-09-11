const SPORTS_DB_BASE = "https://www.thesportsdb.com/api/v1/json/123";
const today = new Date();

const preferredLeagueWords = [
    "UEFA",
    "FIFA",
    "World Cup",
    "Qualifier",
    "International",
    "Nations League",
    "Euro"
];

const europeanLeagueWords = [
    "English Premier League",
    "Spanish La Liga",
    "German Bundesliga",
    "Italian Serie A",
    "French Ligue 1",
    "UEFA",
    "Scottish Premier League",
    "Dutch Eredivisie",
    "Portuguese Primeira Liga",
    "Belgian Pro League",
    "Swedish Allsvenskan",
    "Norwegian Eliteserien",
    "Irish Premier Division"
];

const fallbackMatches = [
    {
        league: "FIFA World Cup Qualifiers",
        homeTeam: "Italy",
        awayTeam: "Norway",
        dateEvent: "2026-11-18",
        strTime: "20:45:00",
        strVenue: "San Siro",
        strCity: "Milan, Italy",
        status: "Tickets Available"
    },
    {
        league: "UEFA Nations League",
        homeTeam: "Portugal",
        awayTeam: "Netherlands",
        dateEvent: "2026-11-19",
        strTime: "21:00:00",
        strVenue: "Estadio da Luz",
        strCity: "Lisbon, Portugal",
        status: "Selling Fast"
    },
    {
        league: "FIFA World Cup Qualifiers",
        homeTeam: "Spain",
        awayTeam: "Croatia",
        dateEvent: "2026-11-20",
        strTime: "20:45:00",
        strVenue: "Estadio La Cartuja",
        strCity: "Seville, Spain",
        status: "Limited Availability"
    },
    {
        league: "UEFA European Qualifiers",
        homeTeam: "France",
        awayTeam: "Denmark",
        dateEvent: "2026-11-20",
        strTime: "20:45:00",
        strVenue: "Stade de France",
        strCity: "Paris, France",
        status: "Tickets Available"
    },
    {
        league: "International Friendly",
        homeTeam: "England",
        awayTeam: "Belgium",
        dateEvent: "2026-11-21",
        strTime: "19:45:00",
        strVenue: "Wembley Stadium",
        strCity: "London, England",
        status: "Coming Soon"
    },
    {
        league: "UEFA Nations League",
        homeTeam: "Germany",
        awayTeam: "Poland",
        dateEvent: "2026-11-22",
        strTime: "20:45:00",
        strVenue: "Olympiastadion",
        strCity: "Berlin, Germany",
        status: "Selling Fast"
    }
];

async function loadTicketsPage() {
    await Promise.all([loadUpcomingMatches(), loadMatchday()]);
}

async function loadUpcomingMatches() {
    const statusEl = document.getElementById("matchesStatus");
    const gridEl = document.getElementById("matchesGrid");

    try {
        const events = await collectFutureEvents(14);
        const prioritized = prioritizeUpcomingEvents(events).slice(0, 8);
        const matches = prioritized.length >= 6
            ? prioritized
            : [...prioritized, ...fallbackMatches].slice(0, 8);

        renderUpcomingMatches(matches, gridEl);
        statusEl.textContent = prioritized.length >= 6
            ? "Upcoming football fixtures are sorted automatically by date."
            : "Live match data is limited right now, so fallback showcase matches are filling the remaining cards.";
    } catch (error) {
        console.error("Could not load upcoming ticket matches.", error);
        renderUpcomingMatches(fallbackMatches, gridEl);
        statusEl.textContent = "Couldn't load the live schedule, so fallback match cards are being shown.";
    }
}

async function loadMatchday() {
    const statusEl = document.getElementById("matchdayStatus");
    const gridEl = document.getElementById("matchdayGrid");

    try {
        const events = await collectFutureEvents(2);
        const liveOrNext = getMatchdayEvents(events).slice(0, 4);
        const items = liveOrNext.length ? liveOrNext : fallbackMatches.slice(0, 4);

        renderMatchday(items, gridEl);
        statusEl.textContent = liveOrNext.length
            ? "Current live or nearest upcoming football matches."
            : "No live football match is available right now, so the next scheduled matches are shown.";
    } catch (error) {
        console.error("Could not load matchday data.", error);
        renderMatchday(fallbackMatches.slice(0, 4), gridEl);
        statusEl.textContent = "Matchday is showing fallback entries right now.";
    }
}

async function collectFutureEvents(daysToCheck) {
    const requests = [];

    for (let index = 0; index < daysToCheck; index += 1) {
        const date = new Date(today);
        date.setDate(today.getDate() + index);
        const dayString = date.toISOString().split("T")[0];
        requests.push(fetchJson(`${SPORTS_DB_BASE}/eventsday.php?d=${dayString}&s=Soccer`));
    }

    const responses = await Promise.allSettled(requests);
    const events = [];

    responses.forEach((result) => {
        if (result.status !== "fulfilled") {
            return;
        }

        (result.value.events || []).forEach((event) => {
            if (isFutureEvent(event)) {
                events.push(event);
            }
        });
    });

    return events;
}

async function fetchJson(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
    }

    return response.json();
}

function isFutureEvent(event) {
    if (!event || !event.dateEvent || !event.strHomeTeam || !event.strAwayTeam) {
        return false;
    }

    const eventDate = getEventDate(event);
    if (!eventDate) {
        return false;
    }

    return eventDate.getTime() >= today.getTime() && event.strStatus !== "FT";
}

function prioritizeUpcomingEvents(events) {
    return events
        .filter((event) => event.strLeague)
        .sort((first, second) => {
            const firstPreferred = getLeaguePriority(first.strLeague);
            const secondPreferred = getLeaguePriority(second.strLeague);

            if (firstPreferred !== secondPreferred) {
                return firstPreferred - secondPreferred;
            }

            return getEventDate(first).getTime() - getEventDate(second).getTime();
        })
        .map((event, index) => ({
            league: event.strLeague,
            homeTeam: event.strHomeTeam,
            awayTeam: event.strAwayTeam,
            homeBadge: event.strHomeTeamBadge || "",
            awayBadge: event.strAwayTeamBadge || "",
            dateEvent: event.dateEvent,
            strTime: event.strTime,
            strVenue: event.strVenue || "Official venue to be confirmed",
            strCity: event.strCity || "Host city update coming soon",
            status: getTicketStatus(index)
        }));
}

function getLeaguePriority(leagueName) {
    if (preferredLeagueWords.some((word) => leagueName.includes(word))) {
        return 0;
    }

    if (europeanLeagueWords.some((word) => leagueName.includes(word))) {
        return 1;
    }

    return 2;
}

function getTicketStatus(index) {
    const statuses = [
        "Tickets Available",
        "Selling Fast",
        "Coming Soon",
        "Limited Availability"
    ];

    return statuses[index % statuses.length];
}

function renderUpcomingMatches(matches, container) {
    container.innerHTML = matches.map((match) => `
        <article class="ticket-card">
          <div class="ticket-card-top">
            <span class="competition-badge">${escapeHtml(match.league)}</span>
            <span class="ticket-status ${statusClass(match.status)}">${escapeHtml(match.status)}</span>
          </div>
          <div class="teams-row">
            <div class="team-block">
              ${renderTeamVisual(match.homeTeam, match.homeBadge)}
              <div class="team-name">${escapeHtml(match.homeTeam)}</div>
            </div>
            <div class="vs-block">VS<span class="match-time">${escapeHtml(formatTime(match.strTime))}</span></div>
            <div class="team-block">
              ${renderTeamVisual(match.awayTeam, match.awayBadge)}
              <div class="team-name">${escapeHtml(match.awayTeam)}</div>
            </div>
          </div>
          <div class="ticket-date">${escapeHtml(formatDate(match.dateEvent))}</div>
          <button type="button" class="details-toggle" aria-expanded="false">
            <span>Match details</span>
            <span class="details-chevron">▾</span>
          </button>
          <div class="ticket-details" hidden>
            <div class="ticket-meta-item">
              <span>Venue</span>
              <strong>${escapeHtml(match.strVenue)}</strong>
            </div>
            <div class="ticket-meta-item">
              <span>City</span>
              <strong>${escapeHtml(match.strCity)}</strong>
            </div>
            <div class="ticket-meta-item">
              <span>Date</span>
              <strong>${escapeHtml(formatDate(match.dateEvent))}</strong>
            </div>
            <div class="ticket-meta-item">
              <span>Ticket information</span>
              <strong>${escapeHtml(match.status)}</strong>
            </div>
            <a href="#hospitalitySection" class="primary-button">View Tickets</a>
          </div>
        </article>
    `).join("");
}

function renderTeamVisual(teamName, badgeUrl) {
    const safeBadgeUrl = typeof badgeUrl === "string" ? badgeUrl.trim() : "";

    if (safeBadgeUrl) {
        return `
            <div class="team-icon team-icon-badge">
              <img
                src="${escapeHtml(safeBadgeUrl)}"
                alt="${escapeHtml(teamName)} badge"
                loading="lazy"
                onerror="this.parentElement.classList.add('team-icon-fallback'); this.remove(); this.parentElement.textContent='${escapeHtml(getTeamSymbol(teamName))}';"
              >
            </div>
        `;
    }

    return `<div class="team-icon team-icon-fallback">${escapeHtml(getTeamSymbol(teamName))}</div>`;
}

function getMatchdayEvents(events) {
    return events
        .filter((event) => event.strLeague)
        .sort((first, second) => getEventDate(first).getTime() - getEventDate(second).getTime())
        .slice(0, 4)
        .map((event) => ({
            league: event.strLeague,
            homeTeam: event.strHomeTeam,
            awayTeam: event.strAwayTeam,
            dateEvent: event.dateEvent,
            strTime: event.strTime,
            statusLabel: getMatchdayLabel(event),
            scoreLine: getScoreLine(event)
        }));
}

function renderMatchday(matches, container) {
    container.innerHTML = matches.map((match) => `
        <article class="matchday-card">
          <span class="matchday-label ${matchdayClass(match.statusLabel)}">${escapeHtml(match.statusLabel)}</span>
          <div class="team-subtitle">${escapeHtml(match.league)}</div>
          <h3>${escapeHtml(match.homeTeam)} vs ${escapeHtml(match.awayTeam)}</h3>
          <div class="matchday-score">${escapeHtml(match.scoreLine)}</div>
          <div class="matchday-meta">${escapeHtml(formatDate(match.dateEvent))} • ${escapeHtml(formatTime(match.strTime))}</div>
        </article>
    `).join("");
}

function getMatchdayLabel(event) {
    if (event.strStatus && !["NS", "FT"].includes(event.strStatus)) {
        return "LIVE";
    }

    const eventDate = getEventDate(event);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (eventDate.toDateString() === today.toDateString()) {
        return "TODAY";
    }

    if (eventDate.toDateString() === tomorrow.toDateString()) {
        return "TOMORROW";
    }

    return "UPCOMING";
}

function getScoreLine(event) {
    if (event.intHomeScore !== null && event.intHomeScore !== undefined && event.intAwayScore !== null && event.intAwayScore !== undefined) {
        return `${event.intHomeScore} - ${event.intAwayScore}`;
    }

    return "vs";
}

function getEventDate(event) {
    if (!event.dateEvent) {
        return null;
    }

    const timePart = event.strTime || "00:00:00";
    const parsed = new Date(`${event.dateEvent}T${timePart}`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
        return "Date to be confirmed";
    }

    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function formatTime(timeString) {
    if (!timeString) {
        return "TBC";
    }

    const [hours, minutes] = timeString.split(":");
    return `${hours}:${minutes}`;
}

function getTeamSymbol(teamName) {
    const flags = {
        Italy: "IT",
        Norway: "NO",
        Portugal: "PT",
        Netherlands: "NL",
        Spain: "ES",
        Croatia: "HR",
        France: "FR",
        Denmark: "DK",
        England: "EN",
        Belgium: "BE",
        Germany: "DE",
        Poland: "PL"
    };

    if (flags[teamName]) {
        return flags[teamName];
    }

    return teamName.split(" ").map((word) => word[0]).join("").slice(0, 2).toUpperCase();
}

function statusClass(status) {
    if (status === "Tickets Available") return "available";
    if (status === "Selling Fast") return "fast";
    if (status === "Limited Availability") return "limited";
    return "soon";
}

function matchdayClass(label) {
    if (label === "LIVE") return "live";
    if (label === "TODAY") return "today";
    return "upcoming";
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

document.addEventListener("click", (event) => {
    const toggle = event.target.closest(".details-toggle");

    if (!toggle) {
        return;
    }

    const details = toggle.nextElementSibling;
    if (!details) {
        return;
    }

    const isOpen = toggle.getAttribute("aria-expanded") === "true";

    toggle.setAttribute("aria-expanded", String(!isOpen));
    toggle.querySelector(".details-chevron").textContent = isOpen ? "▾" : "▴";

    if (isOpen) {
        details.style.maxHeight = `${details.scrollHeight}px`;
        requestAnimationFrame(() => {
            details.style.maxHeight = "0px";
            details.classList.remove("open");
        });
        window.setTimeout(() => {
            if (toggle.getAttribute("aria-expanded") === "false") {
                details.hidden = true;
            }
        }, 260);
        return;
    }

    details.hidden = false;
    details.classList.add("open");
    details.style.maxHeight = "0px";
    requestAnimationFrame(() => {
        details.style.maxHeight = `${details.scrollHeight}px`;
    });
});
