const valAPI = require('unofficial-valorant-api');
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { convertDuration, roundTo } = require('../util/functions');

var matches = [];
var slashcommandId;
var matchHistoryObj = {
  matches,
  slashcommandId
};

const run = async (client, interaction) => {
  let userName, userTag, userRegion
  if (interaction.options._hoistedOptions.length === 0) {
    const currentUser = await ValorantUserInfo.findOne({ discordUserId: interaction.user.id });
    userName = currentUser.name;
    userTag = currentUser.tagline;
    userRegion = currentUser.region;
  }
  else if (interaction.options._hoistedOptions.length >= 3) {
    userName = interaction.options.getString('name');
    userTag = interaction.options.getString('tagline');
    userRegion = interaction.options.getString('region'); 
  }
  else {
    await interaction.reply('**name**, **tag**, and **region** arguments are required');
    return;
  }
  
  const mode = interaction.options.getString('mode');
  const map = interaction.options.getString('map');
  let matchRes;
  

  await valAPI.getMatches(userRegion, userName, userTag, 5, mode, map)
    .then(response => matchRes = response.data)
    .catch(async (err) => {
      console.log(err);
      await interaction.reply('Something went wrong, please try again');
    });

  for (i = 0; i < 5; i++) {
    let playerObj, winningTeam, matchDuration, headshotPrecentString;
    
    convertDuration(matchRes[i].metadata.game_length, duration => matchDuration = duration);
    // iterates through all player objects and returns the player object of the requested player
    for (j = 0; j < matchRes[i].players.all_players.length; j++) {
      if (matchRes[i].players.all_players[j].name === userName) {
        playerObj = matchRes[i].players.all_players[j];
        winningTeam = (Object.values(matchRes[i].teams.red).indexOf(true) > -1) ? 'Red' : 'Blue';

        if (matchRes[i].metadata.mode !== 'Deathmatch') headshotPrecentString = `${String(roundTo(playerObj.stats.headshots/(playerObj.stats.headshots + playerObj.stats.bodyshots + playerObj.stats.legshots), 2)).split('.')[1]}%`;
        else headshotPrecentString = 'Unavailable in Deathmatch';
      }
    }

    matches.push(new MessageEmbed()
      .setTitle(`Recent Matches for: ${userName}#${userTag}`)
      .setThumbnail(playerObj.assets.card.small)
      .addFields(
        { name: 'Match Info', value: `**Name:** ${matchRes[i].metadata.map} \n**Date Played:** ${new Date(matchRes[i].metadata.game_start_patched).toLocaleDateString()} \n**Rounds Played:** ${matchRes[i].metadata.rounds_played} \n**Match Length:** ${matchDuration} \n**Mode:** ${matchRes[i].metadata.mode} \n**Match Result:** ${winningTeam === playerObj.team ? 'Win' : 'Loss'}`, inline: true },
        { name: 'Player Stats', value: `**Agent:** ${playerObj.character} \n**Kills:** ${playerObj.stats.kills} \n**Assists:** ${playerObj.stats.assists} \n**Deaths:** ${playerObj.stats.deaths} \n**K/D Ratio:** ${roundTo(playerObj.stats.kills/playerObj.stats.deaths, 2)} \n**Headshot %:** ${headshotPrecentString}`, inline: true }
      )
      .setFooter({ text: `Match ${i + 1} of 5`}));
  }

  await interaction.reply({ embeds: [matchHistoryObj.matches[0]], components: [
    new MessageActionRow().addComponents([
      new MessageButton().setCustomId('matchhistory-previous').setLabel('Previous').setStyle('PRIMARY'),
      new MessageButton().setCustomId('matchhistory-next').setLabel('Next').setStyle('PRIMARY')
    ])
  ]});
}

module.exports = {
  name: "valorantmatchhistory",
  description: "Set your user info for VALORANT",
  type: 1,
  options: [
    {
      name: "name",
      description: "The name of the VALORANT account",
      type: 3,
      required: true,
    },
    {
      name: "tagline",
      description: "The tag of the VALORANT account",
      type: 3,
      required: true,
    },
    {
      name: "region",
      description: "The region of the VALORANT account",
      type: 3,
      choices: [
        {
          name: "North America",
          value: "na",
        },
        {
          name: "Europe",
          value: "eu",
        },
        {
          name: "Latin America",
          value: "na",
        },
        {
          name: "Korea",
          value: "kr",
        },
        {
          name: "Asian-Pacific",
          value: "ap",
        },
        {
          name: "Brazil",
          value: "na",
        },
      ],
      required: true,
    },
    {
      name: 'mode',
      description: 'Filter by mode',
      type: 3,
      choices: [
        {
          name: 'Unrated',
          value: 'unrated'
        },
        {
          name: 'Competitive',
          value: 'competitive'
        },
        {
          name: 'Spike Rush',
          value: 'spike_rush'
        }
      ],
      required: false
    },
    {
      name: 'map',
      description: 'Filter by map',
      type: 3,
      choices: [
        {
          name: 'Haven',
          value: 'haven'
        },
        {
          name: 'Icebox',
          value: 'icebox'
        },
        {
          name: 'Ascent',
          value: 'ascent'
        },
        {
          name: 'Fracture',
          value: 'fracture'
        },
        {
          name: 'Bind',
          value: 'bind'
        },
        {
          name: 'Breeze',
          value: 'breeze'
        },
        {
          name: 'Split',
          value: 'split'
        }
      ]
    }
  ],
  matchHistoryObj,
  run
};
