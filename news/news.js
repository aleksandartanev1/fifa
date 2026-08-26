const RSS_TO_JSON_URL = "https://api.rss2json.com/v1/api.json?rss_url=";
const BBC_FOOTBALL_FEED = "https://feeds.bbci.co.uk/sport/football/rss.xml";
const FALLBACK_IMG = "../awards.avif";

const fallbackArticles = [
    {
        title: "FIFA World Cup stories continue to shape the football conversation",
        description: "Supporters, players and national teams remain at the centre of the latest discussions across global football.",
        link: "https://www.fifa.com/news",
        pubDate: "2026-08-24T10:00:00Z",
        source: "FIFA",
        image: "../awards.avif"
    },
    {
        title: "Transfer activity keeps major football clubs in the spotlight",
        description: "Squad planning, player form and late market decisions continue to drive football headlines around the world.",
        link: "https://www.fifa.com/news",
        pubDate: "2026-08-23T12:30:00Z",
        source: "Football Update",
        image: "../awards.avif"
    },
    {
        title: "Managers prepare for the next key stretch of club and international football",
        description: "Selections, tactics and player availability remain major themes ahead of the next important football fixtures.",
        link: "https://www.fifa.com/news",
        pubDate: "2026-08-22T09:15:00Z",
        source: "International Football",
        image: "../awards.avif"
    },
    {
        title: "FIFA development and tournament planning stay high on the agenda",
        description: "Football growth, organisation updates and major event planning continue to shape the game beyond the pitch.",
        link: "https://www.fifa.com/news",
        pubDate: "2026-08-21T16:45:00Z",
        source: "FIFA",
        image: "../awards.avif"
    },
    {
        title: "Player performances and club changes dominate the latest football headlines",
        description: "Current football coverage continues to follow standout displays, transfer movement and big-club pressure points.",
        link: "https://www.fifa.com/news",
        pubDate: "2026-08-20T08:20:00Z",
        source: "Football Report",
        image: "../awards.avif"
    }
];

async function loadLatestNews() {
    const statusEl = document.getElementById("newsStatus");
    const gridEl = document.getElementById("newsFeatureGrid");

    statusEl.textContent = "Loading latest football headlines...";
    gridEl.style.display = "none";

    try {
        const articles = await fetchBbcFootballArticles();
        renderArticles(articles);
        statusEl.style.display = "none";
        gridEl.style.display = "grid";
    } catch (error) {
        console.error("Could not load BBC Sport football headlines.", error);
        renderArticles(fallbackArticles);
        statusEl.textContent = "Live football headlines are unavailable right now. Showing fallback FIFA-style articles instead.";
        statusEl.style.display = "block";
        gridEl.style.display = "grid";
    }
}

async function fetchBbcFootballArticles() {
    const response = await fetch(`${RSS_TO_JSON_URL}${encodeURIComponent(BBC_FOOTBALL_FEED)}`);

    if (!response.ok) {
        throw new Error(`BBC football feed request failed with status ${response.status}`);
    }

    const data = await response.json();
    const items = Array.isArray(data.items) ? data.items : [];

    const articles = items
        .map((item) => ({
            title: item.title || "Football headline",
            description: getCleanDescription(item.description || item.content || ""),
            link: item.link || "#",
            pubDate: item.pubDate || "",
            source: "BBC Sport",
            image: getArticleImage(item)
        }))
        .filter((article) => isValidFootballArticle(article));

    const uniqueArticles = deduplicateArticles(articles).slice(0, 5);

    if (uniqueArticles.length < 4) {
        throw new Error("Not enough football articles with unique images were returned.");
    }

    return uniqueArticles;
}

function getArticleImage(item) {
    const thumbnail = item.thumbnail || item.enclosure?.thumbnail || "";
    return normalizeImageUrl(thumbnail);
}

function normalizeImageUrl(url) {
    if (!url) {
        return "";
    }

    if (url.startsWith("//")) {
        return `https:${url}`;
    }

    if (url.startsWith("http://")) {
        return `https://${url.slice(7)}`;
    }

    return url;
}

function getCleanDescription(htmlText) {
    const temp = document.createElement("div");
    temp.innerHTML = htmlText || "";
    const plainText = temp.textContent.trim().replace(/\s+/g, " ");

    if (!plainText) {
        return "Read the latest football update from this source.";
    }

    return plainText.length > 150 ? `${plainText.slice(0, 147)}...` : plainText;
}

function isValidFootballArticle(article) {
    return Boolean(article.image) &&
        article.link.includes("bbc.co.uk/sport/football") &&
        !article.link.includes("iplayer");
}

function deduplicateArticles(articles) {
    const seenLinks = new Set();
    const seenImages = new Set();

    return articles.filter((article) => {
        if (seenLinks.has(article.link) || seenImages.has(article.image)) {
            return false;
        }

        seenLinks.add(article.link);
        seenImages.add(article.image);
        return true;
    });
}

function renderArticles(articles) {
    const [featuredArticle, ...restArticles] = articles;
    const featureLink = document.getElementById("newsFeature");
    const featureImg = document.getElementById("featureImg");
    const featureCategory = document.getElementById("featureCategory");
    const featureTitle = document.getElementById("featureTitle");
    const featureMeta = document.getElementById("featureMeta");
    const listEl = document.getElementById("newsList");

    featureLink.href = featuredArticle.link || "#";
    featureLink.target = "_blank";
    featureLink.rel = "noopener";
    featureImg.src = featuredArticle.image || FALLBACK_IMG;
    featureImg.alt = featuredArticle.title || "Football headline";
    featureImg.onerror = function () {
        this.onerror = null;
        this.src = FALLBACK_IMG;
    };
    featureCategory.textContent = featuredArticle.source || "Football";
    featureTitle.textContent = featuredArticle.title || "Latest football headline";
    featureMeta.textContent = `${formatDate(featuredArticle.pubDate)} • ${featuredArticle.description}`;

    listEl.innerHTML = "";

    restArticles.forEach((article) => {
        const item = document.createElement("a");
        item.className = "news-list-item";
        item.href = article.link || "#";
        item.target = "_blank";
        item.rel = "noopener";

        item.innerHTML = `
      <img src="${escapeHtml(article.image || FALLBACK_IMG)}" alt="${escapeHtml(article.title || "Football headline")}" onerror="this.onerror=null;this.src='${FALLBACK_IMG}'">
      <div>
        <span class="news-category">${escapeHtml(article.source || "Football")}</span>
        <h4>${escapeHtml(article.title || "Latest football headline")}</h4>
        <p class="news-item-meta">${escapeHtml(formatDate(article.pubDate))}</p>
        <p class="news-item-description">${escapeHtml(article.description || "Read the latest football update from this source.")}</p>
      </div>
    `;

        listEl.appendChild(item);
    });
}

function formatDate(dateString) {
    if (!dateString) {
        return "Latest update";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return "Latest update";
    }

    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text || "";
    return div.innerHTML;
}

document.addEventListener("DOMContentLoaded", loadLatestNews);
