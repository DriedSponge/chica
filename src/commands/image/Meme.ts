import { SlashCommand } from "../SlashCommand";
import { GifFrame, GifUtil, GifCodec, Gif, BitmapImage } from "gifwrap";
import axios from "axios";
import {
	Canvas,
	CanvasRenderingContext2D,
	createCanvas,
	Image,
	loadImage,
	registerFont
} from "canvas";
import {
	Attachment,
	ChatInputCommandInteraction,
	CommandInteraction,
	EmbedBuilder,
	SlashCommandAttachmentOption,
	SlashCommandBuilder,
	SlashCommandStringOption
} from "discord.js";
import { StringUtils } from "../../utils/StringUtils";
import { CommandUtils } from "../../utils/CommandUtils";
import { EditImage } from "../../utils/EditImage";
import EmbedUtils from "../../utils/EmbedUtils";
export class Meme extends SlashCommand {
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

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		const text: string = interaction.options.getString("text", true);
		try {
			await interaction.deferReply();
			const editImage: EditImage = await CommandUtils.processImageCommand(interaction);
			const image: Image = await loadImage(editImage.getData());
			const fontSize: number = Math.min(image.width, image.height) / 8;
			const canvas: Canvas = createCanvas(image.width, image.height);
			const ctx: CanvasRenderingContext2D = canvas.getContext("2d");
			// Check if the image is static
			if (editImage.isStatic()) {
				ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
				this.memeText(canvas, text, fontSize);
				const buffer: Buffer = canvas.toBuffer();

				await interaction.followUp({
					files: [{ attachment: buffer, name: "meme." + editImage.getExtension() }]
				});
			} else {
				// If the image is a gif, we need to process each frame
				let gifBuffer: Buffer = editImage.getData();
				const gif: Gif = await GifUtil.read(gifBuffer);
				let i: number = 0;
				for (const frame of gif.frames) {
					i++;
					console.log(`[${i}/${gif.frames.length}] Processing Gift Frame`);
					// Create a canvas for the gif frame
					const gifCanvas: Canvas = createCanvas(canvas.width, canvas.height);
					// Get the context of the canvas
					const gifCtx: CanvasRenderingContext2D = gifCanvas.getContext("2d");
					// Get the image data from the frame
					const frameImage: Buffer = frame.bitmap.data;
					// Create an image data object from the frame
					const frameImageData: ImageData = <ImageData>(
						ctx.createImageData(frame.bitmap.width, frame.bitmap.height)
					);
					// Set the image data to the frame image
					frameImageData.data.set(frameImage);
					// Put the image data on the gif canvas
					gifCtx.putImageData(frameImageData, frame.xOffset, frame.yOffset);
					// Clear the main canvas
					ctx.clearRect(0, 0, canvas.width, canvas.height);
					// Draw the gif frame on the main canvas
					ctx.drawImage(
						gifCanvas,
						frame.xOffset,
						frame.yOffset,
						frame.bitmap.width,
						frame.bitmap.height
					);
					// Put the text on the main canvas
					this.memeText(canvas, text, fontSize);
					// Get the image data from the main canvas
					const modifiedFrameImage: ImageData = <ImageData>(
						ctx.getImageData(frame.xOffset, frame.yOffset, frame.bitmap.width, frame.bitmap.height)
					);
					// Create a buffer for the image data
					const modifiedFrameBuffer: Buffer = Buffer.alloc(modifiedFrameImage.data.length);
					// Set the buffer to the image data
					modifiedFrameBuffer.set(modifiedFrameImage.data);
					// Create a bitmap image from the buffer
					const frameBitmap: BitmapImage = new BitmapImage(
						frame.bitmap.width,
						frame.bitmap.height,
						modifiedFrameBuffer
					);
					// Quantize the bitmap image
					GifUtil.quantizeSorokin(frameBitmap, 256, undefined, {
						ditherAlgorithm: "FalseFloydSteinberg"
					}); // This is the fastest
					// Set the frame bitmap to the quantized bitmap
					frame.bitmap.data.set(frameBitmap.bitmap.data);
				}
				// Encode the gif
				const codec: GifCodec = new GifCodec();
				const gifBuffer2: Gif = await codec.encodeGif(gif.frames, { loops: gif.loops });
				const embed: EmbedBuilder = EmbedUtils.gifEmbed(
					image.width,
					image.height,
					gif.frames.length,
					(Date.now() - interaction.createdTimestamp) / 1000,
					"attachment://meme." + editImage.getExtension()
				);
				await interaction.followUp({
					files: [{ attachment: gifBuffer2.buffer, name: "meme." + editImage.getExtension() }],
					embeds: [embed]
				});
			}
		} catch (e) {
			console.log(e);
			await interaction.followUp({ content: "**Error:** " + e.message, ephemeral: true });
		}
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
