const songs = [
  { code1: "59400", code2: "", title: "Арганд ороогүй хайр", artist: "Г.Чинболор" },
  { code1: "59401", code2: "", title: "Би чамд хайртай", artist: "Д.Хишигбаяр & Р.Дэлгэрмаа" },
  { code1: "59402", code2: "", title: "Бодол шиг өдрүүд", artist: "Хишигдэлгэр & Хишигжаргал" },
  { code1: "59403", code2: "", title: "Дуулж л явъя даа", artist: "Г.Эрдэнэтунгалаг" },
  { code1: "59404", code2: "", title: "Дэлхий гэрэлтэх хайр", artist: "Г.Чинболор" },
  { code1: "59405", code2: "", title: "Зөөлөн хайр", artist: "A Cool" },
  { code1: "59406", code2: "", title: "Зүүдний дагина", artist: "Ж.Энхбаяр" },
  { code1: "59407", code2: "", title: "Итгэлийн гэрэлтэй амраг", artist: "Р.Дэлгэрмаа" },
  { code1: "59408", code2: "", title: "Мартаж чадахгүй хайр", artist: "Д.Балдан" },
  { code1: "59409", code2: "", title: "Морин хуур", artist: "Х.Лхагвасүрэн /Харанга/" },
  { code1: "59410", code2: "", title: "Сэтгэл", artist: "Ц.Чулуунбаатар /Харанга/" },
  { code1: "59411", code2: "", title: "Төрсөн өдрийн дуу", artist: "О.Анхаа & Б.Халиун" },
  { code1: "59412", code2: "", title: "Улаангом", artist: "С.Жавхлан" },
  { code1: "59413", code2: "", title: "Хааяа", artist: "L-Guards хамтлаг" },
  { code1: "59414", code2: "", title: "Хайрын зарлан", artist: "Г.Тэмүүжин" },
  { code1: "59415", code2: "", title: "Хань минь", artist: "С.Батсүх" },
  { code1: "59416", code2: "", title: "Хатан хаан", artist: "Б.Сарантуяа" },
  { code1: "59417", code2: "", title: "Хонгор нутаг", artist: "Д.Энхзул" },
  { code1: "59418", code2: "", title: "Чамд би", artist: "Никитон хамтлаг" },
  { code1: "59419", code2: "", title: "Ээж минь", artist: "Мотив хамтлаг" },
  { code1: "38117", code2: "75197", title: "BINGO", artist: "290 & TUUG18" }
];

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
