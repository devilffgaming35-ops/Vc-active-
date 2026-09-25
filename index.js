const { Client } = require('discord.js-selfbot-v13');
const express = require('express');
const app = express();

const port = process.env.PORT || 8080; 
app.get('/', (req, res) => res.send('৩টি অ্যাকাউন্টই ওওএম প্রোটেকশন ও আনমিউট ভিসি মোডে সক্রিয় আছে!'));
app.listen(port, () => console.log(`Server running on port ${port}`));

process.on('unhandledRejection', (e) => console.error('Caught Rejection:', e.message));
process.on('uncaughtException', (e) => console.error('Caught Exception:', e.message));

const TOKENS = [
  process.env.DISCORD_TOKEN,   
  process.env.DISCORD_TOKEN_2, 
  process.env.DISCORD_TOKEN_3  
];

const VC_ID = '1126797582715326524'; 
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

TOKENS.forEach(async (token, index) => {
  if (!token) return;

  const initialWait = index * 10000;
  await delay(initialWait);

  const client = new Client({ 
    checkUpdate: false,
    syncStatus: false,
    patchVoice: true
  });

  const connectToVC = async () => {
    try {
      const channel = await client.channels.fetch(VC_ID).catch(() => null);
      if (channel) {
        const connection = await client.voice.joinChannel(channel, {
          selfMute: false, 
          selfDeaf: false, 
          selfVideo: false 
        }).catch(() => null);

        if (connection) {
          console.log(`[Success] [ID ${index + 1}] ${client.user.tag} ভিসি-তে জয়েন করেছে।`);
          
          const keepVoiceAlive = () => {
            if (client.ws.status !== 0) return;
            try {
              connection.setSpeaking(true);
              setTimeout(() => { try { connection.setSpeaking(false); } catch(e){} }, 1000);
            } catch (e) {}
            setTimeout(keepVoiceAlive, 30000); 
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
  });

  client.on('voiceStateUpdate', (oldState, newState) => {
    if (oldState.member.id === client.user.id && !newState.channelId) {
      console.log(`[Alert] [ID ${index + 1}] ভিসি বিচ্ছিন্ন হয়েছে! ৫ সেকেন্ড পর পুনরায় চেষ্টা করা হচ্ছে...`);
      setTimeout(connectToVC, 5000);
    }
  });

  client.on('shardDisconnect', () => {
    console.log(`[Disconnect] [ID ${index + 1}] গেটওয়ে ড্রপ! ৫ সেকেন্ড পর রিলগইন হচ্ছে...`);
    setTimeout(() => client.login(token).catch(() => {}), 5000);
  });

  client.login(token).catch(err => console.error(`[Login Failed] [ID ${index + 1}]`));
});
