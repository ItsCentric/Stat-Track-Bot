const valAPI = require("unofficial-valorant-api");
const { MessageEmbed } = require("discord.js");
const ValorantUserInfo = require('../models/valorantuserinfo');

const run = async (client, interaction) => {
    let userName, userTag, userRegion;
    let mmrRes;
    let mmrChange;

    if (interaction.options.getSubcommand('valorantmmr') === 'currentaccount') {
        const currentUser = await ValorantUserInfo.findOne({ discordUserId: interaction.user.id });
        userName = currentUser.name;
        userTag = currentUser.tagline;
        userRegion = currentUser.region;
      }
      else {
        userName = interaction.options.getString('name');
        userTag = interaction.options.getString('tagline');
        userRegion = interaction.options.getString('region'); 
      }

    await valAPI.getMMR('v2', userRegion, userName, userTag)
      .then(response => mmrRes = response.data)
      .catch(async (err) => {
          console.log(err);
          await interaction.reply('Something went wrong, please try again');
      });

    if (mmrRes.current_data.mmr_change_to_last_game > 0) mmrChange = `+${mmrRes.current_data.mmr_change_to_last_game}`;

    const MMR = new MessageEmbed()
      .setTitle(`MMR Stats for ${mmrRes.name}#${mmrRes.tag}`)
      .setDescription(`**Rank:** ${mmrRes.current_data.currenttierpatched} \n**Tier Rank:** ${mmrRes.current_data.ranking_in_tier} \n**Recent MMR Change:** ${mmrChange} \n**Elo:** ${mmrRes.current_data.elo}`)

    await interaction.reply({ embeds: [MMR] });
};

module.exports = {
  name: "valorantmmr",
  description: "Get MMR stats for a VALORANT account",
  options: [
    {
      name: "currentaccount",
      description: "Get MMR stats for the current account",
      type: 1,
    },
    {
      name: "anotheraccount",
      description: "Get MMR stats for another account",
      type: 1,
      options: [
        {
          name: "name",
          description: "Name of the account",
          type: 3,
          required: true,
        },
        {
          name: "tagline",
          description: "Tagline of the account",
          type: 3,
          required: true,
        },
        {
          name: "region",
          description: "The region of the account",
          type: 3,
          required: true,
        },
      ],
    },
  ],
  run
};
