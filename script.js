const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Theme sync
function updateTheme() {
  document.body.classList.toggle('tg-theme-dark', tg.colorScheme === 'dark');
}
updateTheme();
tg.onEvent('themeChanged', updateTheme);

// Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const clearBtn = document.getElementById('clearBtn');
const results = document.getElementById('results');
const loading = document.getElementById('loading');
const emptyState = document.getElementById('emptyState');
const playerSection = document.getElementById('playerSection');
const ytPlayer = document.getElementById('ytPlayer');
const backBtn = document.getElementById('backBtn');
const audioOnly = document.getElementById('audioOnly');
const qualitySelect = document.getElementById('qualitySelect');
const nowPlayingTitle = document.getElementById('nowPlayingTitle');

const API_KEY = 'AIzaSyCB11eevxR7iulC-iWgv5lBjJ-hnMpxKyA'; // ← replace!
const qualityMap = { low: '', medium: '&itag=18', high: '&itag=22' };

// Haptic feedback helper
function tapHaptic() {
  if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');
}

// Show/hide helpers
function show(el) { el.classList.remove('hidden'); }
function hide(el) { el.classList.add('hidden'); }

// Debounce search (avoid spamming API while typing – optional live search later)
let debounceTimer;
function debounceSearch() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(doSearch, 600);
}

// Main search function
async function doSearch() {
  const query = searchInput.value.trim();
  if (!query) {
    show(emptyState);
    hide(results);
    hide(loading);
    return;
  }

  hide(emptyState);
  show(loading);
  hide(results);
  tapHaptic();

  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=12&q=${encodeURIComponent(query)}&regionCode=ET&key=${API_KEY}`
    );

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();

    if (data.error) throw new Error(data.error.message);

    results.innerHTML = '';

    if (!data.items?.length) {
      results.innerHTML = '<p style="text-align:center;padding:40px;">No videos found. Try another search!</p>';
    } else {
      data.items.forEach(item => {
        if (item.id.kind !== 'youtube#video') return;

        const card = document.createElement('div');
        card.className = 'result-card';
        card.innerHTML = `
          <img src="${item.snippet.thumbnails.medium.url || item.snippet.thumbnails.default.url}" alt="${item.snippet.title}" loading="lazy">
          <div class="result-info">
            <div class="result-title">${item.snippet.title}</div>
            <div class="result-channel">${item.snippet.channelTitle}</div>
          </div>
        `;

        card.onclick = () => {
          tapHaptic();
          nowPlayingTitle.textContent = item.snippet.title;
          loadVideo(item.id.videoId, item.snippet.title);
        };

        results.appendChild(card);
      });
    }

    show(results);
  } catch (err) {
    console.error(err);
    results.innerHTML = `<p style="color:#ff4444;text-align:center;padding:40px;">Error: ${err.message}<br><small>Check API key or try later</small></p>`;
    show(results);
  } finally {
    hide(loading);
  }
}

// Load video with quality & audio-only
function loadVideo(videoId) {
  let src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;

  const q = qualityMap[qualitySelect.value] || '';
  src += q;

  if (audioOnly.checked) {
    ytPlayer.style.opacity = '0';
    // YouTube doesn't have perfect audio-only → we hide video
  } else {
    ytPlayer.style.opacity = '1';
  }

  ytPlayer.src = src;
  hide(results);
  hide(emptyState);
  show(playerSection);
}

// Events
searchBtn.onclick = doSearch;
searchInput.oninput = () => {
  clearBtn.style.display = searchInput.value ? 'block' : 'none';
  // debounceSearch(); // uncomment for live search
};

clearBtn.onclick = () => {
  searchInput.value = '';
  clearBtn.style.display = 'none';
  searchInput.focus();
  show(emptyState);
  hide(results);
};

backBtn.onclick = () => {
  tapHaptic();
  ytPlayer.src = '';
  hide(playerSection);
  show(results);
};

audioOnly.onchange = qualitySelect.onchange = () => {
  if (ytPlayer.src.includes('embed/')) {
    const videoId = ytPlayer.src.match(/embed\/([^?]+)/)?.[1];
    if (videoId) loadVideo(videoId);
  }
};

// Init
searchInput.focus();
tg.MainButton.text = "Back to Search";
tg.MainButton.onClick(() => backBtn.click());
tg.MainButton.show();