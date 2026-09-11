/* ============================================================
   FIFA Match Centre — matches.html
   Data source: TheSportsDB public API (v1, free test key "3")
   https://www.thesportsdb.com/api.php
   No API key/registration needed, CORS-enabled, safe to call
   directly from a static site (e.g. GitHub Pages).
   If a request fails (offline, rate-limited, API down), the
   page falls back to a small set of built-in sample fixtures
   so the layout never breaks.
   ============================================================ */

(function () {
    "use strict";

    var API_BASE = "https://www.thesportsdb.com/api/v1/json/3";


    var LEAGUES = [
        { id: "4334", apiName: "French Ligue 1", label: "Ligue 1", color: "#0b1f4b" },
        { id: "4331", apiName: "German Bundesliga", label: "Bundesliga", color: "#d20515" },
        { id: "4332", apiName: "Italian Serie A", label: "Serie A", color: "#024494" },
        { id: "4335", apiName: "Spanish La Liga", label: "La Liga", color: "#ee8707" },
        { id: "4331", apiName: "German Bundesliga", label: "Bundesliga", color: "#d20515" }
    ];



    var FALLBACK = {
        "4328": {
            matchday: "Match Day 5",
            matches: [{ home: "Arsenal", away: "Chelsea", time: "16:00" }],
            table: [
                { pos: 1, team: "Manchester City", p: 4, w: 4, pts: 12 },
                { pos: 2, team: "Liverpool", p: 4, w: 3, pts: 10 }
            ]
        },
        "4335": {
            matchday: "Match Day 5",
            matches: [{ home: "Real Madrid", away: "FC Barcelona", time: "21:00" }],
            table: [
                { pos: 1, team: "Real Madrid", p: 4, w: 4, pts: 12 },
                { pos: 2, team: "FC Barcelona", p: 4, w: 3, pts: 10 }
            ]
        },
        "4332": {
            matchday: "Match Day 4",
            matches: [{ home: "Inter", away: "AC Milan", time: "20:45" }],
            table: [
                { pos: 1, team: "Inter", p: 3, w: 3, pts: 9 },
                { pos: 2, team: "Juventus", p: 3, w: 2, pts: 7 }
            ]
        },
        "4334": {
            matchday: "Match Day 4",
            matches: [{ home: "Rennes", away: "Olympique Marseille", time: "20:45" }],
            table: [
                { pos: 1, team: "AS Monaco", p: 3, w: 3, pts: 9 },
                { pos: 2, team: "Paris FC", p: 3, w: 2, pts: 7 }
            ]
        },
        "4331": {
            matchday: "Match Day 3",
            matches: [{ home: "Union Berlin", away: "FC Schalke 04", time: "20:30" }],
            table: [
                { pos: 1, team: "FC Bayern München", p: 1, w: 1, pts: 3 },
                { pos: 2, team: "SC Freiburg", p: 1, w: 1, pts: 3 }
            ]
        }
    };

    var state = {
        today: startOfDay(new Date()),
        selectedDate: startOfDay(new Date()),
        windowStart: -5,
        liveOnly: false,
        sortBy: "time",
        activeLeagues: {},
        searchTerm: "",
        leagueBadges: {}
    };

    LEAGUES.forEach(function (l) {
        state.activeLeagues[l.id] = true;
    });

    function startOfDay(d) {
        var n = new Date(d.getTime());
        n.setHours(0, 0, 0, 0);
        return n;
    }

    function pad(n) {
        return n < 10 ? "0" + n : "" + n;
    }

    function isoDate(d) {
        return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
    }

    function isSameDay(a, b) {
        return (
            a.getFullYear() === b.getFullYear() &&
            a.getMonth() === b.getMonth() &&
            a.getDate() === b.getDate()
        );
    }

    function seasonFor(d) {
        var y = d.getFullYear();
        var m = d.getMonth() + 1;
        return m >= 7 ? y + "-" + (y + 1) : (y - 1) + "-" + y;
    }

    function fetchJSON(url, timeoutMs) {
        var controller = typeof AbortController !== "undefined" ? new AbortController() : null;
        var timer = null;
        if (controller) {
            timer = setTimeout(function () {
                controller.abort();
            }, timeoutMs || 8000);
        }
        return fetch(url, controller ? { signal: controller.signal } : {})
            .then(function (res) {
                if (timer) clearTimeout(timer);
                if (!res.ok) throw new Error("HTTP " + res.status);
                return res.json();
            })
            .catch(function (err) {
                if (timer) clearTimeout(timer);
                throw err;
            });
    }

    function getLeagueBadge(league) {
        if (state.leagueBadges[league.id] !== undefined) {
            return Promise.resolve(state.leagueBadges[league.id]);
        }
        return fetchJSON(API_BASE + "/lookupleague.php?id=" + league.id, 6000)
            .then(function (data) {
                var l = data && data.leagues && data.leagues[0];
                var badge = l && l.strBadge ? l.strBadge : null;
                state.leagueBadges[league.id] = badge;
                return badge;
            })
            .catch(function () {
                state.leagueBadges[league.id] = null;
                return null;
            });
    }

    function getEvents(league, dateStr) {
        var url = API_BASE + "/eventsday.php?d=" + dateStr + "&l=" + encodeURIComponent(league.id);
        return fetchJSON(url, 8000).then(function (data) {
            return (data && data.events) || [];
        });
    }

    function getTable(league, season) {
        var url = API_BASE + "/lookuptable.php?l=" + league.id + "&s=" + season;
        return fetchJSON(url, 8000).then(function (data) {
            return (data && data.table) || [];
        });
    }

    // ---------- Date strip ----------

    var dowNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

    function buildDateStrip() {
        var strip = document.getElementById("dateStrip");
        strip.innerHTML = "";
        for (var i = state.windowStart; i < state.windowStart + 11; i++) {
            var d = new Date(state.today.getTime());
            d.setDate(state.today.getDate() + i);

            var btn = document.createElement("button");
            btn.type = "button";
            btn.className = "date-item";
            if (isSameDay(d, state.selectedDate)) btn.className += " selected";

            var dowLabel = isSameDay(d, state.today) ? "TODAY" : dowNames[d.getDay()];
            btn.innerHTML =
                '<span class="dow">' + dowLabel + '</span>' +
                '<span class="dom">' + pad(d.getDate()) + " " + monthAbbr(d.getMonth()) + '</span>';

            (function (theDate) {
                btn.addEventListener("click", function () {
                    state.selectedDate = startOfDay(theDate);
                    buildDateStrip();
                    loadMatches();
                });
            })(d);

            strip.appendChild(btn);
        }
    }

    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    function monthAbbr(m) {
        return monthNames[m];
    }

    function shiftWindow(delta) {
        state.windowStart += delta;
        buildDateStrip();
    }

    // ---------- Rendering ----------

    function timeToMinutes(t) {
        if (!t) return 99999;
        var parts = t.split(":");
        return parseInt(parts[0], 10) * 60 + parseInt(parts[1] || "0", 10);
    }

    function isLiveNow(dateStr, timeStr) {
        if (!isSameDay(new Date(dateStr), state.today)) return false;
        if (!timeStr) return false;
        var now = new Date();
        var parts = timeStr.split(":");
        var kickoff = new Date();
        kickoff.setHours(parseInt(parts[0], 10), parseInt(parts[1] || "0", 10), 0, 0);
        var diffMin = (now - kickoff) / 60000;
        return diffMin >= 0 && diffMin <= 130;
    }


    var teamBadges = {};

    function getTeamBadgeUrl(teamName, badgeApiUrl) {

        if (badgeApiUrl) return badgeApiUrl;


        var safeName = encodeURIComponent(teamName || 'Team');
        return 'https://ui-avatars.com/api/?name=' + safeName + '&background=0b1f4b&color=ffffff&bold=true&length=2';
    }

    function renderBadge(teamName, badgeApiUrl) {
        var safeName = (teamName && typeof teamName === 'string') ? teamName : String(teamName || '');
        if (!safeName) return '<span class="team-dot-fallback">?</span>';

        var badgeUrl = getTeamBadgeUrl(safeName, badgeApiUrl);

        return '<img class="team-badge-img" src="' + badgeUrl + '" alt="' + escapeHtml(safeName) + '" onerror="this.src=\'https://ui-avatars.com/api/?name=' + encodeURIComponent(safeName) + '&background=0b1f4b&color=ffffff\'">';
    }


    var renderTeamBadge = renderBadge;

    function renderLeagueBlock(league, payload, usedFallback) {
        var matches = payload.matches.filter(function (m) {
            return matchPassesFilters(league, m);
        });

        if (state.searchTerm && !leagueMatchesSearch(league, payload)) {
            return "";
        }

        if (!matches.length && payload.matches.length && state.liveOnly) {
            return "";
        }

        var matchesHtml = matches.length
            ? matches
                .map(function (m) {
                    var live = isLiveNow(m.dateEvent || isoDate(state.selectedDate), m.time);


                    var homeBadge = renderBadge(m.home || m.strHomeTeam, m.strHomeTeamBadge);
                    var awayBadge = renderBadge(m.away || m.strAwayTeam, m.strAwayTeamBadge);

                    return (
                        '<div class="match-row">' +
                        '<div class="match-team home">' + homeBadge + '<span>' + escapeHtml(m.home || m.strHomeTeam) + '</span></div>' +
                        '<div class="match-time' + (live ? " live" : "") + '">' + (live ? "LIVE" : escapeHtml(m.time || "TBD")) + "</div>" +
                        '<div class="match-team away"><span>' + escapeHtml(m.away || m.strAwayTeam) + '</span>' + awayBadge + "</div>" +
                        "</div>"
                    );
                })
                .join("")
            : '<div class="state-message">No fixtures for this day.</div>';

        var tableRows = payload.table
            .slice(0, 2)
            .map(function (row) {
                return (
                    "<tr><td>" + row.pos + "</td><td>" + escapeHtml(row.team) + "</td><td>" + row.p + "</td><td>" + row.w + "</td><td>" + row.pts + "</td></tr>"
                );
            })
            .join("");

        var badge = renderBadge(league, state.leagueBadges[league.id]);

        return (
            '<div class="league-block" data-league="' + league.id + '">' +
            '<div class="league-matches-card">' +
            '<div class="league-card-header">' + badge + "<span>" + league.label + "</span></div>" +
            (payload.matchday ? '<div class="matchday-label">' + escapeHtml(payload.matchday) + "</div>" : "") +
            matchesHtml +
            "</div>" +
            '<div class="league-table-card">' +
            '<div class="league-card-header">' + badge + "<span>" + league.label + '</span><button type="button" class="show-table-link">Show table</button></div>' +
            (payload.table.length
                ? '<table class="mini-table"><thead><tr><th>Pos</th><th>Team</th><th>P</th><th>W</th><th>Pts</th></tr></thead><tbody>' + tableRows + "</tbody></table>"
                : '<div class="state-message">Table unavailable.</div>') +
            "</div>" +
            "</div>" +
            (usedFallback ? '<div class="data-source-note is-fallback">Showing sample data for ' + league.label + " — live API data could not be reached.</div>" : "")
        );
    }

    function matchPassesFilters(league, m) {
        if (!state.activeLeagues[league.id]) return false;
        if (state.liveOnly) {
            return isLiveNow(m.dateEvent || isoDate(state.selectedDate), m.time);
        }
        return true;
    }

    function leagueMatchesSearch(league, payload) {
        var term = state.searchTerm.toLowerCase();
        if (league.label.toLowerCase().indexOf(term) !== -1) return true;
        return payload.matches.some(function (m) {
            return (m.home + " " + m.away).toLowerCase().indexOf(term) !== -1;
        });
    }

    function escapeHtml(str) {
        return String(str == null ? "" : str).replace(/[&<>"']/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
        });
    }

    // ---------- Data loading ----------

    function loadMatches() {
        var container = document.getElementById("matchesContainer");
        container.innerHTML = '<div class="state-message">Loading fixtures…</div>';

        var dateStr = isoDate(state.selectedDate);
        var season = seasonFor(state.selectedDate);

        var leagueOrder = LEAGUES.slice();
        if (state.sortBy === "league") {
            leagueOrder.sort(function (a, b) {
                return a.label.localeCompare(b.label);
            });
        }

        var work = leagueOrder.map(function (league) {
            return Promise.all([getLeagueBadge(league), getEvents(league, dateStr), getTable(league, season)])
                .then(function (results) {
                    var events = results[1];
                    var table = results[2];
                    var usedFallback = false;

                    var mapped = events.map(function (e) {
                        return {
                            home: e.strHomeTeam,
                            away: e.strAwayTeam,
                            time: e.strTime ? e.strTime.slice(0, 5) : null,
                            dateEvent: e.dateEvent
                        };
                    });

                    if (state.sortBy === "time") {
                        mapped.sort(function (a, b) {
                            return timeToMinutes(a.time) - timeToMinutes(b.time);
                        });
                    }

                    var mappedTable = table.map(function (row) {
                        return {
                            pos: row.intRank,
                            team: row.strTeam,
                            p: row.intPlayed,
                            w: row.intWin,
                            pts: row.intPoints
                        };
                    });

                    var payload = {
                        matchday: mapped.length && events[0] && events[0].intRound ? "Match Day " + events[0].intRound : "",
                        matches: mapped,
                        table: mappedTable
                    };


                    if (!payload.matches.length && !payload.table.length && isSameDay(state.selectedDate, state.today) && FALLBACK[league.id]) {
                        payload = FALLBACK[league.id];
                        usedFallback = true;
                    }

                    return { league: league, payload: payload, usedFallback: usedFallback };
                })
                .catch(function () {
                    var fb = FALLBACK[league.id] || { matchday: "", matches: [], table: [] };
                    return { league: league, payload: fb, usedFallback: true };
                });
        });

        Promise.all(work).then(function (results) {
            var html = results
                .map(function (r) {
                    return renderLeagueBlock(r.league, r.payload, r.usedFallback);
                })
                .join("");

            container.innerHTML = html || '<div class="state-message">No fixtures match your filters for this day.</div>';

            var liveCount = results.reduce(function (sum, r) {
                return (
                    sum +
                    r.payload.matches.filter(function (m) {
                        return isLiveNow(m.dateEvent || isoDate(state.selectedDate), m.time);
                    }).length
                );
            }, 0);
            var liveLabel = document.getElementById("liveCountLabel");
            if (liveLabel) liveLabel.textContent = "Live (" + liveCount + ")";
        });
    }


    function setupControls() {
        document.getElementById("prevArrowDate").addEventListener("click", function () {
            shiftWindow(-1);
        });
        document.getElementById("nextArrowDate").addEventListener("click", function () {
            shiftWindow(1);
        });

        var liveSwitch = document.getElementById("liveSwitch");
        liveSwitch.addEventListener("change", function () {
            state.liveOnly = liveSwitch.checked;
            loadMatches();
        });

        var changeDayBtn = document.getElementById("changeDayBtn");
        changeDayBtn.addEventListener("click", function () {
            state.windowStart = -5;
            state.selectedDate = new Date(state.today.getTime());
            buildDateStrip();
            loadMatches();
        });

        var sortBtn = document.getElementById("sortBtn");
        var sortPanel = document.getElementById("sortPanel");
        sortBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            filterPanel.classList.remove("open");
            sortPanel.classList.toggle("open");
        });
        sortPanel.querySelectorAll("button").forEach(function (btn) {
            btn.addEventListener("click", function () {
                state.sortBy = btn.getAttribute("data-sort");
                sortPanel.querySelectorAll("button").forEach(function (b) {
                    b.classList.toggle("active", b === btn);
                });
                sortPanel.classList.remove("open");
                loadMatches();
            });
        });

        var filterBtn = document.getElementById("filterBtn");
        var filterPanel = document.getElementById("filterPanel");
        filterBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            sortPanel.classList.remove("open");
            filterPanel.classList.toggle("open");
        });
        filterPanel.querySelectorAll("input[type=checkbox]").forEach(function (cb) {
            cb.addEventListener("change", function () {
                state.activeLeagues[cb.value] = cb.checked;
                loadMatches();
            });
        });

        document.addEventListener("click", function () {
            sortPanel.classList.remove("open");
            filterPanel.classList.remove("open");
        });

        var searchInput = document.getElementById("matchSearchInput");
        var searchTimer = null;
        searchInput.addEventListener("input", function () {
            clearTimeout(searchTimer);
            searchTimer = setTimeout(function () {
                state.searchTerm = searchInput.value.trim();
                loadMatches();
            }, 200);
        });

        var genderButtons = document.querySelectorAll(".gender-toggle button");
        genderButtons.forEach(function (btn) {
            btn.addEventListener("click", function () {
                genderButtons.forEach(function (b) {
                    b.classList.remove("active");
                });
                btn.classList.add("active");
            });
        });

        // Language dropdown (lanbar) — matches the pattern used on index.html
        var langToggle = document.getElementById("languageToggle");
        var langDropdown = document.getElementById("languageDropdown");
        if (langToggle && langDropdown) {
            langToggle.addEventListener("click", function (e) {
                e.stopPropagation();
                langDropdown.classList.toggle("open");
            });
            document.addEventListener("click", function () {
                langDropdown.classList.remove("open");
            });
        }
    }

    function buildFilterPanel() {
        var filterPanel = document.getElementById("filterPanel");
        var html = '<div class="dropdown-title">Leagues</div>';
        html += LEAGUES.map(function (l) {
            return (
                '<label><input type="checkbox" value="' + l.id + '" checked style="width:auto;margin:0;"> ' + l.label + "</label>"
            );
        }).join("");
        filterPanel.innerHTML = html;
    }

    document.addEventListener("DOMContentLoaded", function () {
        buildFilterPanel();
        buildDateStrip();
        setupControls();
        loadMatches();
    });
})();