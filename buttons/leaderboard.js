const { leaderboardObj } = require('../slashcommands/valorantleaderboard');

var page = 0;

module.exports = {
  name: 'leaderboard',
  run: async (bot, interaction, parameters) => {

    if (parameters[0] === 'next') {
      page++;
      if (page === 10) {
        page = 0;
        await interaction.update({ embeds: [leaderboardObj.leaderboardEmbeds[page]] });
      }
      else if (page < 10) {
        await interaction.update({ embeds: [leaderboardObj.leaderboardEmbeds[page]] });
      }
    }
    else if (parameters[0] === 'previous') {
      page--;
      if (page < 0) {
        page = 9;
        await interaction.update({ embeds: [leaderboardObj.leaderboardEmbeds[page]] });
      }
      else if (page >= 0) {
        await interaction.update({ embeds: [leaderboardObj.leaderboardEmbeds[page]] });
      }
    }
  }
}