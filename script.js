const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();
tg.MainButton.hide();

// Force our premium dark palette (overrides Telegram if needed for consistency)
document.documentElement.style.setProperty('--tg-theme-bg-color', '#0a0a0a');
document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', '#111111');
document.documentElement.style.setProperty('--tg-theme-text-color', '#e0e0e0');
document.documentElement.style.setProperty('--tg-theme-hint-color', '#aaaaaa');

// Greeting
document.getElementById('greeting').textContent = 'Data for everyone';

// Rest of your script remains exactly the same...
// (user greeting removed since we want "Data for everyone")
// Config, loadYTAPI, createLiteEmbed, render, search, events...