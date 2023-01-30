const fs = require("fs");
const { REST, Routes } = require("discord.js");
require("dotenv").config();

module.exports = (client) => {
  client.handleCommands = async () => {
    const commandsFolder = fs.readdirSync("./src/commands");

    for (const folder of commandsFolder) {
      const files = fs
        .readdirSync(`./src/commands/${folder}`)
        .filter((file) => file.endsWith(".js"));

      for (const file of files) {
        const command = require(`../../commands/${folder}/${file}`);
        client.commandArray.push(command.data.toJSON());
        client.commands.set(command.data.name, command);
      }
    }

    const clientID = "1065994820562210916";
    const guildID = "1065331886676770847";

    const rest = new REST({ version: "9" }).setToken(process.env.BOT_TOKEN);

    try {
      console.log("Started refreshing application (/) commands.");

      await rest.put(Routes.applicationGuildCommands(clientID, guildID), {
        body: client.commandArray,
      });

      console.log("Successfully registered discord bot (/) commands.");
    } catch (error) {
      console.error(error);
    }
  };
};
