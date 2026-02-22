// api/order.js
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const data = req.body;

    const BOT_TOKEN = '8557040338:AAGT7VyhxhfbMi6ETnJdPsNzefGwr_LFKJI';
    const YOUR_CHAT_ID = 421868479; // ← your Telegram ID

    // Message to you (admin)
    const adminMsg = 
      `🛒 NEW ORDER\n\n` +
      `From: ${data.user_name} (ID ${data.user_id})\n` +
      `Phone: ${data.phone}\n` +
      `Total: ${data.total} Birr\n\n` +
      `Items:\n${data.items.map(i => `• ${i.brand} ${i.size} × ${i.qty}`).join('\n')}`;

    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: YOUR_CHAT_ID, text: adminMsg, parse_mode: 'Markdown' })
    });

    // Message to customer
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: data.user_id,
        text: `✅ Order received!\nTotal: ${data.total} Birr\nWe will call you on ${data.phone} soon. 💧`
      })
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};