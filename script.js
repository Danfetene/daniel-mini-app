// Replace with your actual Google Cloud API Key
const API_KEY = 'AIzaSyCB11eevxR7iulC-iWgv5lBjJ-hnMpxKyA';

const tg = window.Telegram.WebApp;
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const resultsContainer = document.getElementById('video-results');
const welcomeUser = document.getElementById('welcome-user');

// Initialize Telegram App
tg.ready();
tg.expand();
tg.setHeaderColor('#000000');

// Greet the user using Telegram SDK data
if (tg.initDataUnsafe?.user) {
    welcomeUser.innerText = `Hello, ${tg.initDataUnsafe.user.first_name}! What shall we watch?`;
}

searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = searchInput.value;
    if (!query) return;

    // Show loading state
    resultsContainer.innerHTML = '<div class="placeholder">Searching...</div>';

    try {
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(query)}&type=video&key=${API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        displayResults(data.items);
    } catch (error) {
        resultsContainer.innerHTML = '<div class="placeholder" style="color:red">Error loading videos. Check API Key.</div>';
    }
});

function displayResults(videos) {
    if (!videos || videos.length === 0) {
        resultsContainer.innerHTML = '<div class="placeholder">No videos found.</div>';
        return;
    }

    resultsContainer.innerHTML = ''; // Clear previous results

    videos.forEach(video => {
        const card = document.createElement('div');
        card.className = 'video-card';
        card.innerHTML = `
            <img class="thumbnail" src="${video.snippet.thumbnails.medium.url}" alt="thumbnail">
            <div class="video-info">
                <h3 class="video-title">${video.snippet.title}</h3>
                <p class="channel-name">${video.snippet.channelTitle}</p>
            </div>
        `;
        
        // Use Telegram's openLink to play the video
        card.onclick = () => {
            const videoUrl = `https://www.youtube.com/watch?v=${video.id.videoId}`;
            tg.openLink(videoUrl);
        };
        
        resultsContainer.appendChild(card);
    });
}