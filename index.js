const { Client, RichPresence } = require('discord.js-selfbot-v13');
const express = require('express');
const app = express();

const port = process.env.PORT || 8080; 
app.get('/', (req, res) => res.send('৩টি অ্যাকাউন্টই ওওএম প্রোটেকশন ও স্ট্যাবল স্ট্যাটাসে সক্রিয় আছে!'));
app.listen(port, () => console.log(`Server running on port ${port}`));

// 🚨 ফিক্সড: শুধুমাত্র ৩টি আইডি ট্র্যাক করা হচ্ছে
const TOKENS = [
  process.env.DISCORD_TOKEN,   // ১ম আইডি
  process.env.DISCORD_TOKEN_2, // ২য় আইডি
  process.env.DISCORD_TOKEN_3  // ৩য় আইডি
];

const VC_ID = '1126797582715326524'; // আপনার ভয়েস চ্যানেলের আইডি
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

TOKENS.forEach(async (token, index) => {
  if (!token) return;

  // রেট-লিমিট এড়াতে প্রতিটি আইডির মাঝে ৮ সেকেন্ডের গ্যাপ
  const initialWait = index * 8000;
  await delay(initialWait);

  const client = new Client({ 
    checkUpdate: false,
    syncStatus: false,
    patchVoice: true,
    makeCache: () => new Map(), // র‍্যাম বাঁচানোর জন্য ক্যাশ মেমোরি খালি রাখা হলো
    ws: { properties: { "\$os": "Windows", "browser": "Discord Client", "release_channel": "stable" } }
  });

  const connectToVC = async () => {
    try {
      const channel = await client.channels.fetch(VC_ID);
      if (channel) {
        const connection = await client.voice.joinChannel(channel, {
          selfMute: false, 
          selfDeaf: false, 
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

    await delay(2000);
    try {
      // লিঙ্ক ও নাম ছাড়া ক্লিন "Watching (Dancing)" স্ট্যাটাস
      const r = new RichPresence(client)
        .setType('WATCHING') 
        .setName(' ') // নাম খালি থাকবে
        .setState('Dancing') // সাবটাইটেলে Dancing দেখাবে
        .setStartTimestamp(Date.now()) // টাইমার অন থাকবে
        .setAssetsLargeImage('https://postimg.cc'); 

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
