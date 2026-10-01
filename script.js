const songs = [
  { code: "59400", title: "Арганд ороогүй хайр", artist: "Г.Чинболор" },
  { code: "59401", title: "Би чамд хайртай", artist: "Д.Хишигбаяр & Р.Дэлгэрмаа" },
  { code: "59402", title: "Бодол шиг өдрүүд", artist: "Хишигдэлгэр & Хишигжаргал" },
  { code: "59403", title: "Дуулж л явъя даа", artist: "Г.Эрдэнэтунгалаг" },
  { code: "59404", title: "Дэлхий гэрэлтэх хайр", artist: "Г.Чинболор" },
  { code: "59405", title: "Зөөлөн хайр", artist: "A Cool" },
  { code: "59406", title: "Зүүдний дагина", artist: "Ж.Энхбаяр" },
  { code: "59407", title: "Итгэлийн гэрэлтэй амраг", artist: "Р.Дэлгэрмаа" },
  { code: "59408", title: "Мартаж чадахгүй хайр", artist: "Д.Балдан" },
  { code: "59409", title: "Морин хуур", artist: "Х.Лхагвасүрэн /Харанга/" },
  { code: "59410", title: "Сэтгэл", artist: "Ц.Чулуунбаатар /Харанга/" },
  { code: "59411", title: "Төрсөн өдрийн дуу", artist: "О.Анхаа & Б.Халиун" },
  { code: "59412", title: "Улаангом", artist: "С.Жавхлан" },
  { code: "59413", title: "Хааяа", artist: "L-Guards хамтлаг" },
  { code: "59414", title: "Хайрын зарлан", artist: "Г.Тэмүүжин" },
  { code: "59415", title: "Хань минь", artist: "С.Батсүх" },
  { code: "59416", title: "Хатан хаан", artist: "Б.Сарантуяа" },
  { code: "59417", title: "Хонгор нутаг", artist: "Д.Энхзул" },
  { code: "59418", title: "Чамд би", artist: "Никитон хамтлаг" },
  { code: "59419", title: "Ээж минь", artist: "Мотив хамтлаг" }
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
  э: "e", ю: "yu", я: "ya", ё: "yo"
};

function normalizeForSearch(value) {
  return value
    .toLocaleLowerCase("mn")
    .split("")
    .map(character => cyrillicToLatin[character] ?? character)
    .join("")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function getVisibleSongs() {
  return activeSongGroup
    ? songs.filter(song => songGroups[activeSongGroup].includes(song.code))
    : songs;
}

function renderTable(data) {
  const tableBody = document.getElementById("tableBody");
  const songCount = document.getElementById("songCount");
  tableBody.replaceChildren();

  if (!data.length) {
    const row = document.createElement("tr");
    row.innerHTML = '<td colspan="3" class="empty-state">Илэрц олдсонгүй.</td>';
    tableBody.appendChild(row);
  } else {
    data.forEach(song => {
      const row = document.createElement("tr");
      [song.code, song.title, song.artist].forEach(value => {
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
  const filtered = getVisibleSongs().filter(song =>
    [song.code, song.title, song.artist].some(value => normalizeForSearch(value).includes(query))
  );
  renderTable(filtered);
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
document.querySelectorAll("[data-song-filter]").forEach(link => {
  link.addEventListener("click", event => {
    event.preventDefault();
    setGroup(link.dataset.songFilter);
  });
});

document.querySelector(".nav-brand").addEventListener("click", event => {
  event.preventDefault();
  document.getElementById("searchInput").value = "";
  setGroup(null);
});

const bannerModal = document.getElementById("bannerModal");
function closeBanner() {
  bannerModal.hidden = true;
}

bannerModal.hidden = false;
document.querySelectorAll("[data-close-banner]").forEach(button => {
  button.addEventListener("click", closeBanner);
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !bannerModal.hidden) closeBanner();
});

renderTable(songs);
