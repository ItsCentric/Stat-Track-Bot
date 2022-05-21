const valAPI = require('unofficial-valorant-api');
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const ValorantUserInfo = require('../models/valorantuserinfo')
const { convertDuration, roundTo, regionStringConverter } = require('../util/functions');
// const { SlashCommandBuilder } = require('@discordjs/builders');
var matches, leaderboardEmbeds = [];
var slashcommandId;

var matchHistoryObj = {
  matches,
  slashcommandId
};
var leaderboardObj = {
  leaderboardEmbeds,
  slashcommandId
}

const run = async (client, interaction) => {
  const subcommand = interaction.options.getSubcommand('valorant');
  matchHistoryObj.slashcommandId = interaction.id;
  
  switch (subcommand) {
    case 'userinfo':
      UserInfo(interaction);
      break;
    case 'setuserinfo':
      SetUserInfo(interaction);
      break;
    case 'matchhistory':
      MatchHistory(interaction);
      break;
    case 'myaccount':
      GetCurrentAccount(interaction);
      break;
    case 'serverstatus':
      getServerStatus(interaction);
      break;
    case 'leaderboard':
      leaderboard(interaction);
      break;
  }

}

async function UserInfo(interaction) {
  userName = interaction.options.getString('name');
  userTag = interaction.options.getString('tagline');
  userRegion = interaction.options.getString('region');
  let userInfoRes, userRankRes;

  await valAPI.getAccount(userName, userTag).then(response => userInfoRes = response.data);
  await valAPI.getMMR('v2', userRegion, userName, userTag).then(response => userRankRes = response.data);

  const VALUSERINFO = new MessageEmbed()
    .setTitle(`${userInfoRes.name}#${userInfoRes.tag}`)
    .setThumbnail(userInfoRes.card.small)
    .addFields(
      { name: 'Account Level', value: `${userInfoRes.account_level}`, inline: true },
      { name: 'Region', value: (userInfoRes.region).toUpperCase(), inline: true },
      { name: 'Rank', value: userRankRes.current_data.currenttierpatched, inline: true },
      { name: 'Elo', value: `${userRankRes.current_data.elo}`, inline: true }
    )

  await interaction.reply({ embeds: [VALUSERINFO] });
}

function SetUserInfo(interaction) {
  userName = interaction.options.getString('name');
  userTag = interaction.options.getString('tagline');
  userRegion = interaction.options.getString('region');

  const newUser = new ValorantUserInfo({
    discordUserId: interaction.user.id,
    name: userName,
    tagline: userTag,
    region: userRegion
  });

  newUser.save()
    .then(async () => {
      await interaction.reply('User information successfully saved!')
    })
    .catch(async (err) => {
      console.log(err);
      await interaction.reply('Something went wrong, please try again')
    });
}

