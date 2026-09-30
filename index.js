const { Client } = require('discord.js-selfbot-v13');
const express = require('express');
const app = express();

// Render সার্ভার সচল রাখার জন্য এক্সপ্রেস পোর্ট
const port = process.env.PORT || 8080; 
app.get('/', (req, res) => {
  res.send('৩টি আইডি সম্পূর্ণ সেফ মোডে ভিসি-তে সক্রিয় আছে!');
});
app.listen(port, () => console.log(`Server running on port ${port}`));

// রেন্ডার এনভায়রনমেন্ট থেকে টোকেন
const TOKENS = [
  process.env.DISCORD_TOKEN,   
  process.env.DISCORD_TOKEN_2, 
  process.env.DISCORD_TOKEN_3  
];

const VC_ID = '1126797582715326524'; // আপনার ভয়েস চ্যানেলের আইডি

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const startBots = async () => {
  for (let index = 0; index < TOKENS.length; index++) {
    const token = TOKENS[index];
    if (!token) continue;

    // অ্যান্টি-ব্যান প্রোটেকশন: প্রতি আইডির মাঝে ৬ সেকেন্ডের সেফ গ্যাপ
    if (index > 0) {
      console.log(`[ID ${index + 1}] অ্যান্টি-ব্যান প্রোটেকশন: ৬ সেকেন্ড অপেক্ষা করা হচ্ছে...`);
      await delay(6000);
    }

    // অফিশিয়াল উইন্ডোজ ক্লায়েন্টের মতো স্পুফিং (Anti-Detection)
    const client = new Client({ 
      checkUpdate: false,
      syncStatus: false,
      patchVoice: true,
      ws: { properties: { "\$os": "Windows", "browser": "Discord Client", "release_channel": "stable" } }
    });

    const connectToVC = async () => {
      try {
        const channel = await client.channels.fetch(VC_ID);
        if (channel) {
          await client.voice.joinChannel(channel, {
            selfMute: false, // আনমিউট (Voice XP কাউন্ট হবে)
            selfDeaf: false, // আনডেফ
            selfVideo: false 
          });
          console.log(`[ID ${index + 1}] ${client.user.tag} সেফলি ভিসি-তে জয়েন করেছে।`);
        }
      } catch (err) {
        console.error(`[ID ${index + 1}] ভিসি জয়েন এরর: ${err.message}`);
        // ভিসি ড্রপ করলে ১৫ সেকেন্ড পর আবার রিকানেক্ট ট্রাই করবে
        setTimeout(connectToVC, 15000); 
      }
    };

    client.on('ready', async () => {
      console.log(`[ID ${index + 1}] ${client.user.tag} লগইন সফল!`);
      await delay(3000); // লগইন হওয়ার ৩ সেকেন্ড পর ভিসি জয়েন রিকোয়েস্ট (হিউম্যান অ্যাকশন সিমুলেশন)
      await connectToVC();
    });

    // ইন্টারনেট বা সার্ভার ড্রপ করলে রিলগইন পলিসি
    client.on('shardDisconnect', () => {
      console.log(`[ID ${index + 1}] ডিসকানেক্টেড! সেফটি পিরিয়ড (১০ সেকেন্ড) পর আবার চেষ্টা করা হচ্ছে...`);
      setTimeout(() => client.login(token).catch(e => {}), 10000);
    });

    client.login(token).catch(err => console.error(`[ID ${index + 1}] লগইন ব্যর্থ! টোকেন চেক করুন।`));
  }
};

startBots();
