import { SlashCommand } from "./SlashCommand";
import {
	ChatInputCommandInteraction,
	CommandInteraction,
	SlashCommandAttachmentOption,
	SlashCommandBuilder,
	SlashCommandStringOption
} from "discord.js";
import { EditImage } from "../utils/EditImage";
import { SourceImageFactory } from "../utils/SourceImageFactory";
import { SourceImage } from "../utils/SourceImage";

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
			const image: SourceImage = await SourceImageFactory.processImageCommand(interaction);
			this.manipulate(image);
		} catch (e) {
			console.log(e);
			await interaction.followUp({ content: "**Error:** " + e.message, ephemeral: true });
		}
	}

	abstract manipulate(image: SourceImage);
}
