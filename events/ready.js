module.exports = {
    name: "ready",
    run: async (bot, client) => {
        console.log("Logged in as " + bot.client.user.tag)
}}