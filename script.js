const tableBody = document.getElementById('songTableBody');
const searchInput = document.getElementById('searchInput');

let songs = []; // Дуунууд энд хадгалагдана

// JSON файлаас дуунуудыг татаж авах функц
async function fetchSongs() {
    try {
        const response = await fetch('song.json');
        songs = await response.json();
        displaySongs(songs); // Эхний удаа бүх дууг харуулна
    } catch (error) {
        console.error('Дууг уншихад алдаа гарлаа:', error);
    }
}

function displaySongs(songsToDisplay) {
    tableBody.innerHTML = '';
    songsToDisplay.forEach(song => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${song.code}</td>
            <td>${song.title}</td>
            <td>${song.artist}</td>
        `;
        tableBody.appendChild(row);
    });
}

searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredSongs = songs.filter(song => 
        song.title.toLowerCase().includes(searchTerm) || 
        song.artist.toLowerCase().includes(searchTerm) ||
        song.code.includes(searchTerm)
    );
    displaySongs(filteredSongs);
});

// Вэб ачаалагдахад дуунуудыг уншиж эхэлнэ
fetchSongs();
