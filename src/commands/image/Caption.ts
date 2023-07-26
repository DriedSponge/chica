import {SlashCommand} from "../SlashCommand";
import {GifFrame, GifUtil, GifCodec, Gif, BitmapImage} from "gifwrap";
import axios from 'axios';
import {Canvas, CanvasRenderingContext2D, createCanvas, Image, loadImage, registerFont} from "canvas";
import {
    Attachment, ChatInputCommandInteraction,
    CommandInteraction, EmbedBuilder,
    SlashCommandAttachmentOption,
    SlashCommandBuilder,
    SlashCommandStringOption
} from "discord.js";
import {StringUtils} from "../../utils/StringUtils";
import {CommandUtils} from "../../utils/CommandUtils";
import {EditImage} from "../../utils/EditImage";
export class Caption extends SlashCommand{
    constructor() {
        const data : SlashCommandBuilder = new SlashCommandBuilder()
        data.setName("caption")
        data.setDescription("Add a caption to a image.")
        data.addStringOption(new SlashCommandStringOption().setMaxLength(100).setName("text").setDescription("The text to put on the image.").setRequired(true))
        data.addAttachmentOption(new SlashCommandAttachmentOption().setName("image").setDescription("The image to put the text on.").setRequired(false))
        data.addStringOption(new SlashCommandStringOption().setName("url").setDescription("The url of the image to put the text on.").setRequired(false))
        super(data)
    }

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const text : string = interaction.options.getString("text", true);
        try{
            await interaction.deferReply();
            const editImage : EditImage = await CommandUtils.processImageCommand(interaction);
            const image: Image = await loadImage(editImage.getData());
            const fontSize : number = Math.min(image.width,image.height) / 9;
            const tempCanvas: Canvas = createCanvas(image.width, image.height);
            const tempCtx : CanvasRenderingContext2D = tempCanvas.getContext("2d");
            tempCtx.font = `bold ${fontSize.toString()}px Caption`;
            const lines : string[] = StringUtils.wrapText(tempCtx, text, tempCanvas.width);
            const textHeight: number = (tempCtx.measureText(lines[0]).actualBoundingBoxAscent * (lines.length+1))+20;
            const canvas: Canvas = createCanvas(image.width, image.height+textHeight);

            const ctx : CanvasRenderingContext2D = canvas.getContext("2d");
            ctx.fillStyle = "#ffffff";
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.font = `bold ${fontSize.toString()}px Caption`;
            ctx.fillRect(0,0,canvas.width,textHeight)
            ctx.fillStyle = "#000000";

            // Check if the image is static
            if(editImage.isStatic()){
                ctx.drawImage(image, 0, textHeight, canvas.width, image.height);
                this.captionText(canvas, lines, fontSize);
                const buffer : Buffer = canvas.toBuffer();
                await interaction.followUp({files: [{ attachment: buffer, name:"meme."+editImage.getExtension()}]});
            }else{
                // If the image is a gif, we need to process each frame
                let gifBuffer : Buffer = editImage.getData();
                const gif: Gif = await GifUtil.read(gifBuffer);

                for (const frame of gif.frames) {
                    console.log("Processing Gift Frame");
                    // Create a canvas for the gif frame
                    const gifCanvas: Canvas = createCanvas(canvas.width,  image.height);
                    // Get the context of the canvas
                    const gifCtx: CanvasRenderingContext2D = gifCanvas.getContext("2d");
                    // Get the image data from the frame
                    const frameImage: Buffer = frame.bitmap.data;
                    // Create an image data object from the frame
                    const frameImageData: ImageData = <ImageData>ctx.createImageData(frame.bitmap.width, frame.bitmap.height);
                    // Set the image data to the frame image
                    frameImageData.data.set(frameImage);
                    // Put the image data on the gif canvas
                    gifCtx.putImageData(frameImageData, frame.xOffset, frame.yOffset);
                    // Clear the main canvas
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    // Draw the gif frame on the main canvas
                    ctx.drawImage(gifCanvas, frame.xOffset+textHeight, frame.yOffset, frame.bitmap.width, frame.bitmap.height)
                    // Put the text on the main canvas
                    this.captionText(canvas, lines, fontSize);
                    // Get the image data from the main canvas
                    const modifiedFrameImage: ImageData = <ImageData>ctx.getImageData(frame.xOffset+textHeight,frame.yOffset, frame.bitmap.width, frame.bitmap.height);
                    // Create a buffer for the image data
                    const modifiedFrameBuffer: Buffer = Buffer.alloc(modifiedFrameImage.data.length);
                    // Set the buffer to the image data
                    modifiedFrameBuffer.set(modifiedFrameImage.data);
                    // Create a bitmap image from the buffer
                    const frameBitmap: BitmapImage = new BitmapImage(frame.bitmap.width, frame.bitmap.height, modifiedFrameBuffer);
                    // Quantize the bitmap image
                    GifUtil.quantizeSorokin(frameBitmap, 256,undefined,{ditherAlgorithm:"FalseFloydSteinberg"}) // This is the fastest
                    // Set the frame bitmap to the quantized bitmap
                    frame.bitmap.data.set(frameBitmap.bitmap.data);
                }
                // Encode the gif
                const codec: GifCodec = new GifCodec();
                const gifBuffer2: Gif = await codec.encodeGif(gif.frames, {loops: gif.loops});
                const embed: EmbedBuilder  = new EmbedBuilder();
                embed.setImage("attachment://meme."+editImage.getExtension());
                embed.setFooter({text: `${image.width}x${image.height}  | Frames: ${gif.frames.length} | Time Taken: ${(Date.now() - interaction.createdTimestamp)/1000}s`})
                await interaction.followUp({files: [{ attachment: gifBuffer2.buffer, name:"meme."+editImage.getExtension()}], embeds: [embed]});
            }
        }catch (e) {
            console.log(e)
            await interaction.followUp({content: "**Error:** "+e.message, ephemeral: true})
        }

    }
    private captionText(canvas : Canvas, lines : string[], fontSize : number): void{
        let ctx: CanvasRenderingContext2D = canvas.getContext("2d");
        for(let i: number = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], canvas.width / 2, (i * fontSize) + 10, canvas.width);
        }
    }
}