const songs = [...(window.karaokeSongs ?? []), ...(window.karaokeExtraSongs ?? []), ...(window.karaokeExtraSongs2 ?? []), ...(window.karaokeExtraSongs3 ?? []), ...(window.karaokeExtraSongs4 ?? [])];

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
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let resultsAnimation;
let searchFrame;

function getVisibleSongs() {
  if (!activeSongGroup) return songs;
  // Shared codes can identify different songs: match the complete catalogue identity.
  return (songGroups[activeSongGroup] ?? [])
    .map(selection => songs.find(song =>
      song.code1 === selection.code1 && song.code2 === selection.code2 &&
      song.title === selection.title && song.artist === selection.artist
    ))
    .filter(Boolean);
}

function renderTable(data) {
  const tableBody = document.getElementById("tableBody");
  const songCount = document.getElementById("songCount");
  const fragment = document.createDocumentFragment();

  if (!data.length) {
    const row = document.createElement("tr");
    row.setAttribute("role", "row");
    row.className = "empty-row";
    row.innerHTML = '<td colspan="4" class="empty-state">Илэрц олдсонгүй.</td>';
    fragment.appendChild(row);
  } else {
    data.forEach(song => {
      const row = document.createElement("tr");
      row.setAttribute("role", "row");
      [songCodes(song, "code1").join(" / ") || "—", songCodes(song, "code2").join(" / ") || "—", song.title, song.artist].forEach((value, index) => {
        const cell = document.createElement("td");
        cell.setAttribute("role", "cell");
        cell.setAttribute("data-label", ["Код 1", "Код 2", "Дууны нэр", "Дуучин"][index]);
        cell.textContent = value;
        row.appendChild(cell);
      });
      fragment.appendChild(row);
    });
  }
  tableBody.replaceChildren(fragment);
  document.querySelector(".table-container").scrollTop = 0;
  songCount.textContent = `${data.length} дуу`;
}

function updateResults(animate = false) {
  const query = normalizeForSearch(document.getElementById("searchInput").value.trim());
  const relaxedQuery = relaxedLatin(query);
  renderTable(getVisibleSongs().filter(song =>
    searchIndex.get(song).some(value =>
      value.normalized.includes(query) || value.relaxed.includes(relaxedQuery)
    )
  ));
  resultsAnimation?.cancel();
  const panel = document.querySelector(".table-container");
  if (animate && !reducedMotion.matches && panel?.animate) {
    resultsAnimation = panel.animate(
      [{ opacity: 0.65 }, { opacity: 1 }],
      { duration: 180, easing: "ease-out" }
    );
  }
}

function setGroup(group) {
  activeSongGroup = group;
  document.querySelectorAll("[data-song-filter]").forEach(link => {
    const isActive = link.dataset.songFilter === group;
    link.classList.toggle("is-active", isActive);
    link.setAttribute("aria-current", isActive ? "page" : "false");
  });
  updateResults();
}

document.getElementById("searchInput").addEventListener("input", () => {
  cancelAnimationFrame(searchFrame);
  searchFrame = requestAnimationFrame(() => updateResults(true));
});
reducedMotion.addEventListener("change", () => {
  if (reducedMotion.matches) resultsAnimation?.cancel();
});
window.addEventListener("hashchange", () => {
  document.getElementById("searchInput").value = "";
  setGroup(groupFromLocation());
});

const bannerModal = document.getElementById("bannerModal");
function closeBanner() { bannerModal.hidden = true; }
// Set to true when the promotional popup should be shown again.
const bannerEnabled = false;
bannerModal.hidden = !bannerEnabled;
document.querySelectorAll("[data-close-banner]").forEach(button => button.addEventListener("click", closeBanner));
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !bannerModal.hidden) closeBanner();
});

setGroup(groupFromLocation());
