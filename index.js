const { Client, RichPresence } = require('discord.js-selfbot-v13');
const express = require('express');
const app = express();

// Render সার্ভার ২৪/৭ সচল রাখার জন্য এক্সপ্রেস পোর্ট
const port = process.env.PORT || 8080; 
app.get('/', (req, res) => res.send('৩টি অ্যাকাউন্টই শুধুমাত্র আনমিউট ভিসি এবং স্ট্যাটাসে সক্রিয় আছে!'));
app.listen(port, () => console.log(`Server running on port ${port}`));

// রেন্ডার এনভায়রনমেন্ট থেকে টোকেন ৩টি রিড করা
const TOKENS = [
  process.env.DISCORD_TOKEN,   // ১ম আইডি
  process.env.DISCORD_TOKEN_2, // ২য় আইডি
  process.env.DISCORD_TOKEN_3  // ৩য় আইডি
];

const VC_ID = '1126797582715326524'; // আপনার ভয়েস চ্যানেলের আইডি
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

TOKENS.forEach(async (token, index) => {
  if (!token) return;

  // ওওএম ক্র্যাশ এবং ডিসকর্ডের রেট লিমিট এড়াতে ১০ সেকেন্ডের নিরাপদ বিরতি (Delay)
  const initialWait = index * 10000;
  await delay(initialWait);

  const client = new Client({ 
    checkUpdate: false,
    syncStatus: false,
    patchVoice: true, // ভয়েস প্রোটোকল স্ট্যাবল রাখার জন্য
    ws: { properties: { "\$os": "Windows", "browser": "Discord Client", "release_channel": "stable" } }
  });

  // ভয়েস চ্যানেলে জয়েন ও কানেকশন সচল রাখার ফাংশন
  const connectToVC = async () => {
    try {
      const channel = await client.channels.fetch(VC_ID);
      if (channel) {
        const connection = await client.voice.joinChannel(channel, {
          selfMute: false, // আনমিউট নিশ্চিত করা (Voice XP এর জন্য)
          selfDeaf: false, // আনডাফ নিশ্চিত করা (Voice XP এর জন্য)
          selfVideo: false // ক্যামেরা অফ থাকবে র‍্যাম বাঁচাতে
        });
        console.log(`[Success] [ID ${index + 1}] ${client.user.tag} ভিসি-তে জয়েন করেছে।`);

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
      console.error(`[Error] [ID ${index + 1}] ভিসি জয়েন ব্যর্থ:`, err.message);
      setTimeout(connectToVC, 20000); // ব্যর্থ হলে ২০ সেকেন্ড পর আবার চেষ্টা করবে
    }
  };

  client.on('ready', async () => {
    console.log(`[Logged In] [ID ${index + 1}] ${client.user.tag}`);
    await delay(3000); // লগইন হওয়ার ৩ সেকেন্ড পর ভিসি-তে হিট করবে
    await connectToVC();

    await delay(2000);
    try {
      // লিঙ্ক ও নাম ছাড়া শুধুমাত্র কাস্টম ক্লিন স্ট্যাটাস (Watching - Dancing)
      const r = new RichPresence(client)
        .setType('WATCHING') 
        .setName(' ') // নাম খালি থাকবে
        .setState('Dancing') // সাবটাইটেলে Dancing দেখাবে
        .setStartTimestamp(Date.now()) // টাইমার লাইভ কাউন্ট হবে
        .setAssetsLargeImage('https://postimg.cc'); // আপনার লোগো

      client.user.setActivity(r);
      console.log(`[Status Set] [ID ${index + 1}] স্ট্যাটাস সফলভাবে সেট হয়েছে।`);
    } catch (err) {
      console.error(`[Status Error] [ID ${index + 1}]:`, err.message);
    }
  });

  // নেটওয়ার্ক ড্রপ বা রেন্ডার রিস্টার্ট নিলে অটো-রিলগইন পলিসি
  client.on('shardDisconnect', () => {
    console.log(`[Disconnect] [ID ${index + 1}] কানেকশন ড্রপ! ১০ সেকেন্ড পর রিলগইন হচ্ছে...`);
    setTimeout(() => client.login(token).catch(e => {}), 10000);
  });

  client.login(token).catch(err => console.error(`[Login Failed] [ID ${index + 1}] টোকেন ভুল বা নষ্ট!`));
});
