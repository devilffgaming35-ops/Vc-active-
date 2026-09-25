const { Client } = require('discord.js-selfbot-v13');
const { joinVoiceChannel } = require('@discordjs/voice');

// Render Environment Variables থেকে টোকেনগুলো নেওয়া হচ্ছে
const tokens = [
  process.env.DISCORD_TOKEN,
  process.env.DISCORD_TOKEN_2,
  process.env.DISCORD_TOKEN_3
];

const channelId = process.env.VOICE_CHANNEL_ID;

tokens.forEach((token, index) => {
  // যদি রেন্ডার ড্যাশবোর্ডে কোনো টোকেন বসানোই না থাকে
  if (!token) {
    console.log(`⚠️ ID ${index + 1}: রেন্ডার এনভায়রনমেন্টে DISCORD_TOKEN_${index + 1} সেট করা নেই! স্কিপ করা হলো।`);
    return;
  }

  const client = new Client({ checkUpdate: false });

  // আইডি সফলভাবে লগইন হলে
  client.on('ready', async () => {
    console.log(`✅ ID ${index + 1} [${client.user.username}] login success!`);

    const channel = client.channels.cache.get(channelId);
    if (channel) {
      try {
        joinVoiceChannel({
          channelId: channel.id,
          guildId: channel.guild.id,
          adapterCreator: channel.guild.voiceAdapterCreator,
          selfMute: false,  // Unmute রাখার জন্য false
          selfDeaf: false,  // Undeaf রাখার জন্য false
        });
        console.log(`🔊 ID ${index + 1} [${client.user.username}] VC join success!`);
      } catch (error) {
        console.error(`❌ ID ${index + 1} [${client.user.username}] VC join failed (ভয়েস চ্যানেলে ঢুকতে ব্যর্থ):`, error);
      }
    } else {
      console.log(`❌ ID ${index + 1} [${client.user.username}]: ভয়েস চ্যানেল খুঁজে পাওয়া যায়নি! আইডি ঠিক আছে কি না চেক করুন।`);
    }
  });

  // লগইন করতে ব্যর্থ হলে বা টোকেন নষ্ট হলে এই অংশটি রান করবে
  client.login(token).catch(err => {
    console.error(`❌ ID ${index + 1}: login করতে ব্যর্থ! [টোকেন নষ্ট, ভুল বা এক্সপায়ারড]`);
  });
});

// UptimeRobot এবং Render-এর জন্য HTTP Server
const http = require('http');
http.createServer((req, res) => {
  res.write("Selfbot is running!");
  res.end();
}).listen(process.env.PORT || 3000, () => {
  console.log("🌐 Web server is live for UptimeRobot!");
});
