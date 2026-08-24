const API_URL =
  "https://api.sportradar.com/soccer-extended/trial/v4/en/fifa_rankings.json";


const flagMap = {

  Spain: "es",
  Argentina: "ar",
  France: "fr",
  England: "gb-eng",
  Brazil: "br",
  Morocco: "ma",
  Portugal: "pt",
  Belgium: "be",
  Netherlands: "nl",
  Mexico: "mx",
  USA: "us",
  Germany: "de",
  Japan: "jp",
  Sweden: "se",
  Canada: "ca",
  Norway: "no",
  Ireland: "ie",
  Ukraine: "ua",
  Italy: "it",
  Colombia: "co",
  Senegal: "sn",
  Australia: "au",
  "IR Iran": "ir"

};


/* =====================================================
   FIFA MEN
===================================================== */

const demoMen = [
  ["Spain", 1995.88, 0, "win", "1 - 0", "ARG"],
  ["Argentina", 1970.37, -1, "loss", "0 - 1", "ESP"],
  ["France", 1948.97, 0, "loss", "4 - 6", "ENG"],
  ["England", 1922.83, 0, "win", "6 - 4", "FRA"],
  ["Brazil", 1804.92, 1, "loss", "1 - 2", "NOR"],
  ["Morocco", 1803.99, 1, "loss", "0 - 2", "FRA"],
  ["Portugal", 1787.85, -2, "loss", "0 - 1", "ESP"],
  ["Belgium", 1778.36, 1, "loss", "1 - 2", "ESP"],
  ["Netherlands", 1775.54, -1, "loss", "(2) 1 - 1 (3)", "MAR"],
  ["Mexico", 1754.30, 4, "loss", "2 - 3", "ENG"]
];


/* =====================================================
   FIFA WOMEN
===================================================== */

const demoWomen = [
  ["Spain", 2105.36, 0, "win", "6 - 1", "ISL"],
  ["USA", 2057.92, 0, "win", "1 - 0", "BRA"],
  ["Germany", 2028.99, 1, "win", "2 - 0", "SVN"],
  ["England", 2027.13, -1, "win", "3 - 0", "UKR"],
  ["Japan", 1998.83, 0, "loss", "0 - 1", "RSA"],
  ["France", 1983.84, 1, "win", "1 - 0", "IRL"],
  ["Brazil", 1976.73, -1, "loss", "0 - 1", "USA"],
  ["Sweden", 1937.94, 0, "draw", "2 - 2", "ITA"],
  ["Canada", 1936.90, 0, "win", "6 - 0", "CRC"],
  ["Netherlands", 1911.75, 0, "win", "3 - 1", "POL"]
];


/* =====================================================
   FUTSAL MEN
===================================================== */

const futsalMen = [
  {
    rank: 1,
    name: "Brazil",
    points: 1684.97,
    movement: "+10.93",
    code: "br"
  },

  {
    rank: 2,
    name: "Portugal",
    points: 1575.32,
    movement: "+39.15",
    code: "pt"
  },

  {
    rank: 3,
    name: "Spain",
    points: 1574.39,
    movement: "+44.72",
    code: "es"
  },

  {
    rank: 4,
    name: "Argentina",
    points: 1513.38,
    movement: "-2.37",
    code: "ar"
  },

  {
    rank: 5,
    name: "IR Iran",
    points: 1507.71,
    movement: "+23.48",
    code: "ir"
  }
];


/* =====================================================
   FUTSAL WOMEN
===================================================== */

const futsalWomen = [
  {
    rank: 1,
    name: "Brazil",
    points: 1514.38,
    movement: "-",
    code: "br"
  },

  {
    rank: 2,
    name: "Spain",
    points: 1413.46,
    movement: "-0.31",
    code: "es"
  },

  {
    rank: 3,
    name: "Portugal",
    points: 1378.90,
    movement: "+6.21",
    code: "pt"
  },

  {
    rank: 4,
    name: "Argentina",
    points: 1268.75,
    movement: "-",
    code: "ar"
  },

  {
    rank: 5,
    name: "Italy",
    points: 1233.04,
    movement: "+6.64",
    code: "it"
  }
];


/* =====================================================
   FLAG URL
===================================================== */

function flagUrl(country, code) {

  const iso =
    (code || flagMap[country] || "")
      .toLowerCase();

  const aliases = {

    esp: "es",
    arg: "ar",
    fra: "fr",
    eng: "gb-eng",
    bra: "br",
    mar: "ma",
    por: "pt",
    bel: "be",
    ned: "nl",
    mex: "mx",
    usa: "us",
    ger: "de",
    deu: "de",
    jpn: "jp",
    swe: "se",
    can: "ca",
    nor: "no",
    irl: "ie",
    ukr: "ua",
    ita: "it",
    col: "co",
    sen: "sn",
    aus: "au",
    isl: "is",
    svn: "si",
    rsa: "za",
    pol: "pl",
    crc: "cr",
    iran: "ir"

  };

  return `https://media.api-sports.io/flags/${aliases[iso] || iso}.svg`;
}


