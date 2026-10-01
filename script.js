const songs = [...(window.karaokeSongs ?? []), ...(window.karaokeExtraSongs ?? []), ...(window.karaokeExtraSongs2 ?? []), ...(window.karaokeExtraSongs3 ?? [])];

const songGroups = {
  new: ["59415", "59416", "59417", "59418", "59419"],
  hit: ["59400", "59401", "59403", "59405", "59410"]
};

let activeSongGroup = null;

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

document.getElementById("searchInput").addEventListener("input", updateResults);
document.querySelectorAll("[data-song-filter]").forEach(link => link.addEventListener("click", event => {
  event.preventDefault();
  setGroup(link.dataset.songFilter);
}));
document.querySelector(".nav-brand").addEventListener("click", event => {
  event.preventDefault();
  document.getElementById("searchInput").value = "";
  setGroup(null);
});

const bannerModal = document.getElementById("bannerModal");
function closeBanner() { bannerModal.hidden = true; }
bannerModal.hidden = false;
document.querySelectorAll("[data-close-banner]").forEach(button => button.addEventListener("click", closeBanner));
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !bannerModal.hidden) closeBanner();
});

renderTable(songs);
