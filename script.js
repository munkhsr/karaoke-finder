const songs = [...(window.karaokeSongs ?? []), ...(window.karaokeExtraSongs ?? []), ...(window.karaokeExtraSongs2 ?? []), ...(window.karaokeExtraSongs3 ?? [])];

// Use the newest catalogue entries for both navigation filters.
const recentCatalogueCodes = [...new Set(
  songs
    .filter(song => /^3\d{4}$/.test(song.code1))
    .sort((first, second) => Number(second.code1) - Number(first.code1))
    .map(song => song.code1)
)];

const newSongCodes = recentCatalogueCodes.slice(0, 100);

// Curated from the catalogue for songs that are especially popular in Mongolian karaoke.
// `code1` is included where present so songs with a shared second code stay unambiguous.
const hitSongs = [
  { code2: "73284" }, { code2: "70638" }, { code2: "70774" }, { code2: "71131" }, { code2: "71540" }, { code2: "70048" },
  { code2: "72427" }, { code2: "72426" }, { code2: "70565" }, { code2: "72765" }, { code2: "72852" },
  { code2: "70624" }, { code2: "71514" }, { code2: "70245" }, { code2: "71521" }, { code2: "72587" }, { code2: "70481" },
  { code2: "74306" }, { code2: "74336" }, { code2: "70047" }, { code2: "70489" }, { code2: "74284" },
  { code2: "70089" }, { code2: "72511" }, { code2: "72482" }, { code2: "70991" }, { code2: "73519" },
  { code2: "74343" }, { code2: "71623" }, { code2: "71903" }, { code2: "72847" }, { code2: "73516" },
  { code1: "37360", code2: "74401" }, { code1: "37714", code2: "74794" }, { code1: "37744", code2: "74824" },
  { code1: "37778", code2: "74855" }, { code1: "37809", code2: "74889" }, { code1: "37905", code2: "74985" },
  { code1: "37941", code2: "75021" }, { code1: "37969", code2: "75049" }, { code1: "37974", code2: "75052" },
  { code1: "38029", code2: "75109" }, { code1: "38030", code2: "75110" }, { code1: "38115", code2: "75195" },
  { code1: "38130", code2: "75210" }, { code1: "38132", code2: "75212" }, { code1: "37530", code2: "74610" },
  { code1: "37656", code2: "74736" }, { code1: "37683", code2: "74763" }, { code1: "37684", code2: "74764" }
];

const songGroups = {
  new: newSongCodes
};

let activeSongGroup = null;

function groupFromLocation() {
  if (history.state?.songGroup) return history.state.songGroup;
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

function matchesSearch(value, query) {
  const normalizedValue = normalizeForSearch(value);
  return normalizedValue.includes(query) || relaxedLatin(normalizedValue).includes(relaxedLatin(query));
}

function getVisibleSongs() {
  if (activeSongGroup === "hit") {
    return hitSongs
      .map(selection => songs.find(song =>
        song.code2 === selection.code2 && (!selection.code1 || song.code1 === selection.code1)
      ))
      .filter(Boolean);
  }

  if (activeSongGroup === "new") {
    // Keep the catalogue order and return one row per selected primary code.
    // A few catalogue imports contain duplicate records with the same code.
    return newSongCodes
      .map(code => songs.find(song => song.code1 === code))
      .filter(Boolean);
  }

  return activeSongGroup ? songs.filter(song => songGroups[activeSongGroup].includes(song.code1)) : songs;
}

function renderTable(data) {
  const tableBody = document.getElementById("tableBody");
  const songCount = document.getElementById("songCount");
  tableBody.replaceChildren();

  if (!data.length) {
    const row = document.createElement("tr");
    row.innerHTML = '<td colspan="4" class="empty-state">Илэрц олдсонгүй.</td>';
    tableBody.appendChild(row);
  } else {
    data.forEach(song => {
      const row = document.createElement("tr");
      [song.code1 || "—", song.code2 || "—", song.title, song.artist].forEach(value => {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.appendChild(cell);
      });
      tableBody.appendChild(row);
    });
  }
  songCount.textContent = `${data.length} дуу`;
}

function updateResults() {
  const query = normalizeForSearch(document.getElementById("searchInput").value.trim());
  renderTable(getVisibleSongs().filter(song =>
    [song.code1, song.code2, song.title, song.artist].some(value => matchesSearch(value, query))
  ));
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

function navigateToGroup(group) {
  const hash = group ? `#${group}-songs` : "";
  history.pushState({ songGroup: group }, "", `${location.pathname}${location.search}${hash}`);
  setGroup(group);
}

document.getElementById("searchInput").addEventListener("input", updateResults);
document.querySelectorAll("[data-song-filter]").forEach(link => link.addEventListener("click", event => {
  event.preventDefault();
  navigateToGroup(link.dataset.songFilter);
}));
document.querySelector(".nav-brand").addEventListener("click", event => {
  event.preventDefault();
  document.getElementById("searchInput").value = "";
  navigateToGroup(null);
});

window.addEventListener("popstate", () => {
  document.getElementById("searchInput").value = "";
  setGroup(groupFromLocation());
});

const bannerModal = document.getElementById("bannerModal");
function closeBanner() { bannerModal.hidden = true; }
bannerModal.hidden = false;
document.querySelectorAll("[data-close-banner]").forEach(button => button.addEventListener("click", closeBanner));
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !bannerModal.hidden) closeBanner();
});

history.replaceState({ songGroup: groupFromLocation() }, "", location.href);
setGroup(groupFromLocation());
