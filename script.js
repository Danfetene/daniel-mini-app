const TelegramWebApp = window.Telegram.WebApp;
TelegramWebApp.ready();
TelegramWebApp.expand();

const API_KEY = 'AIzaSyCB11eevxR7iulC-iWgv5lBjJ-hnMpxKyA'; // Replace or use proxy fetch
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const resultsDiv = document.getElementById('results');
const playerDiv = document.getElementById('player');
const ytPlayer = document.getElementById('ytPlayer');
const qualitySelect = document.getElementById('qualitySelect');
const audioOnly = document.getElementById('audioOnly');
const controls = document.getElementById('controls');

// Map quality to YouTube itag (approx): low=95 (360p), medium=18 (480p), high=22 (720p)
const qualityMap = { low: '', medium: '&itag=18', high: '&itag=22' }; // Empty for low/auto

searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (!query) return alert('Enter a search!');
    
    // Use proxy if set up: fetch('/api/search?q=' + query)
    fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(query)}&key=${API_KEY}`)
        .then(res => res.json())
        .then(data => {
            resultsDiv.innerHTML = '';
            data.items.forEach(item => {
                if (item.id.kind === 'youtube#video') {
                    const div = document.createElement('div');
                    div.className = 'result-item';
                    div.innerHTML = `
                        <img src="${item.snippet.thumbnails.default.url}" loading="lazy" alt="${item.snippet.title}">
                        <div class="result-info">
                            <div class="result-title">${item.snippet.title}</div>
                            <div>${item.snippet.channelTitle}</div>
                        </div>
                    `;
                    div.addEventListener('click', () => {
                        controls.style.display = 'block';
                        playerDiv.style.display = 'block';
                        resultsDiv.style.display = 'none';
                        loadVideo(item.id.videoId);
                    });
                    resultsDiv.appendChild(div);
                }
            });
        })
        .catch(err => console.error(err));
});

function loadVideo(videoId) {
    let src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
    const quality = qualityMap[qualitySelect.value];
    if (quality) src += quality;
    if (audioOnly.checked) {
        src += '&mute=0'; // Audio plays, but add CSS to hide video
        playerDiv.style.background = 'black'; // Simulate audio mode
        ytPlayer.style.display = 'none'; // Hide video to save data
    } else {
        ytPlayer.style.display = 'block';
    }
    ytPlayer.src = src; // Lazy load here
}

// Back button
TelegramWebApp.MainButton.text = 'Back to Search';
TelegramWebApp.MainButton.onClick(() => {
    playerDiv.style.display = 'none';
    resultsDiv.style.display = 'block';
    controls.style.display = 'none';
    ytPlayer.src = ''; // Stop loading to save data
});
TelegramWebApp.MainButton.show();

// Event listeners for real-time changes
qualitySelect.addEventListener('change', () => loadVideo(ytPlayer.src.match(/embed\/([^?]+)/)[1]));
audioOnly.addEventListener('change', () => loadVideo(ytPlayer.src.match(/embed\/([^?]+)/)[1]));