// * DONE

const { SlashCommandBuilder } = require("discord.js");
const axios = require("axios");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("timer_pt2")
    .setDescription("Creates a timer.")
    .addNumberOption((option) =>
      option
        .setName("hours")
        .setDescription("Number of hours")
        .setRequired(true)
        .setMinValue(0)
    )
    .addNumberOption((option) =>
      option
        .setName("minutes")
        .setDescription("Number of minutes")
        .setRequired(true)
        .setMinValue(0)
    )
    .addNumberOption((option) =>
      option
        .setName("seconds")
        .setDescription("Number of seconds")
        .setRequired(true)
        .setMinValue(0)
    ),

  async execute(interaction) {
    // Get the number of hours, minutes, and seconds from the options
    const hours = interaction.options.getNumber("hours");
    const minutes = interaction.options.getNumber("minutes");
    const seconds = interaction.options.getNumber("seconds");

    // Calculate the total number of seconds
    let totalSeconds = hours * 3600 + minutes * 60 + seconds;

    // Create a new timer object
    const timer = {
      name: interaction.user.id,
      channel: interaction.channel.id,
      endTime: Date.now() + totalSeconds * 1000,
    };

    // Make GET request to get all timers in the server
    try {
      const response = await axios.get(
        `https://expressjs-mongoose-production-4c38.up.railway.app/timers/`
      );
      const timers = response.data;
      // Use filter method to get all timers with channel id equal to current channel ID
      const existingTimers = timers.filter(
        (timer) => timer.channel === timer.channel
      );

      if (existingTimers.length > 0) {
        // If there is an existing timer, delete it
        await axios.delete(
          `https://expressjs-mongoose-production-4c38.up.railway.app/timers/${timer.channel}`
        );
        console.log("Existing timer deleted.");
      }
    } catch (error) {
      console.log("Failed to get timers from server.");
    }

    // Upload the timer to the server
    try {
      const response = await axios.post(
        "https://expressjs-mongoose-production-4c38.up.railway.app/timers/",
        timer
      );

      console.log(
        `Timer has been uploaded to the server with id: ${response.data._id}`
      );
    } catch (error) {
      console.log("Upload timer to the server failed");
    }

    // Start the timer
    await interaction.deferReply({ fetchReply: true });
    await interaction.editReply("Timer was created!");

    const timerReply = await interaction.followUp(
      `${hours ? hours + (hours > 1 ? " hours " : " hour ") : ""}` +
        `${minutes ? minutes + (minutes > 1 ? " minutes " : " minute ") : ""}` +
        `${
          seconds ? seconds + (seconds > 1 ? " seconds" : " second ") : ""
        } remaining!`
    );

    // runs a callback method, calls after a set amount of time
    const timeInterval = setInterval(async () => {
      totalSeconds -= 1;
      if (totalSeconds <= 0) {
        await timerReply.edit({
          content: "Time's up!",
          fetchReply: true,
        });
        clearInterval(timeInterval);

        // Delete the timer from the server
        try {
          await axios.delete(
            `https://expressjs-mongoose-production-4c38.up.railway.app/timers/${timer.channel}`
          );
          console.log("Timer has been deleted from the server!");
        } catch (error) {
          console.log("Failed to delete timer from server.");
        }
        return;
      }
      // update timer

      let hours = Math.floor(totalSeconds / 3600);
      let minutes = Math.floor((totalSeconds % 3600) / 60);
      let seconds = totalSeconds % 60;

      await timerReply.edit({
        content:
          `${hours ? hours + (hours > 1 ? " hours " : " hour ") : ""}` +
          `${
            minutes ? minutes + (minutes > 1 ? " minutes " : " minute ") : ""
          }` +
          `${
            seconds ? seconds + (seconds > 1 ? " seconds" : " second ") : ""
          } remaining!`,
        fetchReply: true,
      });
    }, 1000);
  },
};
