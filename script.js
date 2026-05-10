// Дууны өгөгдлийн сан (Жагсаалтыг энд нэмнэ)
const songs = [
    { code: "1024", title: "Цагаан суварга", artist: "Жавхлан" },
    { code: "5501", title: "Чингис хаан", artist: "Чингис хаан хамтлаг" },
    { code: "8823", title: "Миний ээж", artist: "Харанга" },
    { code: "3045", title: "Зүүдэн зэрэглээ", artist: "Ариунаа" },
    { code: "4412", title: "Би чамд хайртай", artist: "Номин Талст" },
    { code: "7761", title: "Uptown Funk", artist: "Bruno Mars" }
];

const songList = document.getElementById('songList');
const searchInput = document.getElementById('searchInput');
const noResult = document.getElementById('noResult');

// Дуунуудыг дэлгэцэнд гаргах функц
function displaySongs(data) {
    songList.innerHTML = "";
    
    if (data.length === 0) {
        noResult.classList.remove('hidden');
    } else {
        noResult.classList.add('hidden');
        data.forEach(song => {
            const row = `<tr>
                <td><strong>${song.code}</strong></td>
                <td>${song.title}</td>
                <td>${song.artist}</td>
            </tr>`;
            songList.innerHTML += row;
        });
    }
}

// Хайлт хийх хэсэг
searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filteredSongs = songs.filter(song => 
        song.title.toLowerCase().includes(term) || 
        song.artist.toLowerCase().includes(term) ||
        song.code.includes(term)
    );
    displaySongs(filteredSongs);
});

// Эхлээд бүх дууг харуулах
displaySongs(songs);