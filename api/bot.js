// bot.js
const { Telegraf } = require('telegraf');

const token = '8557040338:AAGT7VyhxhfbMi6ETnJdPsNzefGwr_LFKJI';   // same token as in html
const bot = new Telegraf(token);

bot.start((ctx) => {
  const from = ctx.from;
  console.log('\n=== New user ===');
  console.log('id:     ', from.id);
  console.log('username:', from.username);
  console.log('name:   ', from.first_name, from.last_name);
  console.log('===============\n');

  ctx.replyWithMarkdownV2(
    'Hi\\! Send me anything and I’ll show you your **chat ID** and basic info\\.\n\n' +
    'Put this number in the HTML file as `chatId`'
  );
});

bot.on('text', (ctx) => {
  const from = ctx.from;
  ctx.reply(
    `Your chat ID is: ${from.id}\n\n` +
    `username: @${from.username || 'none'}\n` +
    `name: ${from.first_name} ${from.last_name || ''}`
  );
});

bot.launch().then(() => {
  console.log('Bot is running...');
  console.log('Open Telegram → talk to your bot → get your chat ID');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));