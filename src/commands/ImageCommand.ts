import { SlashCommand } from "./SlashCommand";
import {
	ChatInputCommandInteraction,
	CommandInteraction,
	SlashCommandAttachmentOption,
	SlashCommandBuilder,
	SlashCommandStringOption
} from "discord.js";
import { EditImage } from "../utils/EditImage";
import { CommandUtils } from "../utils/CommandUtils";

export abstract class ImageCommand extends SlashCommand {
	protected constructor(data: SlashCommandBuilder) {
		data.addAttachmentOption(
			new SlashCommandAttachmentOption()
				.setName("image")
				.setDescription("The image to put the text on.")
				.setRequired(false)
		);
		data.addStringOption(
			new SlashCommandStringOption()
				.setName("url")
				.setDescription("The url of the image to put the text on.")
				.setRequired(false)
		);
		super(data);
	}

	public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		try {
			await interaction.deferReply();
			const editImage: EditImage = await CommandUtils.processImageCommand(interaction);
			this.manipulate(editImage);
		} catch (e) {
			console.log(e);
			await interaction.followUp({ content: "**Error:** " + e.message, ephemeral: true });
		}
	}

	abstract manipulate(image: EditImage);
}
