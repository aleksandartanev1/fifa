// ============================================================
// NEWS API CONFIG
// ============================================================
// 1. Get a free key at https://newsapi.org/register
// 2. Paste it below.
// 3. NewsAPI's free "Developer" plan only allows requests whose
//    origin is "localhost" — it will NOT work opened directly
//    via file:// or on a live domain. Serve this folder with a
//    local server while testing, e.g.:
//      python -m http.server 8000
//    then visit http://localhost:8000/news/index.html
// ============================================================
const NEWS_API_KEY = "e9de2b8eb1934bbca5b281a51a55ce21";

const FALLBACK_IMG =
    "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='100%25' height='100%25' fill='%23dfe5ed'/%3E%3C/svg%3E";

async function loadLatestNews() {
    const statusEl = document.getElementById("newsStatus");
    const gridEl = document.getElementById("newsFeatureGrid");

    if (!NEWS_API_KEY || NEWS_API_KEY === "YOUR_API_KEY_HERE") {
        statusEl.textContent =
            "Add your NewsAPI.org key in news/news.js to load live headlines.";
        return;
    }

    const endpoint =
        "https://newsapi.org/v2/everything?q=" +
        encodeURIComponent(
            '(soccer OR football) AND (FIFA OR "premier league" OR "champions league" OR "world cup" OR uefa OR "la liga") NOT (NFL OR "american football")'
        ) +
        "&language=en&sortBy=publishedAt&pageSize=5&apiKey=" +
        NEWS_API_KEY;

    try {
        const res = await fetch(endpoint);

        if (!res.ok) {
            throw new Error("NewsAPI request failed: " + res.status);
        }

        const data = await res.json();
        const articles = (data.articles || []).filter((a) => a.title && a.title !== "[Removed]");

        if (!articles.length) {
            statusEl.textContent = "No headlines found right now.";
            return;
        }

        renderNews(articles);
        statusEl.style.display = "none";
        gridEl.style.display = "grid";
    } catch (err) {
        console.error(err);
        statusEl.textContent =
            "Couldn't load live news (likely a CORS block — NewsAPI's free plan " +
            "only allows requests from localhost). Check the console for details.";
    }
}

function renderNews(articles) {
    const [featured, ...rest] = articles;

    const featureLink = document.getElementById("newsFeature");
    const featureImg = document.getElementById("featureImg");
    const featureCategory = document.getElementById("featureCategory");
    const featureTitle = document.getElementById("featureTitle");

    featureLink.href = featured.url || "#";
    featureLink.target = "_blank";
    featureLink.rel = "noopener";
    featureImg.src = featured.urlToImage || FALLBACK_IMG;
    featureImg.alt = featured.title;
    featureCategory.textContent = featured.source && featured.source.name ? featured.source.name : "News";
    featureTitle.textContent = featured.title;

    const listEl = document.getElementById("newsList");
    listEl.innerHTML = "";

    rest.slice(0, 4).forEach((article) => {
        const item = document.createElement("a");
        item.className = "news-list-item";
        item.href = article.url || "#";
        item.target = "_blank";
        item.rel = "noopener";

        item.innerHTML = `
      <img src="${article.urlToImage || FALLBACK_IMG}" alt="${escapeHtml(article.title)}">
      <div>
        <span class="news-category">${escapeHtml(
            article.source && article.source.name ? article.source.name : "News"
        )}</span>
        <h4>${escapeHtml(article.title)}</h4>
      </div>
    `;

        listEl.appendChild(item);
    });
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
}

document.addEventListener("DOMContentLoaded", loadLatestNews);