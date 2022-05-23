const ValorantUserInfo = require('../models/valorantuserinfo');

const run = async (client, interaction) => {
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

module.exports = {
  name: "setvalorantinfo",
  description: "Set your account info for VALORANT",
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
