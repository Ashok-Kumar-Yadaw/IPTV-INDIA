/*
 * IPTV INDIA - application logic
 * Playlist source: GitHub repository
 *
 * Note: this is the site's application JavaScript, while Video.js itself
 * is loaded from the official CDN in index.html.
 */

const PLAYLIST_URL =
  "https://raw.githubusercontent.com/Ashok-Kumar-Yadaw/IPTV-INDIA/main/in.m3u";

const state = {
  channels: [],
  category: "All",
  query: ""
};

const $ = (id) => document.getElementById(id);

const player = videojs("player", {
  controls: true,
  responsive: true,
  fluid: true,
  liveui: true,
  html5: {
    vhs: {
      overrideNative: true
    }
  }
});

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  }[ch]));
}

function parseAttrs(line) {
  const attrs = {};
  const re = /([A-Za-z0-9_-]+)="([^"]*)"/g;
  let m;
  while ((m = re.exec(line))) attrs[m[1]] = m[2];
  return attrs;
}

function parseM3U(text) {
  const lines = text.replace(/\r/g, "").split("\n");
  const out = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.startsWith("#EXTINF")) continue;

    const attrs = parseAttrs(line);
    const comma = line.indexOf(",");
    const title = comma >= 0 ? line.slice(comma + 1).trim() : (attrs["tvg-name"] || "Unknown");
    let url = "";

    for (let j = i + 1; j < lines.length; j++) {
      const next = lines[j].trim();
      if (!next || next.startsWith("#")) continue;
      url = next;
      i = j;
      break;
    }

    if (!url) continue;

    out.push({
      name: title || attrs["tvg-name"] || "Unknown Channel",
      group: attrs["group-title"] || "Other",
      logo: attrs["tvg-logo"] || "",
      id: attrs["tvg-id"] || "",
      url
    });
  }
  return out;
}

function guessCategory(group, name) {
  const s = `${group} ${name}`.toLowerCase();
  if (/news|न्यूज़|समाचार/.test(s)) return "News";
  if (/music|म्यूजिक|संगीत/.test(s)) return "Music";
  if (/movie|movies|film|cinema|मूवी|फिल्म/.test(s)) return "Movies";
  if (/sport|sports|खेल/.test(s)) return "Sports";
  if (/kids|cartoon|बच्च/.test(s)) return "Kids";
  if (/devotional|bhakti|spiritual|धार्मिक|भक्ति/.test(s)) return "Devotional";
  if (/entertainment|मनोरंजन/.test(s)) return "Entertainment";
  return group || "Other";
}

function categories() {
  const set = new Set(["All"]);
  state.channels.forEach(c => set.add(guessCategory(c.group, c.name)));
  return [...set];
}

function renderCategories() {
  $("categoryBar").innerHTML = categories().map(c =>
    `<button class="category ${c === state.category ? "active" : ""}" data-category="${escapeHtml(c)}">${escapeHtml(c)}</button>`
  ).join("");

  $("categoryBar").querySelectorAll(".category").forEach(btn => {
    btn.addEventListener("click", () => {
      state.category = btn.dataset.category;
      renderCategories();
      renderChannels();
    });
  });
}

function filteredChannels() {
  const q = state.query.trim().toLowerCase();
  return state.channels.filter(c => {
    const cat = guessCategory(c.group, c.name);
    const categoryOK = state.category === "All" || cat === state.category;
    const searchOK = !q || `${c.name} ${c.group}`.toLowerCase().includes(q);
    return categoryOK && searchOK;
  });
}

function renderChannels() {
  const list = filteredChannels();
  $("countLabel").textContent = `${list.length} / ${state.channels.length} channels`;

  if (!list.length) {
    $("channelGrid").innerHTML = `<div class="empty">कोई चैनल नहीं मिला।</div>`;
    return;
  }

  $("channelGrid").innerHTML = list.map((c, index) => `
    <article class="card" data-index="${state.channels.indexOf(c)}">
      <div class="card-head">
        <div class="logo-box">
          ${c.logo ? `<img src="${escapeHtml(c.logo)}" alt="" loading="lazy" onerror="this.style.display='none'">` : "📺"}
        </div>
        <div class="card-title">${escapeHtml(c.name)}</div>
      </div>
      <div class="card-group">${escapeHtml(guessCategory(c.group, c.name))} · ${escapeHtml(c.group)}</div>
    </article>
  `).join("");

  $("channelGrid").querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", () => playChannel(state.channels[Number(card.dataset.index)]));
  });
}

function playChannel(channel) {
  if (!channel) return;
  $("nowPlaying").textContent = `▶ ${channel.name}`;

  player.src({
    src: channel.url,
    type: /\.m3u8($|\?)/i.test(channel.url)
      ? "application/x-mpegURL"
      : "video/mp4"
  });
  player.play().catch(() => {});
}

async function loadPlaylist() {
  $("statusLabel").textContent = "Loading…";
  try {
    const response = await fetch(`${PLAYLIST_URL}?t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();
    state.channels = parseM3U(text);

    if (!state.channels.length) throw new Error("No channels found in M3U");

    state.category = "All";
    renderCategories();
    renderChannels();
    $("statusLabel").textContent = "✓ Playlist loaded";
  } catch (err) {
    console.error(err);
    $("statusLabel").textContent = "⚠ Playlist load failed";
    $("channelGrid").innerHTML = `
      <div class="empty">
        Playlist लोड नहीं हो सकी।<br>
        GitHub/raw URL और CORS/network access जाँचें।
      </div>`;
  }
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("iptv-theme", theme);
  $("themeBtn").textContent = theme === "dark" ? "☀️" : "🌙";
}

const savedTheme = localStorage.getItem("iptv-theme");
setTheme(savedTheme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));

$("themeBtn").addEventListener("click", () => {
  setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
});
$("refreshBtn").addEventListener("click", loadPlaylist);
$("searchInput").addEventListener("input", e => {
  state.query = e.target.value;
  renderChannels();
});

loadPlaylist();
