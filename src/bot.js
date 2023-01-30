const { Client, GatewayIntentBits, Collection } = require("discord.js");
const fs = require("fs");
require("dotenv").config();

// get the environment variables from the .env file
const { BOT_TOKEN } = process.env;

const client = new Client({ intents: GatewayIntentBits.Guilds });

// data structure to store the commands that we need
client.commandArray = [];

client.commands = new Collection();

const functionsFolder = fs.readdirSync("./src/functions");

for (const folder of functionsFolder) {
  const files = fs
    .readdirSync(`./src/functions/${folder}`)
    .filter((file) => file.endsWith(".js"));

  for (const file of files) {
    require(`./functions/${folder}/${file}`)(client);
  }
}

client.handleCommands();
client.handleEvents();

client.login(BOT_TOKEN);
