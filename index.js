const Discord = require('discord.js');
const mongoose = require('mongoose');
require('dotenv').config();

const DISCORD_CLIENT_TOKEN = process.env.DISCORD_CLIENT_TOKEN;
const DB_URI = process.env.MONGODB_URI;

const client = new Discord.Client({
  intents: [
    "GUILDS",
  ]
});

let bot = {
    client,
    prefix: "+",
    owners: "384518472383725568"
};

client.events = new Discord.Collection();
client.slashcommands = new Discord.Collection();
client.buttons = new Discord.Collection();

client.loadEvents = (bot, reload) => require("./handlers/events")(bot, reload);
client.loadSlashCommands = (bot, reload) => require("./handlers/slashcommands")(bot, reload);
client.loadButtons = (bot, reload) => require("./handlers/buttons")(bot, reload);

client.loadEvents(bot, false);
client.loadSlashCommands(bot, false);
client.loadButtons(bot, false);

client.on("ready", () => {
    client.user.setActivity("your stats improve!", { type: "WATCHING" })
})

process.on('unhandledRejection', error => {
	console.error('Unhandled promise rejection:', error);
});

module.exports = bot;

mongoose.connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to database!'))
  .catch((err) => console.log(err));
client.login(DISCORD_CLIENT_TOKEN);