/* =====================================================
   MOVEMENT
===================================================== */

function movementHTML(movement) {

  const m = Number(movement || 0);

  if (m > 0) {

    return `
      <span class="movement up">
        ↑ ${m}
      </span>
    `;

  }

  if (m < 0) {

    return `
      <span class="movement down">
        ↓ ${Math.abs(m)}
      </span>
    `;

  }

  return `
    <span class="movement same"></span>
  `;

}


/* =====================================================
   RESULT
===================================================== */

function resultHTML(item) {

  if (!item || !item.result) {

    return `
      <span class="result">

        <span class="result-icon draw">
          −
        </span>

        <span class="score-box">
          —
        </span>

      </span>
    `;

  }


  const type =
    item.resultType || "draw";


  const icon =
    type === "win"
      ? "✓"
      : type === "loss"
        ? "×"
        : "−";


  return `
    <span class="result">

      <span class="result-icon ${type}">
        ${icon}
      </span>

      <span class="score-box">
        ${item.result}
      </span>

      <span>
        v ${item.opponent || ""}
      </span>

    </span>
  `;

}


/* =====================================================
   NORMALIZE API
===================================================== */

function normalizeApiEntry(entry, index) {

  const competitor =
    entry.competitor || {};


  return {

    rank:
      Number(
        entry.rank ??
        index + 1
      ),

    name:
      competitor.name ||
      competitor.country ||
      "Unknown",

    code:
      competitor.country_code ||
      competitor.abbreviation ||
      "",

    points:
      Number(
        entry.points ??
        0
      ),

    movement:
      Number(
        entry.movement ??
        0
      ),

    result: null

  };

}


/* =====================================================
   MAIN FIFA TABLE
===================================================== */

function renderTable(
  targetId,
  rows,
  limit = 10
) {

  const target =
    document.getElementById(
      targetId
    );


  if (!target) return;


  target.innerHTML =
    rows
      .slice(0, limit)
      .map((item, index) => {

        const rank =
          item.rank ||
          index + 1;


        const code =
          item.code ||
          flagMap[item.name] ||
          "";


        return `

          <div class="ranking-row">

            <div class="rank-cell">

              <span class="rank-number">
                ${rank}
              </span>

              ${movementHTML(
                item.movement
              )}

            </div>


            <div class="team-cell">

              <img
                class="flag"
                src="${flagUrl(
                  item.name,
                  code
                )}"

                alt="${item.name} flag"

                onerror="
                  this.style.visibility='hidden'
                "
              >

              <span class="team-name">
                ${item.name}
              </span>

            </div>


            <div>
              ${resultHTML(item)}
            </div>


            <div class="points">
              ${Number(
                item.points
              ).toFixed(2)}
            </div>

          </div>

        `;

      })
      .join("");

}


/* =====================================================
   DEMO ROWS
===================================================== */

function demoRows(data) {

  return data.map(
    (x, i) => ({

      rank: i + 1,

      name: x[0],

      points: x[1],

      movement: x[2],

      resultType: x[3],

      result: x[4],

      opponent: x[5]

    })
  );

}


/* =====================================================
   FUTSAL TABLE
===================================================== */

function renderFutsalTable(
  targetId,
  rows
) {

  const target =
    document.getElementById(
      targetId
    );


  if (!target) return;


  target.innerHTML = "";


  rows.forEach(item => {

    const row =
      document.createElement(
        "div"
      );


    row.className =
      "ranking-row";


    row.innerHTML = `

      <div class="rank-cell">

        <span class="rank-number">
          ${item.rank}
        </span>

      </div>


      <div class="team-cell">

        <img
          class="flag"

          src="${flagUrl(
            item.name,
            item.code
          )}"

          alt="${item.name} flag"

          onerror="
            this.style.visibility='hidden'
          "
        >

        <span class="team-name">
          ${item.name}
        </span>

      </div>


      <div class="points">

        ${Number(
          item.points
        ).toFixed(2)}

      </div>


      <div class="result">

        ${item.movement}

      </div>

    `;


    target.appendChild(row);

  });

}


/* =====================================================
   LOAD RANKINGS
===================================================== */

