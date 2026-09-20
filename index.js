const { Client, RichPresence } = require('discord.js-selfbot-v13');
const client = new Client({ checkUpdate: false });
const express = require('express');
const app = express();

const port = process.env.PORT || 8080; 

app.get('/', (req, res) => {
  res.send('অ্যাকাউন্ট ভিসি এবং কাস্টম স্ট্যাটাসে সক্রিয় আছে!');
});
app.listen(port, () => console.log(`Server running on port ${port}`));

const TOKEN = process.env.DISCORD_TOKEN; 
const VC_ID = '1126797582715326524'; // আপনার ভয়েস চ্যানেলের আইডি

client.on('ready', async () => {
  console.log(`${client.user.tag} হিসেবে লগইন সফল হয়েছে!`);
  
  // ১. ভিসি-তে জয়েন করার অংশ
  try {
    const channel = await client.channels.fetch(VC_ID);
    if (channel) {
      await client.voice.joinChannel(channel, {
        selfMute: false, 
        selfDeaf: false  
      });
      console.log("সফলভাবে ভিসি-তে জয়েন করা হয়েছে।");
    }
  } catch (error) {
    console.error("ভিসি-তে জয়েন করতে সমস্যা হয়েছে:", error);
  }

  // ২. আপনার পছন্দমতো পারফেক্ট রিচ প্রেজেন্স (Rich Presence) সেট করার অংশ
  try {
    const r = new RichPresence(client)
      .setType('WATCHING') 
      .setName('Chithi Ghor') // প্রোফাইলে "Watching Chithi Ghor" দেখাবে
      .setStartTimestamp(Date.now()) // প্রোফাইলে ঢুকলে সময় (যেমন: 01:23 elapsed) লাইভ কাউন্ট করবে
      // নিচের লিঙ্কের জায়গায় আপনার আসল ডিসকর্ড সার্ভারের ইনভাইট লিঙ্কটি বসিয়ে দিন
      .addButton('Join Server', 'https://discord.gg/5ztwsyqdgy'); 

    client.user.setActivity(r);
    console.log("কাস্টম রিচ প্রেজেন্স সফলভাবে সেট হয়েছে।");
  } catch (error) {
    console.error("স্ট্যাটাস সেট করতে সমস্যা হয়েছে:", error);
  }
});

client.login(TOKEN);