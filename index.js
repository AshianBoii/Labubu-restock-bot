import { Client, GatewayIntentBits } from 'discord.js';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio'; 
import 'dotenv/config';

//discord bot token
const  BOT_TOKEN = 'BOT_TOKEN';
//discord role ID
const LABUBU_ROLE_ID = 'ID_DISCORD';
//discord channel ID
 const CHANNEL_ID = 'ID_CHANNEL'; 
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

const productUrls = [ //URLS for the 3 sites we want to be checking
  {
    name: 'Have-a-Seat',
    url: 'https://www.popmart.com/us/products/1372/THE-MONSTERS---Have-a-Seat-Vinyl-Plush-Blind-Box',
  },
  {
    name: 'Big into Energy',
    url: 'https://www.popmart.com/us/products/2155/THE-MONSTERS-Big-into-Energy-Series-Vinyl-Plush-Pendant-Blind-Box',
  },
  {
    name: 'Exciting Macaron',
    url: 'https://www.popmart.com/us/products/675/THE-MONSTERS---Exciting-Macaron-Vinyl-Face-Blind-Box',
  },
];

const previousStatuses = {};

async function checkStock(url, name) { //func to check the sties
  try {
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);

    //Checks to see if the buy button or add to cart button is available 
    const buyBtn = $('.btn-buy').text().toLowerCase();

    const inStock = buyBtn.includes('buy now') || buyBtn.includes('add to cart');
    //If available to click add to cart or buy will ping the role
 if (!previousStatuses[name] && inStock) {
      const channel = await client.channels.fetch(CHANNEL_ID);
      channel.send(`<@&${LABUBU_ROLE_ID}> **${name}** is RESTOCKED! 🛒\n${url}`);
    }

    previousStatuses[name] = inStock;
  } catch (error) {
    console.error(`Error checking ${name}:`, error);
  }
}
/* THIS IS CODE FOR IF U WANT TO RUN EVERY HOUR FOR THE FIRST 10 MINUTES THEN STOP
// 🔁 Run checks for the first 10 minutes of each hour
function startHourlyWindowCheck() {
  function scheduleNextHour() {
    const now = new Date();
    const msUntilNextHour =
      (60 - now.getMinutes()) * 60 * 1000 - now.getSeconds() * 1000 - now.getMilliseconds();

    console.log(`⏳ Waiting ${msUntilNextHour / 1000}s for next hourly check window...`);

    setTimeout(() => {
      runTenMinuteCheckWindow();
      scheduleNextHour(); // Set up next hour's run
    }, msUntilNextHour);
  }

  function runTenMinuteCheckWindow() {
    console.log(`Starting 10-minute check window at ${new Date().toLocaleTimeString()}`);

    const intervalId = setInterval(() => {
      const now = new Date();
      const minute = now.getMinutes();

      if (minute >= 10) {
        clearInterval(intervalId);
        console.log(` Ended 10-minute check window at ${now.toLocaleTimeString()}`);
        return;
      }

      console.log(`🔁 Checking restocks at ${now.toLocaleTimeString()}`);
      productUrls.forEach(({ name, url }) => checkStock(url, name));
    }, 60 * 1000); // Every minute for 10 minutes
  }

  scheduleNextHour(); // Start the process
}
*/

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  setInterval(() => {
    productUrls.forEach(({ name, url }) => checkStock(url, name));
  }, 60 * 1000); // check every 60 seconds
});

client.login(BOT_TOKEN);
