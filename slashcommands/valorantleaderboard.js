const valAPI = require('unofficial-valorant-api');
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { regionStringConverter } = require('../util/functions');

var leaderboardEmbeds = [];
var slashcommandId;
var leaderboardObj = {
  leaderboardEmbeds,
  slashcommandId
}

const run = async (client, interaction) => {
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

module.exports = {
  name: "valorantleaderboard",
  description: "Get the first 100 players on the leaderboard for a region, or a single player on the leaderboard",
  type: 1,
  options: [
    {
      name: "region",
      description: "The region's leaderboard you are requesting",
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
      name: "name",
      description: "The name of the player on the leaderboard (case-sensitive)",
      type: 3,
      required: false,
    },
    {
      name: "tagline",
      description: "The tagline of the player on the leaderboard",
      type: 3,
      required: false,
    },
  ],
  leaderboardObj,
  run
};
