const { InteractionType } = require("discord.js");

module.exports = {
  name: "interactionCreate",
  async execute(interaction, client) {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);

      if (!command) return;

      try {
        await command.execute(interaction, client);
      } catch (error) {
        console.log(error);
      }
    } else if (
      interaction.type === InteractionType.ApplicationCommandAutocomplete
    ) {
      const command = client.commands.get(interaction.commandName);

      if (!command) return;

      try {
        await command.autocomplete(interaction, client);
      } catch (error) {
        console.log(error);
      }
    }
  },
};
