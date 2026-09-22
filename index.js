const { Client, RichPresence } = require('discord.js-selfbot-v13');
const express = require('express');
const app = express();

// Render সার্ভার সচল রাখার জন্য পোর্ট
const port = process.env.PORT || 8080; 
app.get('/', (req, res) => res.send('৪টি অ্যাকাউন্টই কাস্টম স্ট্যাটাস ও আনমিউট ভিসি-তে সক্রিয় আছে!'));
app.listen(port, () => console.log(`Server running on port ${port}`));

// রেন্ডারের Environment থেকে ৪টি টোকেন নেওয়া হচ্ছে
const TOKENS = [
  process.env.DISCORD_TOKEN,   // ১ম আইডি
  process.env.DISCORD_TOKEN_2, // ২য় আইডি
  process.env.DISCORD_TOKEN_3, // ৩য় আইডি
  process.env.DISCORD_TOKEN_4  // ৪র্থ আইডি
];

const VC_ID = '1126797582715326524'; // আপনার ভয়েস চ্যানেলের আইডি

// ডিলে বা বিরতি তৈরি করার ফাংশন
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// প্রতিটি টোকেন প্রোসেস করার মূল লুপ
TOKENS.forEach(async (token, index) => {
  if (!token) return; // টোকেন খালি থাকলে স্কিপ করবে

  // ৪টি আইডি একসাথে হিট করে যাতে রেট-লিমিটে না পড়ে, তাই ৮ সেকেন্ড করে গ্যাপ দেওয়া হলো
  const initialWait = index * 8000;
  await delay(initialWait);

  const client = new Client({ 
    checkUpdate: false,
    syncStatus: false,
    patchVoice: true,
    ws: { properties: { "\$os": "Windows", "browser": "Discord Client", "release_channel": "stable" } }
  });

  // ভিসি-তে জয়েন ও সচল রাখার ফাংশন
  const connectToVC = async () => {
    try {
      const channel = await client.channels.fetch(VC_ID);
      if (channel) {
        const connection = await client.voice.joinChannel(channel, {
          selfMute: false, // আনমিউট (XP এর জন্য)
          selfDeaf: false, // আনডাফ (XP এর জন্য)
          selfVideo: false
        });
        console.log(`[Success] [ID ${index + 1}] ${client.user.tag} ভিসি-তে জয়েন করেছে।`);

        if (connection) {
          const keepVoiceAlive = () => {
            if (client.ws.status !== 0) return;
            try {
              connection.setSpeaking(true);
              setTimeout(() => { try { connection.setSpeaking(false); } catch(e){} }, 1000);
            } catch (e) {}
            setTimeout(keepVoiceAlive, 25000);
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

    // 🚨 লিঙ্ক ও নাম ছাড়া শুধুমাত্র Watching + Bio-তে Dancing স্ট্যাটাস মডিউল
    await delay(2000);
    try {
      const r = new RichPresence(client)
        .setType('WATCHING') 
        .setName(' ') // নাম খালি রাখার জন্য ব্ল্যাঙ্ক স্পেস দেওয়া হয়েছে (শুধু "Watching" দেখাবে)
        .setState('Dancing') // প্রোফাইলের সাব-টাইটেল বা বায়োর ঘরে "Dancing" দেখাবে
        .setStartTimestamp(Date.now()) // টাইমার লাইভ কাউন্ট হবে
        .setAssetsLargeImage('https://postimg.cc'); // আপনার লোগো (এর ওপর কোনো টেক্সট থাকবে না)

      client.user.setActivity(r);
      console.log(`[Status Set] [ID ${index + 1}] কাস্টম রিচ প্রেজেন্স সচল হয়েছে।`);
    } catch (err) {
      console.error(`[Status Error] [ID ${index + 1}]:`, err.message);
    }
  });

  // কুইক কমান্ড সিস্টেম (Lock, Hide, Move)
  client.on('messageCreate', async (message) => {
    if (message.author.id !== client.user.id) return;
    const content = message.content.toLowerCase().trim();

    if (content === 'lock') {
      try {
        await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SEND_MESSAGES: false });
        await message.delete().catch(() => {});
        const reply = await message.channel.send('🔒 **এই চ্যানেলটি লক করা হয়েছে!**');
        setTimeout(() => reply.delete().catch(() => {}), 5000);
      } catch (e) {}
    }

    if (content === 'hide') {
      try {
        await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { VIEW_CHANNEL: false });
        await message.delete().catch(() => {});
        const reply = await message.channel.send('👁️‍عون **এই চ্যানেলটি হাইড করা হয়েছে!**');
        setTimeout(() => reply.delete().catch(() => {}), 5000);
      } catch (e) {}
    }

    if (content.startsWith('move ')) {
      try {
        const targetId = content.replace('move ', '').trim();
        const member = await message.guild.members.fetch(targetId);
        if (member && member.voice.channel) {
          await member.voice.setChannel(VC_ID);
          await message.delete().catch(() => {});
        }
      } catch (e) {}
    }
  });

  client.on('shardDisconnect', () => {
    console.log(`[Disconnect] [ID ${index + 1}] কানেকশন ড্রপ! ৮ সেকেন্ড পর রিলগইন হচ্ছে...`);
    setTimeout(() => client.login(token).catch(e => {}), 8000);
  });

  client.login(token).catch(err => console.error(`[Login Failed] [ID ${index + 1}] টোকেন ভুল বা নষ্ট!`));
});
