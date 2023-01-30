const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("move")
    .setDescription("Move all members from one voice channel to another")
    .addStringOption((option) =>
      option
        .setName("from")
        .setDescription("source channel")
        .setAutocomplete(true)
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("to")
        .setDescription("destination channel")
        .setAutocomplete(true)
        .setRequired(true)
    ),

  async autocomplete(interaction, client = new client()) {
    const focusedOption = interaction.options.getFocused(true);

    let choices = [];

    // get the channels in the server without filtering wheter it is voice or text
    const channels = client.channels.cache.map((channel) => channel.name);

    // iterate channels then if channels !=== to 'Voice Channels' or 'Text Channels' push it to the choices array
    for (const channel of channels) {
      if (channel !== "Voice Channels" && channel !== "Text Channels") {
        choices.push(channel);
      }
    }

    const filtered = choices.filter((choice) =>
      choice.startsWith(focusedOption.value)
    );

    await interaction.respond(
      filtered.map((choice) => ({ name: choice, value: choice }))
    );
  },

  async execute(interaction, client) {
    let sourceChannel = interaction.options.getString("from");
    let destinationChannel = interaction.options.getString("to");

    // Defer the reply
    await interaction.deferReply({ fetchReply: true });
    // Find the old and new voice channels
    const oldChannel = client.channels.cache.find(
      (channel) => channel.name === sourceChannel
    );
    const newChannel = client.channels.cache.find(
      (channel) => channel.name === destinationChannel
    );
    try {
      // Get the members in the old voice channel
      const members = oldChannel.members;

      let memberSize = members.size;

      if (memberSize > 0) {
        // Iterate over each member
        for (const member of members.values()) {
          // Move the member to the new voice channel
          await member.voice.setChannel(newChannel);
        }
        await interaction.editReply(
          `✅  All members have been moved to ${newChannel.name} voice channel`
        );
      } else {
        await interaction.editReply(
          `❌  There are no members in the ${oldChannel.name} voice channel`
        );
        return;
      }
    } catch (error) {
      console.log("Error moving members");
    }
  },
};
