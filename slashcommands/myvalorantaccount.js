const ValorantUserInfo = require('../models/valorantuserinfo');
const valAPI = require('unofficial-valorant-api');
const { MessageEmbed } = require("discord.js");


const run = async (client, interaction) => {
  let currentUser = await ValorantUserInfo.findOne({ discordUserId: interaction.user.id });
  let userInfoRes, userRankRes;

  await valAPI.getAccount(currentUser.name, currentUser.tagline).then(response => userInfoRes = response.data);
  await valAPI.getMMR('v2', currentUser.region, currentUser.name, currentUser.tagline).then(response => userRankRes = response.data);

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
  name: "myvalorantaccount",
  description: "Get the current account",
  type: 1,
  run
};
