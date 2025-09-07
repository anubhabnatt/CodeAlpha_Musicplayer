// --- 1. DOM Elements ---
const playBtn = document.getElementById('play');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const audio = document.getElementById('audio');
const progress = document.getElementById('progress');
const progressContainer = document.getElementById('progress-container');
const title = document.getElementById('title');
const artist = document.getElementById('artist');
const cover = document.getElementById('cover'); // Added cover image element
const volumeSlider = document.getElementById('volume');
const playlistElement = document.getElementById('playlist');
const searchInput = document.getElementById('search');
const genreFilter = document.getElementById('genre-filter');
const themeToggle = document.getElementById('checkbox');
const uploadBtn = document.getElementById('upload-btn');
const fileUpload = document.getElementById('file-upload');
const musicContainer = document.querySelector('.music-container'); // Need this for play animation

// --- 2. State Management ---
let songs = [
    { title: 'Acoustic Breeze', artist: 'Bensound', genre: 'Acoustic', src: 'music/song1.mp3', cover: 'https://via.placeholder.com/150/fe8daa/ffffff?text=ACOUSTIC' },
    { title: 'Creative Minds', artist: 'Bensound', genre: 'Corporate', src: 'music/song2.mp3', cover: 'https://via.placeholder.com/150/a7a7ff/ffffff?text=CREATIVE' },
    { title: 'Jazzy Frenchy', artist: 'Bensound', genre: 'Jazz', src: 'music/song3.mp3', cover: 'https://via.placeholder.com/150/e94560/ffffff?text=JAZZY' }
];
let songIndex = 0;
let filteredSongs = [...songs];

// --- 3. Initial Load ---
loadSong(filteredSongs[songIndex]);
populateGenreFilter();
renderPlaylist(filteredSongs);


// --- 4. Core Functions ---

function loadSong(song) {
    if (!song) return;
    title.innerText = song.title;
    artist.innerText = song.artist;
    audio.src = song.src;
    cover.src = song.cover || 'https://via.placeholder.com/150/cccccc/ffffff?text=♫'; // Fallback cover
}

function playSong() {
    musicContainer.classList.add('play'); // Add class for animation
    playBtn.querySelector('i.fas').classList.remove('fa-play');
    playBtn.querySelector('i.fas').classList.add('fa-pause');
    audio.play();
    updatePlaylistActiveState();
}

function pauseSong() {
    musicContainer.classList.remove('play'); // Remove class for animation
    playBtn.querySelector('i.fas').classList.add('fa-play');
    playBtn.querySelector('i.fas').classList.remove('fa-pause');
    audio.pause();
}

function prevSong() {
    songIndex--;
    if (songIndex < 0) {
        songIndex = filteredSongs.length - 1;
    }
    loadSong(filteredSongs[songIndex]);
    playSong();
}

function nextSong() {
    songIndex++;
    if (songIndex > filteredSongs.length - 1) {
        songIndex = 0;
    }
    loadSong(filteredSongs[songIndex]);
    playSong();
}

function updateProgress(e) {
    const { duration, currentTime } = e.srcElement;
    if (duration) {
        const progressPercent = (currentTime / duration) * 100;
        progress.style.width = `${progressPercent}%`;
    }
}

function setProgress(e) {
    const width = this.clientWidth;
    const clickX = e.offsetX;
    const duration = audio.duration;
    if (duration) {
        audio.currentTime = (clickX / width) * duration;
    }
}

function setVolume(e) {
    audio.volume = e.target.value;
}

// --- 5. Playlist, Search, and Filter Functions ---

function renderPlaylist(songsToRender) {
    playlistElement.innerHTML = '';
    songsToRender.forEach((song, index) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${song.title}</span> <span class="playlist-artist">${song.artist}</span>`;
        li.setAttribute('data-index', index);
        playlistElement.appendChild(li);
    });
    updatePlaylistActiveState();
}

function updatePlaylistActiveState() {
    const playlistItems = document.querySelectorAll('#playlist li');
    playlistItems.forEach((item) => item.classList.remove('active'));
    if (playlistItems[songIndex]) {
        playlistItems[songIndex].classList.add('active');
    }
}

function playFromPlaylist(e) {
    if (e.target.closest('li')) { // Use closest to handle clicks on spans inside li
        const clickedItem = e.target.closest('li');
        const clickedIndex = parseInt(clickedItem.getAttribute('data-index'));
        songIndex = clickedIndex;
        loadSong(filteredSongs[songIndex]);
        playSong();
    }
}

function filterAndSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedGenre = genreFilter.value;

    filteredSongs = songs.filter(song => {
        const matchesSearch = song.title.toLowerCase().includes(searchTerm) || song.artist.toLowerCase().includes(searchTerm);
        const matchesGenre = selectedGenre === 'all' || song.genre === selectedGenre;
        return matchesSearch && matchesGenre;
    });

    // If current song is no longer in filtered list, reset index
    if (songIndex >= filteredSongs.length) {
        songIndex = 0; // Or keep current song if it's the only one left, depending on desired behavior
    }
    if (filteredSongs.length > 0) {
        loadSong(filteredSongs[songIndex]);
    } else {
        // Handle case where no songs match filter
        title.innerText = 'No Song';
        artist.innerText = '';
        audio.src = '';
        cover.src = 'https://via.placeholder.com/150/cccccc/ffffff?text=♫';
        pauseSong();
    }

    renderPlaylist(filteredSongs);
}

function populateGenreFilter() {
    const genres = ['all', ...new Set(songs.map(song => song.genre))];
    genreFilter.innerHTML = '';
    genres.forEach(genre => {
        const option = document.createElement('option');
        option.value = genre;
        option.innerText = genre.charAt(0).toUpperCase() + genre.slice(1);
        genreFilter.appendChild(option);
    });
}

// --- 6. Upload Function ---
function handleFileUpload(e) {
    const files = e.target.files;
    for (const file of files) {
        if (file.type.startsWith('audio/')) {
            const song = {
                title: file.name.replace(/\.[^/.]+$/, ""),
                artist: 'Uploaded',
                genre: 'Uploaded', // Default genre for uploaded
                src: URL.createObjectURL(file),
                cover: 'https://via.placeholder.com/150/cccccc/ffffff?text=UPLOAD' // Default cover for uploaded
            };
            songs.push(song);
        }
    }
    populateGenreFilter();
    filterAndSearch();
    if (filteredSongs.length > 0 && audio.paused) {
        songIndex = filteredSongs.length - 1; // Auto-select last uploaded song
        loadSong(filteredSongs[songIndex]);
        renderPlaylist(filteredSongs);
    }
}

// --- 7. Theme Switcher ---
function switchTheme(e) {
    if (e.target.checked) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
    }
}

const currentTheme = localStorage.getItem('theme');
if (currentTheme === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggle.checked = true;
}


// --- 8. Event Listeners ---
playBtn.addEventListener('click', () => {
    const isPlaying = audio.paused;
    isPlaying ? playSong() : pauseSong();
});

prevBtn.addEventListener('click', prevSong);
nextBtn.addEventListener('click', nextSong);
audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('ended', nextSong);
progressContainer.addEventListener('click', setProgress);
volumeSlider.addEventListener('input', setVolume);
playlistElement.addEventListener('click', playFromPlaylist);
searchInput.addEventListener('input', filterAndSearch);
genreFilter.addEventListener('change', filterAndSearch);
themeToggle.addEventListener('change', switchTheme);
uploadBtn.addEventListener('click', () => fileUpload.click());
fileUpload.addEventListener('change', handleFileUpload);