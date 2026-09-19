const { Client } = require('discord.js-selfbot-v13');
const client = new Client({ checkUpdate: false });
const express = require('express');
const app = express();

// Render/Koyeb সার্ভারের পোর্ট রিসিভ করার কোড
const port = process.env.PORT || 8080; 

app.get('/', (req, res) => {
  res.send('অ্যাকাউন্ট ২৪ ঘন্টা আনমিউট অবস্থায় ভিসি-তে সক্রিয় আছে!');
});
app.listen(port, () => console.log(`Server running on port ${port}`));

const TOKEN = process.env.DISCORD_TOKEN; 
const VC_ID = '1126797582715326524'; // আপনার ভয়েস চ্যানেলের আইডি

client.on('ready', async () => {
  console.log(`${client.user.tag} হিসেবে লগইন সফল হয়েছে!`);
  try {
    const channel = await client.channels.fetch(VC_ID);
    if (!channel) return console.error("ভয়েস চ্যানেলটি পাওয়া যায়নি।");
    
    // সেলফ-বটের নিজস্ব ভয়েস জয়েন করার মেথড
    await client.voice.joinChannel(channel, {
      selfMute: false, // আনমিউট রাখার জন্য false
      selfDeaf: false  // ডাফ (Deaf) না করার জন্য false
    });
    
    console.log("সফলভাবে আনমিউট অবস্থায় ভিসি-তে জয়েন করা হয়েছে।");
  } catch (error) {
    console.error("ভিসি-তে জয়েন করতে সমস্যা হয়েছে:", error);
  }
});

client.login(TOKEN);
