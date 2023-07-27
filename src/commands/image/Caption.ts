import {SlashCommand} from "../SlashCommand";
import {GifUtil, GifCodec, Gif, BitmapImage, GifFrame} from "gifwrap";
import {Canvas, CanvasRenderingContext2D, createCanvas, Image, loadImage} from "canvas";
import {
    ChatInputCommandInteraction,
    EmbedBuilder,
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

            const fontSize : number = Math.min(image.width,image.height) / 10;

            const tempCanvas: Canvas = createCanvas(image.width, image.height);
            const tempCtx : CanvasRenderingContext2D = tempCanvas.getContext("2d");
            tempCtx.font = `bold ${fontSize.toString()}px Caption`;
            const lines : string[] = StringUtils.wrapText(tempCtx, text, tempCanvas.width - (tempCanvas.width/9));

            const yMargin :number = (tempCtx.measureText(lines[0]).actualBoundingBoxAscent)*1.7

            const textHeight: number = ((tempCtx.measureText(lines[0]).actualBoundingBoxAscent) * (lines.length+1))+(yMargin);
            const canvas: Canvas = createCanvas(image.width, image.height+textHeight);

            const ctx : CanvasRenderingContext2D = canvas.getContext("2d");
            ctx.fillStyle = "#ffffff";
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.font = `s${fontSize.toString()}px Caption`;
            ctx.fillRect(0,0,canvas.width,textHeight)
            ctx.fillStyle = "#000000";
            // Check if the image is static
            if(editImage.isStatic()){
                ctx.drawImage(image, 0, textHeight, canvas.width, image.height);
                this.captionText(canvas, lines, fontSize,yMargin);
                const buffer : Buffer = canvas.toBuffer();
                await interaction.followUp({files: [{ attachment: buffer, name:"caption."+editImage.getExtension()}]});
            }else{
                // If the image is a gif, we need to process each frame
                let gifBuffer : Buffer = editImage.getData();
                const gif: Gif = await GifUtil.read(gifBuffer);
                let i :number = 0;
                // We need to create a new collection of frames and a whole new gif because to modify the existing one (like the meme command), the gf
                // needs to stay the same size.
                const outputFrames : GifFrame[] = [];
                for (const frame of gif.frames) {
                    i++
                    console.log(`[${i}/${gif.frames.length}] Processing Gif Frame`);
                    // Create a canvas for the gif frame
                    const gifCanvas: Canvas = createCanvas(canvas.width,  canvas.height);
                    // Get the context of the canvas
                    const gifCtx: CanvasRenderingContext2D = gifCanvas.getContext("2d");
                    // Get the image data buffer from the current frame
                    const frameImage: Buffer = frame.bitmap.data;
                    // Create an image data object from the buffer we just created
                    const frameImageData: ImageData = <ImageData>ctx.createImageData(frame.bitmap.width, frame.bitmap.height);
                    // Set the image data to the frame image
                    frameImageData.data.set(frameImage);
                    // Put the image data on the gif canvas
                    gifCtx.putImageData(frameImageData, frame.xOffset, frame.yOffset+textHeight);
                    // Clear the main canvas
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    // Draw the gif frame on the main canvas
                    ctx.drawImage(gifCanvas, 0, 0)

                    ctx.fillStyle = "#ffffff";
                    ctx.fillRect(0,0,canvas.width,textHeight)
                    ctx.fillStyle = "#000000";

                    // Put the text on the main canvas
                    this.captionText(canvas, lines, fontSize,yMargin);
                    // Get the image data from the main canvas
                    const modifiedFrameImage: ImageData = <ImageData>ctx.getImageData(0,0, canvas.width, canvas.height);
                    // Create a buffer for the image data
                    const modifiedFrameBuffer: Buffer = Buffer.alloc(modifiedFrameImage.data.length);
                    // Set the buffer to the image data
                    modifiedFrameBuffer.set(modifiedFrameImage.data);
                    // Create a bitmap image from the buffer
                    const frameBitmap: BitmapImage = new BitmapImage(canvas.width, canvas.height, modifiedFrameBuffer);
                    // Quantize the bitmap image
                    GifUtil.quantizeSorokin(frameBitmap, 256,undefined,{ditherAlgorithm:"FalseFloydSteinberg"}) // This is the fastest
                    // Set the frame bitmap to the quantized bitmap
                    outputFrames.push(new GifFrame(frameBitmap.bitmap))
                }
                // Encode the gif
                const codec: GifCodec = new GifCodec();
                const gifBuffer2: Gif = await codec.encodeGif(outputFrames, {loops: gif.loops});
                const embed: EmbedBuilder  = new EmbedBuilder();
                embed.setImage("attachment://caption."+editImage.getExtension());
                embed.setFooter({text: `${image.width}x${image.height}  | Frames: ${gif.frames.length} | Time Taken: ${(Date.now() - interaction.createdTimestamp)/1000}s`})
                await interaction.followUp({files: [{ attachment: gifBuffer2.buffer, name:"caption."+editImage.getExtension()}], embeds: [embed]});
            }
        }catch (e) {
            console.log(e)
            await interaction.followUp({content: "**Error:** "+e.message, ephemeral: true})
        }

    }
    private captionText(canvas : Canvas, lines : string[], fontSize : number, yMargin: number): void{
        let ctx: CanvasRenderingContext2D = canvas.getContext("2d");
        for(let i: number = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], canvas.width / 2, (i * fontSize) + (yMargin/2), canvas.width);
        }
    }
}