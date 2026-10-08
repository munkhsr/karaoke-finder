const songs = [...(window.karaokeSongs ?? []), ...(window.karaokeExtraSongs ?? []), ...(window.karaokeExtraSongs2 ?? []), ...(window.karaokeExtraSongs3 ?? []), ...(window.karaokeExtraSongs4 ?? []), ...(window.karaokeExtraSongs5 ?? [])];

// Explicit, researched selections; see SONG-SELECTION-RESEARCH.md.
const songGroups = window.karaokeSelections ?? { new: [], hit: [] };

let activeSongGroup = null;

function groupFromLocation() {
  if (document.body.dataset.songGroup) return document.body.dataset.songGroup;
  if (location.hash === "#new-songs") return "new";
  if (location.hash === "#hit-songs") return "hit";
  return null;
}

const cyrillicToLatin = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "j",
  з: "z", и: "i", й: "i", к: "k", л: "l", м: "m", н: "n", о: "o",
  ө: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ү: "u", ф: "f",
  х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sh", ъ: "", ы: "i", ь: "",
  э: "e", ю: "yu", я: "ya"
};

function normalizeForSearch(value) {
  return String(value)
    .toLocaleLowerCase("mn")
    .split("")
    .map(character => cyrillicToLatin[character] ?? character)
    .join("")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function relaxedLatin(value) {
  return value.replace(/y/g, "i").replace(/([aeiou])\1+/g, "$1").replace(/[^a-z0-9]/g, "");
}

function songCodes(song, field) {
  return [...new Set([song[field], ...(song.alternateCodes?.[field] ?? [])].filter(Boolean))];
}

// Prepare the catalogue once so typing does not repeatedly transliterate every song.
const searchIndex = new Map(songs.map(song => [song,
  [...songCodes(song, "code1"), ...songCodes(song, "code2"), song.title, song.artist].map(value => {
    const normalized = normalizeForSearch(value);
    return { normalized, relaxed: relaxedLatin(normalized) };
  })
]));
let searchFrame;
let activeSearchField = "all";
let visibleLimit = 40;
let filteredSongs = [];
const codeLabels = { code1: "Код 1", code2: "Код 2" };
const searchInput = document.getElementById("searchInput");
const songDetail = document.getElementById("songDetail");

function getVisibleSongs() {
  if (!activeSongGroup) return songs;
  return (songGroups[activeSongGroup] ?? []).map(selection => songs.find(song =>
    song.code1 === selection.code1 && song.code2 === selection.code2 &&
    song.title === selection.title && song.artist === selection.artist
  )).filter(Boolean);
}

function element(tag, className, content) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (content !== undefined) node.textContent = content;
  return node;
}

const copyIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="8" y="7" width="11" height="14" rx="2"/><path d="M15 7V4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3"/></svg>';
const heartIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg>';
let favorites;
try { favorites = new Set(JSON.parse(localStorage.getItem('karaoke-favorites') || '[]')); }
catch { favorites = new Set(); }
function songKey(song) { return JSON.stringify([song.title, song.artist, song.code1, song.code2]); }
function favoriteButton(song) {
  const button = element('button', 'favorite-button');
  button.type = 'button';
  button.innerHTML = heartIcon;
  const update = () => {
    const saved = favorites.has(songKey(song));
    button.setAttribute('aria-pressed', String(saved));
    button.setAttribute('aria-label', saved ? 'Дуртай дуунаас хасах' : 'Дуртай дуунд хадгалах');
  };
  update();
  button.addEventListener('click', () => {
    const key = songKey(song);
    if (favorites.has(key)) favorites.delete(key); else favorites.add(key);
    try { localStorage.setItem('karaoke-favorites', JSON.stringify([...favorites])); } catch {}
    update();
  });
  return button;
}
// Images from the supplied visual reference are illustrative, not verified artist portraits.
function artistArtwork(song, detailed = false) {
  const name = normalizeForSearch(song.artist);
  const match = name.includes('ariunaa') ? 'ariunaa' : name.includes('hishigdalai') ? 'khishigdalai' : name.includes('lemons') ? 'lemons' : /(^|[^a-z])bold([^a-z]|$)/.test(name) ? 'bold' : null;
  const avatar = element('span', detailed ? 'detail-art' : 'artist-avatar', '♫');
  avatar.setAttribute('aria-hidden', 'true');
  if (match && (!detailed || match === 'ariunaa')) {
    avatar.textContent = '';
    avatar.className += ` artist-photo artist-${match}`;
    const img = element('img', 'reference-image');
    img.src = 'assets/design-reference.png';
    img.alt = '';
    img.loading = 'lazy';
    img.width = 1312; img.height = 1199;
    avatar.style.position = 'relative';
    avatar.append(img);
  }
  return avatar;
}
function detailBanner() {
  const banner = element('aside', 'ad-banner reference-banner detail-banner');
  banner.setAttribute('aria-label', 'Загварын жишээ реклам');
  const frame = element('span', 'reference-frame');
  const img = element('img', 'reference-image');
  img.src = 'assets/design-reference.png'; img.alt = 'Good friends, great beer — жишээ баннер';
  frame.append(img); banner.append(frame);
  return banner;
}
function makeCodes(song, detailed = false) {
  const grid = element("div", "code-grid");
  ["code1", "code2"].forEach((field, index) => {
    const box = element("div", `code-box${index ? " ky" : ""}`);
    box.append(element("span", "code-label", codeLabels[field]));
    const codes = songCodes(song, field);
    if (!codes.length) box.append(element("span", "missing-code", "Байхгүй"));
    codes.forEach(code => {
      const button = element("button", "copy-button");
      button.type = "button";
      button.setAttribute("aria-label", `${codeLabels[field]} ${code} хуулах`);
      button.append(element("span", "code-value", code));
      const mark = element("span", "copy-mark"); mark.innerHTML = copyIcon; if (detailed) mark.append(element("span", "", "Хуулах"));
      mark.setAttribute("aria-hidden", "true");
      button.append(mark);
      button.addEventListener("click", () => copyCode(String(code)));
      box.append(button);
    });
    grid.append(box);
  });
  return grid;
}

let toastTimer;
function notify(message) {
  const toast = document.getElementById("toast");
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.hidden = false;
  toastTimer = setTimeout(() => { toast.hidden = true; }, 2600);
}

async function copyCode(code) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(code);
    } else {
      const previouslyFocused = document.activeElement;
      const input = element("textarea");
      input.value = code;
      input.style.cssText = "position:fixed;left:-9999px;top:0";
      (songDetail.open ? songDetail : document.body).append(input);
      input.select();
      let copied;
      try { copied = document.execCommand("copy"); }
      finally { input.remove(); previouslyFocused?.focus(); }
      if (!copied) throw new Error("Clipboard unavailable");
    }
    notify(`${code} код хууллаа`);
  } catch {
    notify("Хуулж чадсангүй. Кодоо гараар оруулна уу.");
  }
}

function openDetail(song) {
  const content = document.getElementById("detailContent");
  const artwork = artistArtwork(song, true);
  const heading = element("h2", "", song.title);
  heading.id = "detailTitle";
  const headingGroup = element('div', 'detail-heading');
  headingGroup.append(heading, element('p', 'detail-artist', song.artist));
  const metadata = element('dl', 'detail-meta');
  const row = element('div');
  row.append(element('dt', '', 'Кодын төрөл'), element('dd', '', 'Код 1 / Код 2'));
  metadata.append(row);
  if (song.language) {
    const language = element('div');
    language.append(element('dt', '', 'Хэл'), element('dd', 'tag', song.language));
    metadata.append(language);
  }
  content.replaceChildren(artwork, headingGroup, makeCodes(song, true), metadata, detailBanner());
  songDetail.showModal();
}
document.querySelector(".detail-close").addEventListener("click", () => songDetail.close());
songDetail.addEventListener("click", event => { if (event.target === songDetail) {
  const bounds = songDetail.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) songDetail.close();
}});

