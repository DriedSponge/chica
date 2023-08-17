import { SlashCommandBuilder } from "discord.js";
import { ImageCommand } from "../ImageCommand";
import { SourceImage } from "../../utils/SourceImage";
import EmbedUtils from "../../utils/EmbedUtils";
export class Flop extends ImageCommand {
	constructor() {
		const data: SlashCommandBuilder = new SlashCommandBuilder();
		data.setName("flop");
		data.setDescription("Flop an image. (Mirror it horizontally)");
		super(data);
	}

	public async manipulate(image: SourceImage): Promise<void> {
		const embed = EmbedUtils.gifEmbed(
			image.getWidth(),
			image.getHeight(),
			image.getFrameCount(),
			(Date.now() - this.interaction.createdTimestamp) / 1000,
			"attachment://flip." + image.getExtension()
		);
		await this.interaction.followUp({
			files: [
				{
					attachment: await image.getSharpInstance().flop().toBuffer(),
					name: "flip." + image.getExtension()
				}
			],
			embeds: [embed]
		});
	}
}
