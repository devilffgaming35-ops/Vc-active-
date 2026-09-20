const { Client, RichPresence } = require('discord.js-selfbot-v13');
const express = require('express');
const app = express();

// Render সার্ভার সচল রাখার জন্য এক্সপ্রেস পোর্ট
const port = process.env.PORT || 8080; 
app.get('/', (req, res) => {
  res.send('২টি অ্যাকাউন্টই ২৪ ঘণ্টা আনমিউট অবস্থায় ভিসি-তে সক্রিয় আছে!');
});
app.listen(port, () => console.log(`Server running on port ${port}`));

// রেন্ডারের Environment থেকে ২টি টোকেন নেওয়া হচ্ছে
const TOKENS = [
  process.env.DISCORD_TOKEN,   // আপনার ১ম আইডির টোকেন
  process.env.DISCORD_TOKEN_2  // আপনার ২য় আইডির টোকেন
];

const VC_ID = '1126797582715326524'; // আপনার ভয়েস চ্যানেলের আইডি

// মানুষের মতো আচরণ তৈরির জন্য র্যান্ডম ডিলের ফাংশন
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// প্রতিটি টোকেনকে এক এক করে রান করানোর ফাংশন
TOKENS.forEach(async (token, index) => {
  if (!token) return; // যদি কোনো টোকেন খালি থাকে তবে এড়িয়ে যাবে

  const client = new Client({ 
    checkUpdate: false,
    syncStatus: false,
    patchVoice: true, // ভয়েস প্রোটোকল স্ট্যাবল রাখার জন্য
    // 🚨 ফিক্সড: \$os সরিয়ে জাস্ট '\$os' স্ট্রিং ফরম্যাটে দেওয়া হয়েছে যাতে কোনো সিনট্যাক্স এরর না আসে
    ws: { properties: { "\$os": "Windows", "browser": "Discord Client", "release_channel": "stable" } }
  });

  // ভিসি-তে জয়েন করার ফাংশন
  const connectToVC = async () => {
    try {
      const channel = await client.channels.fetch(VC_ID);
      if (channel) {
        const connection = await client.voice.joinChannel(channel, {
          selfMute: false, // আনমিউট রাখার জন্য false (Voice XP এর জন্য)
          selfDeaf: false, // Undeaf রাখার জন্য false (Voice XP এর জন্য)
          selfVideo: false // ক্যামেরা অফ থাকবে র‍্যাম বাঁচাতে
        });
        console.log(`[ID ${index + 1}] ${client.user.tag} আনমিউট অবস্থায় ভিসি-তে জয়েন করেছে।`);

        // ডিসকর্ডের ভয়েস গেটওয়ে ড্রপ প্রোটেকশন (Keep-Alive Clicks)
        if (connection) {
          const keepVoiceAlive = () => {
            if (client.ws.status !== 0) return;
            try {
              connection.setSpeaking(true);
              setTimeout(() => { try { connection.setSpeaking(false); } catch(e){} }, 1000);
            } catch (e) {}
            setTimeout(keepVoiceAlive, 25000); // প্রতি ২৫ সেকেন্ড পর পর ফেক সিগন্যাল
          };
          keepVoiceAlive();
        }
      }
    } catch (err) {
      console.error(`[ID ${index + 1}] ভিসি জয়েন এরর:`, err.message);
      setTimeout(connectToVC, 15000); // এরর আসলে ১৫ সেকেন্ড পর আবার ট্রাই করবে
    }
  };

  client.on('ready', async () => {
    console.log(`[ID ${index + 1}] ${client.user.tag} লগইন সফল!`);
    await delay(3000); // লগইন হওয়ার ৩ সেকেন্ড পর ভিসি-তে হিট করবে
    await connectToVC();

    // লোগো ও টাইমারসহ স্ট্রিমিং স্ট্যাটাস (Watching Chithi Ghor)
    await delay(2000);
    try {
      const r = new RichPresence(client)
        .setType('STREAMING')
        .setURL('https://twitch.tv')
        .setName('Chithi Ghor')
        .setStartTimestamp(Date.now())
        .setAssetsLargeImage('https://postimg.cc') 
        .setAssetsLargeText('Chithi Ghor')
        // নিচে আপনার আসল সার্ভারের ইনভাইট লিঙ্কটি বসিয়ে দিন
        .addButton('Join Server', 'https://discord.gg'); 

      client.user.setActivity(r);
    } catch (err) {
      console.error('স্ট্যাটাস সেট এরর:', err.message);
    }
  });

  // যদি ডিসকর্ড বা রেন্ডার থেকে সেশন ড্রপ করে তবে অটো-রিলগইন পলিসি
  client.on('shardDisconnect', () => {
    console.log(`[ID ${index + 1}] ডিসকানেক্টেড! ৭ সেকেন্ড পর আবার চেষ্টা করা হচ্ছে...`);
    setTimeout(() => client.login(token).catch(e => {}), 7000);
  });

  // ২টি আইডি একসাথে লগইন হয়ে ডিসকর্ডের রেট-লিমিটে পড়া এড়াতে ৬ সেকেন্ডের গ্যাপ
  setTimeout(() => {
    client.login(token).catch(err => console.error(`[ID ${index + 1}] লগইন ব্যর্থ!`));
  }, index * 6000);
});