async function loadRankings() {

  const key =
    localStorage.getItem(
      "sportradarKey"
    );


  /*
    No API key:
    show demo FIFA data.
  */

  if (!key) {

    renderTable(
      "menTable",
      demoRows(demoMen)
    );


    renderTable(
      "womenTable",
      demoRows(demoWomen)
    );


    /*
      Futsal is separate.
    */

    renderFutsalTable(
      "futsalMenTable",
      futsalMen
    );


    renderFutsalTable(
      "futsalWomenTable",
      futsalWomen
    );


    setDates(
      "20 July 2026",
      "16 June 2026"
    );


    return;

  }


  try {

    const response =
      await fetch(
        API_URL,
        {
          headers: {
            "x-api-key": key
          }
        }
      );


    if (!response.ok) {

      throw new Error(
        `API error: ${response.status}`
      );

    }


    const data =
      await response.json();


    const rankings =
      data.rankings || [];


    const men =
      rankings.find(
        r =>
          r.gender === "men"
      );


    const women =
      rankings.find(
        r =>
          r.gender === "women"
      );


    if (!men) {

      throw new Error(
        "Men's FIFA ranking was not returned."
      );

    }


    /* ================= MEN ================= */

    renderTable(
      "menTable",

      (
        men.competitor_rankings ||
        []
      ).map(
        normalizeApiEntry
      )
    );


    /* ================= WOMEN ================= */

    if (women) {

      renderTable(
        "womenTable",

        (
          women.competitor_rankings ||
          []
        ).map(
          normalizeApiEntry
        )
      );

    }
    else {

      renderTable(
        "womenTable",
        []
      );

    }


    /*
      Futsal stays separate
      from the Sportradar FIFA API.
    */

    renderFutsalTable(
      "futsalMenTable",
      futsalMen
    );


    renderFutsalTable(
      "futsalWomenTable",
      futsalWomen
    );


    /* ================= DATE ================= */

    const generated =
      data.generated_at

        ? new Date(
            data.generated_at
          ).toLocaleDateString(
            "en-GB",
            {
              day: "2-digit",
              month: "long",
              year: "numeric"
            }
          )

        : "—";


    setDates(
      generated,
      generated
    );

  }


  catch (error) {

    console.error(error);


    alert(
      "API could not be loaded. Check your Sportradar API key. " +
      "The page will show the screenshot demo data instead."
    );


    renderTable(
      "menTable",
      demoRows(demoMen)
    );


    renderTable(
      "womenTable",
      demoRows(demoWomen)
    );


    renderFutsalTable(
      "futsalMenTable",
      futsalMen
    );


    renderFutsalTable(
      "futsalWomenTable",
      futsalWomen
    );


    setDates(
      "20 July 2026",
      "16 June 2026"
    );

  }

}


/* =====================================================
   SET DATES
===================================================== */

function setDates(
  men,
  women
) {

  document.getElementById(
    "menDate"
  ).textContent = men;


  document.getElementById(
    "womenDate"
  ).textContent = women;

}


/* =====================================================
   SETTINGS
===================================================== */

function openSettings() {

  document
    .getElementById("settings")
    .classList
    .add("show");


  document
    .getElementById("sportradarKey")
    .value =
      localStorage.getItem(
        "sportradarKey"
      ) || "";

}


function closeSettings() {

  document
    .getElementById("settings")
    .classList
    .remove("show");

}


function saveKey() {

  const key =
    document
      .getElementById(
        "sportradarKey"
      )
      .value
      .trim();


  if (!key) {

    localStorage.removeItem(
      "sportradarKey"
    );

  }
  else {

    localStorage.setItem(
      "sportradarKey",
      key
    );

  }


  closeSettings();

  loadRankings();

}


/* =====================================================
   LOAD DEMO
===================================================== */

function loadDemo() {

  localStorage.removeItem(
    "sportradarKey"
  );


  closeSettings();


  renderTable(
    "menTable",
    demoRows(demoMen)
  );


  renderTable(
    "womenTable",
    demoRows(demoWomen)
  );


  renderFutsalTable(
    "futsalMenTable",
    futsalMen
  );


  renderFutsalTable(
    "futsalWomenTable",
    futsalWomen
  );


  setDates(
    "20 July 2026",
    "16 June 2026"
  );

}


/* =====================================================
   FULL RANKING
===================================================== */

function showFull(gender) {

  const key =
    localStorage.getItem(
      "sportradarKey"
    );


  if (!key) {

    alert(
      "Add your Sportradar API key first to load the complete ranking."
    );


    openSettings();


    return;

  }


  alert(
    `The ${gender} ranking is loaded from the API. ` +
    `The button can be connected to a separate full-ranking page next.`
  );

}


/* =====================================================
   START
===================================================== */

loadRankings();


/* =====================================================
   FIFA NEWS CAROUSEL
   ===================================================== */

const newsSlider = document.getElementById("newsSlider");
const newsNext = document.getElementById("newsNext");
const newsPrev = document.getElementById("newsPrev");

let newsPosition = 0;

function getNewsStep() {
  const card = document.querySelector(".news-card");

  if (!card) {
    return 0;
  }

  const gap = 30;

  return card.offsetWidth + gap;
}


newsNext.addEventListener("click", function () {

  const step = getNewsStep();

  const maxPosition =
    newsSlider.scrollWidth -
    newsSlider.parentElement.offsetWidth;

  newsPosition += step;

  if (newsPosition > maxPosition) {
    newsPosition = maxPosition;
  }

  newsSlider.style.transform =
    `translateX(-${newsPosition}px)`;

});


newsPrev.addEventListener("click", function () {

  const step = getNewsStep();

  newsPosition -= step;

  if (newsPosition < 0) {
    newsPosition = 0;
  }

  newsSlider.style.transform =
    `translateX(-${newsPosition}px)`;

});