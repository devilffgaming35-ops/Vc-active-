const { Client } = require('discord.js-selfbot-v13');
const express = require('express');
const app = express();

// Render সার্ভার সচল রাখার জন্য মিনিমাল এক্সপ্রেস পোর্ট
const port = process.env.PORT || 8080; 
app.get('/', (req, res) => res.send('৩টি অ্যাকাউন্টই ওওএম প্রোটেকশন ও আনমিউট ভিসি মোডে সক্রিয় আছে!'));
app.listen(port, () => console.log(`Server running on port ${port}`));

// গ্লোবাল ক্র্যাশ প্রোটেকশন যাতে কোনো ইন্টারনাল এররে প্রসেস বন্ধ না হয়
process.on('unhandledRejection', (e) => console.error('Caught Rejection:', e.message));
process.on('uncaughtException', (e) => console.error('Caught Exception:', e.message));

const TOKENS = [
  process.env.DISCORD_TOKEN,   // ১ম আইডি
  process.env.DISCORD_TOKEN_2, // ২য় আইডি
  process.env.DISCORD_TOKEN_3  // ৩য় আইডি
];

const VC_ID = '1126797582715326524'; // আপনার ভয়েস চ্যানেলের আইডি
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

TOKENS.forEach(async (token, index) => {
  if (!token) return;

  // র‍্যাম স্পাইক ও রেট লিমিট এড়াতে ১০ সেকেন্ডের নিরাপদ বিরতি
  const initialWait = index * 10000;
  await delay(initialWait);

  const client = new Client({ 
    checkUpdate: false,
    syncStatus: false,
    patchVoice: true,
    // মোস্ট ইম্পর্ট্যান্ট: কোনো মেসেজ বা মেম্বার ডেটা ক্যাশ করবে না (র‍্যাম সেভার)
    makeCache: () => new Map(),
    ws: { properties: { "\$os": "Windows", "browser": "Discord Client", "release_channel": "stable" } }
  });

  const connectToVC = async () => {
    try {
      const channel = await client.channels.fetch(VC_ID).catch(() => null);
      if (channel) {
        const connection = await client.voice.joinChannel(channel, {
          selfMute: false, // আনমিউট নিশ্চিত করা
          selfDeaf: false, // আনডাফ নিশ্চিত করা
          selfVideo: false // ক্যামেরা অফ থাকবে
        }).catch(() => null);

        if (connection) {
          console.log(`[Success] [ID ${index + 1}] ${client.user.tag} ভিসি-তে জয়েন করেছে।`);
          
          // ডিসকর্ড ভয়েস গেটওয়ে সচল রাখার মিনিমাল লাইটওয়েট হার্টবিট
          const keepVoiceAlive = () => {
            if (client.ws.status !== 0) return;
            try {
              connection.setSpeaking(true);
              setTimeout(() => { try { connection.setSpeaking(false); } catch(e){} }, 1000);
            } catch (e) {}
            setTimeout(keepVoiceAlive, 30000); // প্রতি ৩০ সেকেন্ড পর পর লাইট হিট
          };
          keepVoiceAlive();
        }
      }
    } catch (err) {
      console.error(`[Error] [ID ${index + 1}] ভিসি জয়েন ব্যর্থ:`, err.message);
      setTimeout(connectToVC, 20000);
    }
  };

  client.on('ready', async () => {
    console.log(`[Logged In] [ID ${index + 1}] ${client.user.tag}`);
    await delay(3000); 
    await connectToVC();
    // 🚨 স্ট্যাটাস ও টাইমারের সমস্ত কোড সম্পূর্ণ ডিলিট করা হয়েছে র‍্যাম বাঁচানোর জন্য
  });

  // ভিসি থেকে ডিসকানেক্ট হলে অটো-রিকানেক্ট পলিসি
  client.on('voiceStateUpdate', (oldState, newState) => {
    if (oldState.member.id === client.user.id && !newState.channelId) {
      console.log(`[Alert] [ID ${index + 1}] ভিসি বিচ্ছিন্ন হয়েছে! ৫ সেকেন্ড পর পুনরায় চেষ্টা করা হচ্ছে...`);
      setTimeout(connectToVC, 5000);
    }
  });

  // নেটওয়ার্ক ড্রপ করলে রিলগইন পলিসি
  client.on('shardDisconnect', () => {
    console.log(`[Disconnect] [ID ${index + 1}] গেটওয়ে ড্রপ! ৫ সেকেন্ড পর রিলগইন হচ্ছে...`);
    setTimeout(() => client.login(token).catch(() => {}), 5000);
  });

  client.login(token).catch(err => console.error(`[Login Failed] [ID ${index + 1}]`));
});
