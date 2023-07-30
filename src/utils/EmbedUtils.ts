import { EmbedBuilder } from "discord.js";

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

	/**
	 * Creates a cool gif embed.
	 * @param width
	 * @param height
	 * @param frames
	 * @param time (in seconds)
	 * @param image
	 */
	public static gifEmbed(
		width: number,
		height: number,
		frames: number,
		time: number,
		image: string
	): EmbedBuilder {
		const embed: EmbedBuilder = new EmbedBuilder();
		embed.setImage(image);
		embed.setColor("#FF69B4");
		embed.setFooter({
			text: `${width}x${height}  | Frames: ${frames} | Time Taken: ${time}s`
		});
		return embed;
	}
}