async function MatchHistory(interaction) {
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

async function GetCurrentAccount(interaction) {
  let currentUser = await ValorantUserInfo.findOne({ discordUserId: interaction.user.id });
  let userInfoRes, userRankRes;

  await valAPI.getAccount(currentUser.name, currentUser.tagline).then(response => userInfoRes = response.data);
  await valAPI.getMMR('v2', currentUser.region, currentUser.name, currentUser.tagline).then(response => userRankRes = response.data);

  const VALUSERINFO = new MessageEmbed()
    .setTitle(`${userInfoRes.name}#${userInfoRes.tag}`)
    .setThumbnail(userInfoRes.card.small)
    .addFields(
      { name: 'Account Level', value: `${userInfoRes.account_level}`, inline: true },
      { name: 'Region', value: (userInfoRes.region).toUpperCase(), inline: true },
      { name: 'Rank', value: userRankRes.current_data.currenttierpatched, inline: true },
      { name: 'Elo', value: `${userRankRes.current_data.elo}`, inline: true }
    )

  await interaction.reply({ embeds: [VALUSERINFO] })
}

async function getServerStatus(interaction) {
  let statusRes;
  let regionString;

  regionStringConverter(interaction.options.getString('region', regionString));
  await valAPI.getStatus(interaction.options.getString('region'))
  .then(response => statusRes = response.data)
  .catch(async (err) => {
    console.error(err);
    await interaction.reply('Something went wrong, please try again');
    return;
  });
  
  if (statusRes.maintenances.length === 0 && statusRes.incidents.length === 0) await interaction.reply(`All servers are operational for ${regionString}`)
  else {
    const STATUS = new MessageEmbed()
      .setTitle(`Server Status for ${regionString}`)
      .addFields(
        { name: 'Maintenance', value: statusRes.maintenances[0].updates[0].translations[0].content, inline: true },
        { name: 'Incident', value: statusRes.incidents[0].updates[0].translations[0].content, inline: true }
      )

    await interaction.reply({ embeds: [STATUS] });
  }
}

async function leaderboard(interaction) {
  let leaderboardRes;
  let previousNextButtons;
  let region = interaction.options.getString('region');

  if (interaction.options._hoistedOptions.length === 1) {
    let startRange = 0, endRange = 10;
    let regionString;

    regionString = regionStringConverter(region);
    await valAPI.getLeaderboard(region)
      .then(response => leaderboardRes = response.data)
      .catch(async (err) => {
        console.log(err);
        await interaction.reply('Something went wrong, please try again');
        return;
      });

    for (i = 0; i < 10; i++) {
      let tenPlayers = leaderboardRes.slice(startRange, endRange);
      let leaderboardString = '';
      for (j = 0; j < tenPlayers.length; j++) {
        leaderboardString += `${tenPlayers[j].leaderboardRank}.) ${tenPlayers[j].IsAnonymized ? '**Secret Agent#ANON**' : `**${tenPlayers[j].gameName}#${tenPlayers[j].tagLine}**`} - ${tenPlayers[j].numberOfWins} wins - ${tenPlayers[j].rankedRating}RR \n`
      }
      leaderboardEmbeds.push(new MessageEmbed()
        .setTitle(`Leaderboard for ${regionString}`)
        .setDescription(leaderboardString)
      );

      previousNextButtons = new MessageActionRow().addComponents([
        new MessageButton().setCustomId('leaderboard-previous').setLabel('Previous').setStyle('PRIMARY'),
        new MessageButton().setCustomId('leaderboard-next').setLabel('Next').setStyle('PRIMARY')
      ]);

      startRange = endRange;
      endRange += 10;
    }
    await interaction.reply({ embeds: [leaderboardEmbeds[0]], components: [previousNextButtons] });
  }
  else if (interaction.options._hoistedOptions.length === 3) {
    let playerName = interaction.options.getString('name');
    let playerTag = interaction.options.getString('tagline');

    await valAPI.getLeaderboard(region, playerName, playerTag)
      .then(async (response) => {
        if (response.status === 200) leaderboardRes = response.data.data[0];
        else await interaction.reply(`Could not find player "${playerName}#${playerTag}" on the leaderboard`);
      })
      .catch(async (err) => {
        console.log(err);
        await interaction.reply('Something went wrong, please try again');
      });

    const PLAYERSTANDING = new MessageEmbed()
      .setTitle(`Leaderboard Standing for ${leaderboardRes.gameName}`)
      .addFields(
        { name: 'Leaderboard Rank', value: String(leaderboardRes.leaderboardRank), inline: true },
        { name: 'Wins', value: String(leaderboardRes.numberOfWins), inline: true },
        { name: 'Ranked Rating', value: String(leaderboardRes.rankedRating), inline: true }
      )
    await interaction.reply({ embeds: [PLAYERSTANDING] });
  }
  else interaction.reply('`name` and `tagline` arguments are a pair, if you fill one out you must fill out the other!');

}

const regionChoices = [
  {
    name: 'North America',
    value: 'na'
  },
  {
    name: 'Europe',
    value: 'eu'
  },
  {
    name: 'Latin America',
    value: 'na'
  },
  {
    name: 'Korea',
    value: 'kr'
  },
  {
    name: 'Asian-Pacific',
    value: 'ap'
  },
  {
    name: 'Brazil',
    value: 'na'
  }
]

module.exports = {
  name: 'valorant',
  description: 'All VALORANT commands',
  options: [
    {
      name: 'userinfo',
      description: 'Get info about a VALORANT account',
      type: 1,
      options: [
        {
          name: 'name',
          description: 'The name of the VALORANT account',
          type: 3,
          required: true
        },
        {
          name: 'tagline',
          description: 'The tag of the VALORANT account',
          type: 3,
          required: true
        },
        {
          name: 'region',
          description: 'The region of the VALORANT account',
          type: 3,
          choices: regionChoices,
          required: true
        }
      ]
    },
    {
      name: 'setuserinfo',
      description: 'Set your user info for VALORANT',
      type: 1,
      options: [
        {
          name: 'name',
          description: 'The name of the VALORANT account',
          type: 3,
          required: true
        },
        {
          name: 'tagline',
          description: 'The tag of the VALORANT account',
          type: 3,
          required: true
        },
        {
          name: 'region',
          description: 'The region of the VALORANT account',
          type: 3,
          choices: regionChoices,
          required: true
        }
      ]
    },
    {
      name: 'matchhistory',
      description: 'Gets the 5 most recent matches for an account',
      type: 1,
      options: [
        {
          name: 'name',
          description: 'The name of the account',
          type: 3,
          required: false
        },
        {
          name: 'tagline',
          description: 'The tag of the VALORANT account',
          type: 3,
          required: false
        },
        {
          name: 'region',
          description: 'The region of the VALORANT account',
          type: 3,
          choices: regionChoices,
          required: false
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
      ]
    },
    {
      name: 'myaccount',
      description: 'Get the current account',
      type: 1
    },
    {
      name: 'serverstatus',
      description: 'Get the server status for the specified region',
      type: 1,
      options: [
        {
          name: 'region',
          description: 'The region you want the server status for',
          type: 3,
          choices: [
            {
              name: 'North America',
              value: 'na'
            },
            {
              name: 'Europe',
              value: 'eu'
            },
            {
              name: 'Korea',
              value: 'kr'
            },
            {
              name: 'Asian-Pacific',
              value: 'ap'
            }
          ],
          required: true
        }
      ]
    },
    {
      name: 'leaderboard',
      description: 'Get the first 100 players on the leaderboard for a region, or a single player on the leaderboard',
      type: 1,
      options: [
        {
          name: 'region',
          description: 'The region\'s leaderboard you are requesting',
          type: 3,
          choices: regionChoices,
          required: true
        },
        {
          name: 'name',
          description: 'The name of the player on the leaderboard (case-sensitive)',
          type: 3,
          required: false
        },
        {
          name: 'tagline',
          description: 'The tagline of the player on the leaderboard',
          type: 3,
          required: false
        }
      ]
    }
  ],
  run,
  matchHistoryObj,
  leaderboardObj
}

// module.exports = {
//   data: new SlashCommandBuilder()
//     .setName('valorant')
//     .setDescription('All VALORANT commands')
//     .addSubcommand(subcommand =>
//       subcommand
//         .setName('userinfo')
//         .setDescription('Get info about a VALORANT user account')
//         .addStringOption(option => option.setName('name').setDescription('The name of the VALORANT account').setRequired(true))
//         .addStringOption(option => option.setName('tagline').setDescription('The tag of the VALORANT account').setRequired(true))
//     ),
//   run: async (client, interaction) => {
//     console.log('userinfo command ran')
//     userName = interaction.options.getString('name');
//     userTag = interaction.options.getString('tagline')
//     valAPI.getAccount(userName, userTag)
//       .then(async (response) => {
//         await interaction.reply(userInfoRes.name)
//       })
//   }
// }