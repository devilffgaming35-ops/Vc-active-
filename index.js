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

  // ২. পারফেক্ট রিচ প্রেজেন্স (Streaming Mode + Server Logo + Watching Title + Join Button)
  try {
    const r = new RichPresence(client)
      .setType('STREAMING') // প্রোফাইলে বেগুনি রঙের "Streaming" লাইভ মোড দেখানোর জন্য
      .setURL('https://twitch.tv') // স্ট্রিমিং মোড অন করতে যেকোনো একটি লিংক দিতেই হয়
      .setName('Chithi Ghor') // এর ফলে প্রোফাইলের মেইন লাইনে "Watching Chithi Ghor" লেখা আসবে
      .setStartTimestamp(Date.now()) // প্রোফাইলে ঢুকলে কতক্ষণ ধরে দেখছে (Elapsed Time) তা কাউন্ট হবে
      
      // আপনার সার্ভারের লোগোর ডিরেক্ট ইমেজ লিংক নিচে বসান (অবশ্যই লিঙ্কের শেষে .png বা .jpg থাকতে হবে)
      .setAssetsLargeImage('https://ibb.co.com/vxwXZfQG') 
      .setAssetsLargeText('Chithi Ghor') // ছবির ওপর মাউস রাখলে এই লেখাটি দেখাবে
      
      // নিচে আপনার আসল ডিসকর্ড সার্ভারের ইনভাইট লিঙ্কটি বসিয়ে দিন
      .addButton('Join Server', 'https://discord.gg/5ztwsyqdgy'); 

    client.user.setActivity(r);
    console.log("লোগো এবং স্ট্রিমিং মোডসহ কাস্টম রিচ প্রেজেন্স সেট হয়েছে।");
  } catch (error) {
    console.error("স্ট্যাটাস সেট করতে সমস্যা হয়েছে:", error);
  }
});

client.login(TOKEN);