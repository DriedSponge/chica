import { Canvas, CanvasRenderingContext2D } from "canvas";
import { SlashCommandBuilder, SlashCommandStringOption } from "discord.js";
import { StringUtils } from "../../utils/StringUtils";
import { EditImage } from "../../utils/EditImage";
import { ImageCommand } from "../ImageCommand";
import * as sharp from "sharp";
import EmbedUtils from "../../utils/EmbedUtils";
import { Sharp } from "sharp";
import { SourceImage } from "../../utils/SourceImage";
export class Meme extends ImageCommand {
	constructor() {
		const data: SlashCommandBuilder = new SlashCommandBuilder();
		data.setName("meme");
		data.setDescription("Put meme text on an image.");
		data.addStringOption(
			new SlashCommandStringOption()
				.setMaxLength(100)
				.setName("text")
				.setDescription("The text to put on the image. Use **|** to separate top and bottom text.")
				.setRequired(true)
		);
		super(data);
	}

	public async manipulate(image: SourceImage): Promise<void> {
		const text: string = this.interaction.options.getString("text", true);
		const processedImage: Sharp = image.getSharpInstance();
		const fontSize: number = Math.min(image.getWidth(), image.getHeight()) / 8;
		const canvas = new Canvas(image.getWidth(), image.getHeight());
		const ctx = canvas.getContext("2d");
		ctx.font = `${fontSize}px Impact`;
		const lines = StringUtils.wrapText(ctx, text, image.getWidth());
		// Generate the overlay text
		this.memeText(canvas, text, fontSize);
		const compiledImage: Buffer = await processedImage
			.composite([{ input: await canvas.toBuffer(), tile: true, gravity: "northwest" }])
			.toBuffer();
		const embed = EmbedUtils.gifEmbed(
			image.getWidth(),
			image.getHeight(),
			image.getFrameCount(),
			(Date.now() - this.interaction.createdTimestamp) / 1000,
			"attachment://meme." + image.getExtension()
		);
		await this.interaction.followUp({
			files: [
				{
					attachment: compiledImage,
					name: "meme." + image.getExtension()
				}
			],
			embeds: [embed]
		});
	}
	private memeText(canvas: Canvas, text: string, fontSize: number): void {
		let ctx: CanvasRenderingContext2D = canvas.getContext("2d");
		ctx.font = `bold ${fontSize.toString()}px Impact`;
		ctx.strokeStyle = "#000000";
		ctx.lineWidth = fontSize / 30;
		ctx.fillStyle = "#ffffff";
		ctx.textAlign = "center";
		ctx.textBaseline = "top";

		const lines: string[] = text.split("|");
		const topText: string = lines[0].trim();

		// Bottom Text Stuff
		if (lines.length > 1) {
			const bottomText: string = lines[1].trim();
			const bottomTextHeight: number = ctx.measureText(bottomText).actualBoundingBoxDescent;
			const bottomLines: string[] = StringUtils.wrapText(ctx, bottomText, canvas.width);
			for (let i: number = 0; i < bottomLines.length; i++) {
				ctx.fillText(
					bottomLines[i],
					canvas.width / 2,
					canvas.height - 10 - bottomTextHeight - i * fontSize,
					canvas.width
				);
				ctx.strokeText(
					bottomLines[i],
					canvas.width / 2,
					canvas.height - 10 - bottomTextHeight - i * fontSize,
					canvas.width
				);
			}
		}

		const topLines: string[] = StringUtils.wrapText(ctx, topText, canvas.width);
		for (let i: number = 0; i < topLines.length; i++) {
			ctx.fillText(topLines[i], canvas.width / 2, i * fontSize + 10, canvas.width);
			ctx.strokeText(topLines[i], canvas.width / 2, i * fontSize + 10, canvas.width);
		}
	}
}
