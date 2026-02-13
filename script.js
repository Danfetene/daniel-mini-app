const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();
tg.MainButton.hide(); // We use it only if needed later

// Greeting - simple and neutral
document.getElementById('greeting').textContent = 'Data for everyone';

// Theme sync (applies Telegram's colors if user has dark/light mode)
function updateTheme() {
  document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#000');
  document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#fff');
  document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', tg.themeParams.secondary_bg_color || '#111');
  document.documentElement.style.setProperty('--tg-theme-hint-color', tg.themeParams.hint_color || '#888');
}
updateTheme();
tg.onEvent('themeChanged', updateTheme);

// Config – very low data usage
const API_KEY = 'AIzaSyCB11eevxR7iulC-iWgv5lBjJ-hnMpxKyA';   // ← Replace with your real YouTube Data API v3 key
const LOW_QUALITY = 'small'; // 'small' = ~144–240p, most data-efficient

let currentPlayer = null;
let playerAPIReady = false;

// Lazy-load YouTube IFrame API only when user taps a video
function loadYTAPI() {
  if (playerAPIReady) return Promise.resolve();
  return new Promise(resolve => {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    tag.onload = () => {
      playerAPIReady = true;
      resolve();
    };
    const firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode.insertBefore(tag, firstScript);
  });
}

// Create "lite" embed: thumbnail + big play button (real player loads only on click)
function createLiteEmbed(videoId, title, thumbnailUrl) {
  const wrapper = document.createElement('div');
  wrapper.className = 'thumbnail-wrapper';

  const img = document.createElement('img');
  img.className = 'thumbnail';
  img.src = thumbnailUrl.replace('hqdefault', 'mqdefault'); // medium quality thumbnail (~lower data)
  img.alt = title;
  img.loading = 'lazy'; // browser lazy loading

  const playOverlay = document.createElement('div');
  playOverlay.className = 'play-icon';
  playOverlay.innerHTML = '▶';

  wrapper.appendChild(img);
  wrapper.appendChild(playOverlay);

  // On tap → load & play real video
  wrapper.addEventListener('click', async () => {
    tg.HapticFeedback.impactOccurred('medium');

    await loadYTAPI();

    // Clear the lite version
    wrapper.innerHTML = '';

    currentPlayer = new YT.Player(wrapper, {
      height: '100%',
      width: '100%',
      videoId: videoId,
      playerVars: {
        autoplay: 0,                // better for data – user starts manually
        controls: 1,
        rel: 0,                     // no related videos
        modestbranding: 1,          // minimal YouTube logo
        iv_load_policy: 3,          // no annotations
        playsinline: 1,             // no fullscreen takeover on iOS
        enablejsapi: 1,
        origin: window.location.origin
      },
      events: {
        onReady: (event) => {
          // Aggressively force lowest quality
          try {
            event.target.setPlaybackQualityRange(LOW_QUALITY, 'medium');
            event.target.setPlaybackQuality(LOW_QUALITY);
          } catch (e) {
            console.log("Quality force failed:", e);
          }
          event.target.playVideo(); // start after quality set
        },
        onError: (event) => {
          tg.showPopup({
            title: 'Playback issue',
            message: 'Cannot play video. Try again or check your connection.'
          });
        }
      }
    });

    // Show Telegram back button to return to list
    tg.BackButton.show();
    tg.BackButton.onClick(() => {
      if (currentPlayer) {
        currentPlayer.destroy();
        currentPlayer = null;
      }
      document.getElementById('player-container').innerHTML = '';
      document.getElementById('player-container').classList.add('hidden');
      document.getElementById('results').classList.remove('hidden');
      tg.BackButton.hide();
    });
  });

  return wrapper;
}

// Render video list from API results
function renderVideos(items) {
  const list = document.getElementById('results');
  list.innerHTML = '';

  items.forEach(item => {
    const videoId = item.id.videoId;
    const snippet = item.snippet;
    const thumbUrl = snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url;

    const li = document.createElement('li');

    const wrapper = createLiteEmbed(videoId, snippet.title, thumbUrl);

    const info = document.createElement('div');
    info.className = 'info';
    info.innerHTML = `
      <div class="title">${snippet.title}</div>
      <div class="channel">${snippet.channelTitle}</div>
    `;

    li.appendChild(wrapper);
    li.appendChild(info);
    list.appendChild(li);
  });
}

// Search function using YouTube Data API
async function searchYouTube(query = 'popular') {
  document.getElementById('loading').classList.remove('hidden');
  document.getElementById('results').innerHTML = '';

  try {
    const url = `https://youtube.googleapis.com/youtube/v3/search?` +
                `part=snippet&` +
                `maxResults=12&` +
                `type=video&` +
                `q=${encodeURIComponent(query)}&` +
                `key=${API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.items && data.items.length > 0) {
      renderVideos(data.items);
    } else {
      tg.showPopup({ message: "No results found or API limit reached." });
    }
  } catch (err) {
    tg.showPopup({ message: "Network error. Please check connection." });
    console.error(err);
  } finally {
    document.getElementById('loading').classList.add('hidden');
  }
}

// Event listeners
document.getElementById('search-btn').addEventListener('click', () => {
  const q = document.getElementById('query').value.trim();
  if (q) searchYouTube(q);
});

document.getElementById('query').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const q = e.target.value.trim();
    if (q) searchYouTube(q);
  }
});

// Load trending/popular videos when app opens (engaging + no user input needed)
searchYouTube();