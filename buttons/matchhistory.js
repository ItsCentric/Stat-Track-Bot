const { matchHistoryObj } = require('../slashcommands/valorantmatchhistory');

var page = 0;

module.exports = {
  name: 'matchhistory',
  run: async (bot, interaction, parameters) => {

    if (parameters[0] === 'next') {
      page++;
      if (page === 5) {
        page = 0;
        await interaction.update({ embeds: [matchHistoryObj.matches[page]] });
      }
      else if (page < 5) {
        await interaction.update({ embeds: [matchHistoryObj.matches[page]] });
      }
    }
    else if (parameters[0] === 'previous') {
      page--;
      if (page < 0) {
        page = 4;
        await interaction.update({ embeds: [matchHistoryObj.matches[page]] });
      }
      else if (page >= 0) {
        await interaction.update({ embeds: [matchHistoryObj.matches[page]] });
      }
    }
  }
}