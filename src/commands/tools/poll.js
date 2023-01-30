const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("poll")
    .setDescription("Create a poll")
    .addStringOption((option) =>
      option
        .setName("question")
        .setDescription("The question for the poll")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("options")
        .setDescription("The options for the poll")
        .setRequired(true)
    )
    .addNumberOption((option) =>
      option
        .setName("time")
        .setDescription("minutes")
        .setRequired(true)
        .setMinValue(0)
    ),

  async execute(interaction) {
    await interaction.deferReply({ fetchReply: true });
    await interaction.editReply("Poll created!\n-------------\n");

    let question = interaction.options.getString("question");
    let options = interaction.options.getString("options").split(",");
    const minutes = interaction.options.getNumber("time");

    let pollMessage = await interaction.channel.send(
      `**${question}**\n${options.map((o, i) => `${i + 1}. ${o}`).join("\n")}`
    );

    for (let i = 0; i < options.length; i++) {
      await pollMessage.react(`${i + 1}️⃣`);
    }

    let duration = minutes * 60 * 1000;
    // displays timer
    let timer = setInterval(async function () {
      let minutes = Math.floor(duration / 60000);
      let seconds = ((duration % 60000) / 1000).toFixed(0);
      await pollMessage.edit(
        `**${question}**\n${options
          .map((o, i) => `${i + 1}. ${o}`)
          .join("\n")}\n\nTime remaining: ${minutes}:${
          seconds < 10 ? "0" : ""
        }${seconds}`
      );
      duration -= 1000;
      if (duration < 0) {
        clearInterval(timer);
      }
    }, 1000);

    setTimeout(async function () {
      await pollMessage.edit("Tallying results!");
      let results = [];
      for (let i = 0; i < options.length; i++) {
        let reaction = pollMessage.reactions.cache.find(
          (r) => r.emoji.name === `${i + 1}️⃣`
        );
        await reaction.fetch();

        if (reaction.count - 1 > 1) {
          results.push(`${options[i]}: ${reaction.count - 1} votes`);
        } else if (reaction.count - 1 === 1) {
          results.push(`${options[i]}: ${reaction.count - 1} vote`);
        } else {
          results.push(`${options[i]}: 0`);
        }
      }
      pollMessage.reactions.removeAll();
      let sortedResults = [];
      while (results.length > 0) {
        let highest = 0;
        let highestIndex = 0;
        for (let i = 0; i < results.length; i++) {
          let current = parseInt(results[i].split(": ")[1]);
          if (current > highest) {
            highest = current;
            highestIndex = i;
          }
        }
        sortedResults.push(results[highestIndex]);
        results.splice(highestIndex, 1);
      }

      let resultsString = sortedResults.join("\n");
      await pollMessage.edit(`**Results for: ${question}**\n${resultsString}`);
      interaction.user
        .send(`Poll results for **${question}**:\n${resultsString}`)
        .catch(console.error);
    }, duration);
  },
};
