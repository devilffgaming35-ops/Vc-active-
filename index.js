const { Client } = require('discord.js-selfbot-v13');
const client = new Client({ checkUpdate: false });
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('অ্যাকাউন্ট ২৪ ঘন্টা আনমিউট অবস্থায় ভিসি-তে সক্রিয় আছে!');
});
app.listen(3000);

const TOKEN = process.env.DISCORD_TOKEN; 
const VC_ID = '1126797582715326524'; // এখানে আপনার ভয়েস চ্যানেলের আইডি বসাবেন

client.on('ready', async () => {
  console.log(`${client.user.tag} হিসেবে লগইন সফল হয়েছে!`);
  try {
    const channel = await client.channels.fetch(VC_ID);
    if (!channel) return console.error("ভয়েস চ্যানেলটি পাওয়া যায়নি।");
    
    // ভিসি-তে আনমিউট হয়ে জয়েন করার সেটিংস
    await channel.join({
      selfMute: false,  // false মানে অ্যাকাউন্টটি মিউট থাকবে না (Unmute থাকবে)
      selfDeaf: false   // false মানে অ্যাকাউন্টটি বধির থাকবে না (সাউন্ড অন থাকবে)
    });
    console.log("সফলভাবে আনমিউট অবস্থায় ভিসি-তে জয়েন করা হয়েছে।");
  } catch (error) {
    console.error("ভিসি-তে জয়েন করতে সমস্যা হয়েছে:", error);
  }
});

client.login(TOKEN);