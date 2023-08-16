import { Canvas, CanvasRenderingContext2D, createCanvas, Image, loadImage } from "canvas";
import { EmbedBuilder, SlashCommandBuilder, SlashCommandStringOption } from "discord.js";
import { StringUtils } from "../../utils/StringUtils";
import EmbedUtils from "../../utils/EmbedUtils";
import { ImageCommand } from "../ImageCommand";
import { SourceImage } from "../../utils/SourceImage";
import * as sharp from "sharp";
import { Sharp } from "sharp";
export class Caption extends ImageCommand {
	constructor() {
		const data: SlashCommandBuilder = new SlashCommandBuilder();
		data.setName("caption");
		data.setDescription("Add a caption to a image.");
		data.addStringOption(
			new SlashCommandStringOption()
				.setMaxLength(100)
				.setName("text")
				.setDescription("The text to put on the image.")
				.setRequired(true)
		);
		super(data);
	}

	public async manipulate(editImage: SourceImage): Promise<void> {
		const text: string = this.interaction.options.getString("text", true);
		const fontSize: number = Math.min(editImage.getWidth(), editImage.getHeight()) / 10;
		const tempCanvas: Canvas = new Canvas(editImage.getWidth(), editImage.getHeight());
		const tempCtx: CanvasRenderingContext2D = tempCanvas.getContext("2d");
		tempCtx.font = `bold ${fontSize.toString()}px Caption`;

		const lines: string[] = StringUtils.wrapText(
			tempCtx,
			text,
			tempCanvas.width - tempCanvas.width / 9
		);

		const yMargin: number = Math.round(tempCtx.measureText(lines[0]).actualBoundingBoxAscent * 1.7);
		const textHeight: number = Math.round(
			tempCtx.measureText(lines[0]).actualBoundingBoxAscent * (lines.length + 1) + yMargin
		);
		const height: number = textHeight + editImage.getHeight();

		const captionBackdrop: Sharp = editImage
			.getSharpInstance()
			.extend({ top: textHeight, background: { r: 255, g: 255, b: 255 } });
		const textCanvas: Canvas = new Canvas(editImage.getWidth(), height);
		const ctx: CanvasRenderingContext2D = textCanvas.getContext("2d");
		ctx.textBaseline = "top";
		ctx.textAlign = "center";
		ctx.font = `s${fontSize.toString()}px Caption`;
		ctx.fillStyle = "#000000";
		this.captionText(textCanvas, lines, fontSize, yMargin);
		//const textPng: Sharp = sharp(textCanvas.toBuffer("image/png")).png();
		captionBackdrop.composite([
			{
				input: await textCanvas.toBuffer(),
				tile: true,
				gravity: "northwest"
			}
		]);
		const embed: EmbedBuilder = EmbedUtils.gifEmbed(
			editImage.getWidth(),
			height,
			editImage.getFrameCount(),
			(Date.now() - this.interaction.createdTimestamp) / 1000,
			"attachment://caption." + editImage.getExtension()
		);
		await this.interaction.followUp({
			files: [
				{
					attachment: await editImage.toInputFormat(captionBackdrop).toBuffer(),
					name: "caption." + editImage.getExtension()
				}
			],
			embeds: [embed]
		});
	}

	private captionText(canvas: Canvas, lines: string[], fontSize: number, yMargin: number): void {
		let ctx: CanvasRenderingContext2D = canvas.getContext("2d");
		for (let i: number = 0; i < lines.length; i++) {
			ctx.fillText(lines[i], canvas.width / 2, i * fontSize + yMargin / 2, canvas.width);
		}
	}
}
