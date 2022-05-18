const Discord = require('discord.js');
const keepAlive = require('./server');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require("fs");

const DISCORD_CLIENT_TOKEN = process.env["DISCORD_CLIENT_TOKEN"];

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
// client.buttons = new Discord.Collection();

client.loadEvents = (bot, reload) => require("./handlers/events")(bot, reload);
client.loadSlashCommands = (bot, reload) => require("./handlers/slashcommands")(bot, reload);
// client.loadButtons = (bot, reload) => require("./handlers/buttons")(bot, reload);

client.loadEvents(bot, false);
client.loadSlashCommands(bot, false);
// client.loadButtons(bot, false);

client.on("ready", () => {
    client.user.setActivity("your stats improve!", { type: "WATCHING" })
})

process.on('unhandledRejection', error => {
	console.error('Unhandled promise rejection:', error);
});

module.exports = bot;

keepAlive();
client.login(DISCORD_CLIENT_TOKEN);

///////////////////////////////////////////////////////////////////////////////////////////


  // const DISCORD_CLIENT_TOKEN = process.env["DISCORD_CLIENT_TOKEN"];
  // const client = new Discord.Client({
  //   intents: [
  //     "GUILDS",
  //     "GUILD_MESSAGES",
  //     "GUILD_MEMBERS"
  //   ]
  // });
  // let bot = {
  //     client,
  //     prefix: "+",
  //     owners: "384518472383725568"
  // };
  // client.slashcommands = new Discord.Collection();
  // client.loadSlashCommands = (bot, reload) => require("./handlers/slashcommands")(bot, reload);    
  // client.loadSlashCommands(bot, false);
  // const CLIENT_ID = '975892266252107850';
  // const guildID = "796184020236894228";
  // let commands = []
  // const slashFiles = fs.readdirSync('./slashcommands').filter(file => file.endsWith('.js'))
  
  
  // for (const file of slashFiles) {
  //   const slashcmd = require(`./slashcommands/${file}`)
  //   client.slashcommands.set(slashcmd.name, slashcmd)
  //   commands.push(slashcmd)
  // }
  
  //   const rest = new REST({ version: '9' }).setToken(DISCORD_CLIENT_TOKEN)
  //   console.log('Deploying slash commands')
  //   rest.put(Routes.applicationGuildCommands(CLIENT_ID, guildID), { body: commands})
  //     .then(() => {
  //       console.log('Successfully loaded slash commands')
  //       process.exit(0)
  //     })
  //     .catch((err) => {
  //       console.log(err)
  //       process.exit(1)
  //     })
  
  // // if (LOAD_SLASH) {
  // //   const rest = new REST({ version: '9' }).setToken(DISCORD_CLIENT_TOKEN)
  // //   console.log('Deploying slash commands')
  // //   rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands})
  // //     .then(() => {
  // //       console.log('Successfully loaded slash commands')
  // //       process.exit(0)
  // //     })
  // //     .catch((err) => {
  // //       console.log(err)
  // //       process.exit(1)
  // //     })
  // // }
  
  
  
  // client.login(DISCORD_CLIENT_TOKEN);