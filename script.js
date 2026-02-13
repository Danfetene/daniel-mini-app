const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();
tg.MainButton.hide(); // We use it only if needed later

const greeting = document.getElementById('greeting');
const user = tg.initDataUnsafe?.user;
if (user?.first_name) greeting.textContent = `Hi ${user.first_name} • Lite mode`;

// Theme sync (smooth)
function updateTheme() {
  document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#000');
  document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#fff');
  // more vars if needed
}
updateTheme();
tg.onEvent('themeChanged', updateTheme);

// Config – very low data
const API_KEY = 'AIzaSyCB11eevxR7iulC-iWgv5lBjJ-hnMpxKyA'; // ← INSERT HERE
const LOW_QUALITY = 'small'; // 144p–240p range

let currentPlayer = null;
let playerAPIReady = false;

// Lazy-load YouTube API only once
function loadYTAPI() {
  if (playerAPIReady) return Promise.resolve();
  return new Promise(r => {
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    s.onload = () => { playerAPIReady = true; r(); };
    document.head.appendChild(s);
  });
}

// Create lite embed (thumbnail + play overlay)
function createLiteEmbed(videoId, title, thumbnailUrl) {
  const wrapper = document.createElement('div');
  wrapper.className = 'thumbnail-wrapper';

  const img = document.createElement('img');
  img.className = 'thumbnail';
  img.src = thumbnailUrl.replace('hqdefault', 'mqdefault'); // medium = ~320px → low data
  img.alt = title;
  img.loading = 'lazy';

  const play = document.createElement('div');
  play.className = 'play-icon';
  play.innerHTML = '▶';

  wrapper.append(img, play);

  wrapper.onclick = async () => {
    tg.HapticFeedback.impactOccurred('medium');
    await loadYTAPI();

    // Replace lite with real player
    wrapper.innerHTML = '';
    currentPlayer = new YT.Player(wrapper, {
      height: '100%',
      width: '100%',
      videoId,
      playerVars: {
        autoplay: 0,
        controls: 1,
        rel: 0,
        modestbranding: 1,
        iv_load_policy: 3,
        playsinline: 1,
        enablejsapi: 1,
        origin: window.location.origin
      },
      events: {
        onReady: e => {
          // Force lowest quality
          try {
            e.target.setPlaybackQualityRange(LOW_QUALITY, 'medium');
            e.target.setPlaybackQuality(LOW_QUALITY);
          } catch {}
          e.target.playVideo();
        },
        onError: () => tg.showPopup({ title: "Error", message: "Can't play – check connection or try later" })
      }
    });

    // Back navigation
    tg.BackButton.show();
    tg.BackButton.onClick(() => {
      if (currentPlayer) { currentPlayer.destroy(); currentPlayer = null; }
      document.getElementById('player-container').innerHTML = '';
      document.getElementById('player-container').classList.add('hidden');
      document.getElementById('results').classList.remove('hidden');
      tg.BackButton.hide();
    });
  };

  return wrapper;
}

// Render results
function render(videos) {
  const list = document.getElementById('results');
  list.innerHTML = '';

  videos.forEach(v => {
    const li = document.createElement('li');
    const thumbUrl = v.snippet.thumbnails?.medium?.url || v.snippet.thumbnails?.default?.url;

    li.innerHTML = `
      <div class="info">
        <div class="title">${v.snippet.title}</div>
        <div class="channel">${v.snippet.channelTitle}</div>
      </div>
    `;
    li.prepend(createLiteEmbed(v.id.videoId, v.snippet.title, thumbUrl));
    list.appendChild(li);
  });
}

// Fetch (minimal quota use)
async function search(q = 'popular this week') {
  document.getElementById('loading').classList.remove('hidden');
  document.getElementById('results').innerHTML = '';

  try {
    const r = await fetch(
      `https://youtube.googleapis.com/youtube/v3/search?` +
      `part=snippet&maxResults=12&type=video&q=${encodeURIComponent(q)}&key=${API_KEY}`
    );
    const d = await r.json();

    if (d.items?.length) {
      render(d.items);
    } else {
      tg.showPopup({ message: "No videos found or quota issue" });
    }
  } catch {
    tg.showPopup({ message: "Network error – try again" });
  } finally {
    document.getElementById('loading').classList.add('hidden');
  }
}

// Events
document.getElementById('search-btn').onclick = () => {
  const q = document.getElementById('query').value.trim();
  if (q) search(q);
};

document.getElementById('query').onkeypress = e => {
  if (e.key === 'Enter') {
    const q = e.target.value.trim();
    if (q) search(q);
  }
};

// Start with trending / popular (low data, engaging)
search();