function renderResults() {
  const results = document.getElementById("songResults");
  const fragment = document.createDocumentFragment();
  if (!filteredSongs.length) {
    const empty = element("div", "empty-state");
    empty.append(element("strong", "", "Илэрц олдсонгүй"), element("span", "", "Дууны нэр, дуучин эсвэл кодоо өөрөөр бичиж үзээрэй."));
    fragment.append(empty);
  }
  filteredSongs.slice(0, visibleLimit).forEach((song, index) => {
    const card = element("article", "song-card");
    const heading = element("div", "song-heading");
    const avatar = artistArtwork(song);
    avatar.setAttribute("aria-hidden", "true");
    const info = element("div", "song-info");
    const titleHeading = element("h3");
    titleHeading.style.margin = "0";
    const title = element("button", "song-title", song.title);
    title.type = "button";
    title.setAttribute("aria-label", `${song.title}, ${song.artist} — дэлгэрэнгүй харах`);
    title.addEventListener("click", () => openDetail(song));
    titleHeading.append(title);
    info.append(titleHeading, element("p", "song-artist", song.artist));
    heading.append(avatar, info);
    if (!searchInput.value.trim() && !activeSongGroup) card.append(element("span", "home-rank", index + 1));
    card.append(heading, makeCodes(song), favoriteButton(song));
    fragment.append(card);
  });
  results.replaceChildren(fragment);
  document.getElementById("songCount").textContent = `${filteredSongs.length.toLocaleString("mn")} дуу`;
  const more = document.getElementById("loadMore");
  more.hidden = filteredSongs.length <= visibleLimit;
  more.textContent = `Илүү олон дуу харах (${Math.min(40, Math.max(0, filteredSongs.length - visibleLimit))}) ↓`;
}

function updateResults() {
  const query = normalizeForSearch(searchInput.value.trim());
  document.body.classList.toggle("is-searching", Boolean(query) || Boolean(activeSongGroup));
  const relaxedQuery = relaxedLatin(query);
  let candidates = getVisibleSongs();
  // Show the existing curated hit selection on the home page until a search begins.
  if (!query && !activeSongGroup && activeSearchField === "all") {
    candidates = (songGroups.hit ?? []).map(selection => songs.find(song =>
      song.code1 === selection.code1 && song.code2 === selection.code2 &&
      song.title === selection.title && song.artist === selection.artist
    )).filter(Boolean);
    if (!candidates.length) candidates = songs;
  }
  filteredSongs = candidates.filter(song => {
    const allValues = searchIndex.get(song);
    const codesLength = songCodes(song, "code1").length + songCodes(song, "code2").length;
    const values = activeSearchField === "title" ? [allValues[codesLength]] :
      activeSearchField === "artist" ? [allValues[codesLength + 1]] :
      activeSearchField === "code" ? allValues.slice(0, codesLength) : allValues;
    return values.some(value => value.normalized.includes(query) || (relaxedQuery && value.relaxed.includes(relaxedQuery)));
  });
  visibleLimit = (!query && !activeSongGroup) ? 4 : 40;
  document.getElementById("clearSearch").hidden = !searchInput.value;
  document.getElementById("resultsTitle").textContent = query ? "Хайлтын үр дүн" : activeSongGroup === "new" ? "Шинэ дуунууд" : (!activeSongGroup && activeSearchField !== "all") ? "Дуунууд" : "♛ Эрэлттэй дуунууд";
  renderResults();
}

function setGroup(group) {
  activeSongGroup = group;
  document.querySelectorAll("[data-song-filter]").forEach(link => {
    const isActive = link.dataset.songFilter === group;
    link.classList.toggle("is-active", isActive);
    if (isActive) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  updateResults();
}

searchInput.addEventListener("input", () => {
  cancelAnimationFrame(searchFrame);
  searchFrame = requestAnimationFrame(updateResults);
});
document.getElementById("clearSearch").addEventListener("click", () => {
  cancelAnimationFrame(searchFrame);
  searchInput.value = "";
  updateResults();
  searchInput.focus();
});
document.querySelectorAll("[data-search-field]").forEach(button => button.addEventListener("click", () => {
  activeSearchField = button.dataset.searchField;
  document.querySelectorAll("[data-search-field]").forEach(tab => tab.setAttribute("aria-pressed", String(tab === button)));
  updateResults();
}));
document.getElementById("loadMore").addEventListener("click", () => {
  const firstNewIndex = Math.min(visibleLimit, filteredSongs.length);
  visibleLimit += 40;
  renderResults();
  document.querySelectorAll(".song-title")[firstNewIndex]?.focus({ preventScroll: true });
});
window.addEventListener("hashchange", () => {
  searchInput.value = "";
  setGroup(groupFromLocation());
});
setGroup(groupFromLocation());
const siteMenu = document.querySelector('.site-menu');
if (siteMenu) {
  document.addEventListener('click', event => {
    if (!siteMenu.contains(event.target)) siteMenu.open = false;
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && siteMenu.open) {
      siteMenu.open = false;
      siteMenu.querySelector('summary').focus();
    }
  });
}
