const songs = [
  { code: "59400", title: "Арганд ороогүй хайр", artist: "Г.Чинболор" },
  { code: "59401", title: "Би чамд хайртай", artist: "Д.Хишигбаяр & Р.Дэлгэрмаа" },
  { code: "59402", title: "Бодол шиг өдрүүд", artist: "Хишигдэлгэр & Хишигжаргал" },
  { code: "59403", title: "Дуулж л явъя даа", artist: "Г.Эрдэнэтунгалаг" },
  { code: "59404", title: "Дэлхий гэрэлтэх хайр", artist: "Г.Чинболор" },
  { code: "59405", title: "Зөөлөн хайр", artist: "A Cool" },
  { code: "59406", title: "Зүүдний дагина", artist: "Ж.Энхбаяр" },
  { code: "59407", title: "Итгэлийн гэрэлтэй амраг", artist: "Р.Дэлгэрмаа" },
  { code: "59409", title: "Мартаж чадахгүй хайр", artist: "Х.Лхагвасүрэн /Харанга/" },
  { code: "59410", title: "Сэтгэл", artist: "Ц.Чулуунбат /Харанга/" },
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

// Тухайн ангилалд багтах кодыг эндээс өөрчилж болно.
const songGroups = {
  new: ["59415", "59416", "59417", "59418", "59419"],
  hit: ["59400", "59401", "59403", "59405", "59410"]
};

let activeSongGroup = null;

function getVisibleSongs() {
  if (!activeSongGroup) {
    return songs;
  }

  return songs.filter(song => songGroups[activeSongGroup].includes(song.code));
}

function renderTable(data) {
  const tableBody = document.getElementById("tableBody");
  const songCount = document.getElementById("songCount");
  
  tableBody.innerHTML = "";
  
  data.forEach(song => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${song.code}</td>
      <td>${song.title}</td>
      <td>${song.artist}</td>
    `;
    tableBody.appendChild(row);
  });

  songCount.textContent = `Total: ${data.length} songs`;
}

function filterTable() {
  const query = document.getElementById("searchInput").value.toLowerCase();

  const filtered = getVisibleSongs().filter(song =>
    song.code.toLowerCase().includes(query) ||
    song.title.toLowerCase().includes(query) ||
    song.artist.toLowerCase().includes(query)
  );

  renderTable(filtered);
}

// Анх ачаалахад бүх дууг харуулах
renderTable(songs);

document.querySelectorAll("[data-song-filter]").forEach(button => {
  button.addEventListener("click", event => {
    event.preventDefault();
    activeSongGroup = button.dataset.songFilter;
    document.getElementById("searchInput").value = "";
    renderTable(getVisibleSongs());
  });
});

document.querySelector(".nav-brand").addEventListener("click", event => {
  event.preventDefault();
  activeSongGroup = null;
  document.getElementById("searchInput").value = "";
  renderTable(songs);
});

const bannerModal = document.getElementById("bannerModal");
const closeBannerButtons = document.querySelectorAll("[data-close-banner]");

function closeBanner() {
  bannerModal.hidden = true;
}

// localStorage ашиглаагүй тул хуудас refresh хийх бүрт banner дахин гарна.
bannerModal.hidden = false;

closeBannerButtons.forEach(button => {
  button.addEventListener("click", closeBanner);
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !bannerModal.hidden) {
    closeBanner();
  }
});
