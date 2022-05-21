const valAPI = require('unofficial-valorant-api');
const { MessageEmbed } = require("discord.js");

const run = async (client, interaction) => {
  userName = interaction.options.getString('name');
  userTag = interaction.options.getString('tagline');
  userRegion = interaction.options.getString('region');
  let userInfoRes, userRankRes;

  await valAPI.getAccount(userName, userTag).then(response => userInfoRes = response.data);
  await valAPI.getMMR('v2', userRegion, userName, userTag).then(response => userRankRes = response.data);

  const VALACCOUNTINFO = new MessageEmbed()
    .setTitle(`${userInfoRes.name}#${userInfoRes.tag}`)
    .setThumbnail(userInfoRes.card.small)
    .addFields(
      { name: 'Account Level', value: `${userInfoRes.account_level}`, inline: true },
      { name: 'Region', value: (userInfoRes.region).toUpperCase(), inline: true },
      { name: 'Rank', value: userRankRes.current_data.currenttierpatched, inline: true },
      { name: 'Elo', value: `${userRankRes.current_data.elo}`, inline: true }
    )

  await interaction.reply({ embeds: [VALACCOUNTINFO] });
}

module.exports = {
  name: "valorantaccountinfo",
  description: "Get info about a VALORANT account",
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
  ],
  run
};
