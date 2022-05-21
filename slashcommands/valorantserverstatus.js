const valAPI = require('unofficial-valorant-api');
const { MessageEmbed } = require("discord.js");
const { regionStringConverter } = require('../util/functions');

const run = async (client, interaction) => {
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

module.exports = {
  name: "valorantserverstatus",
  description: "Get the server status for the specified region",
  type: 1,
  options: [
    {
      name: "region",
      description: "The region you want the server status for",
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
