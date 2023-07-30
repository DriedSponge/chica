import { Embed, EmbedBuilder } from "discord.js";

export default class EmbedUtils {
	public static errorEmbed(error: Error): EmbedBuilder {
		return new EmbedBuilder()
			.setColor("#ff0000")
			.setTitle("An Error Occurred!")
			.setDescription(
				"It looks like an error while processing your command! The error message should make sense but if it looks like it's code related, contact the me!"
			)
			.addFields([{ name: "Error Message", value: error.message }]);
	}
}
