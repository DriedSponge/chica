import {SlashCommand} from "../SlashCommand";
import {Canvas, CanvasRenderingContext2D, createCanvas, Image, loadImage, registerFont} from "canvas";
import {
    Attachment, ChatInputCommandInteraction,
    CommandInteraction,
    SlashCommandAttachmentOption,
    SlashCommandBuilder,
    SlashCommandStringOption
} from "discord.js";
import {StringUtils} from "../../utils/StringUtils";
import {CommandUtils} from "../../utils/CommandUtils";
import {EditImage} from "../../utils/EditImage";
export class Meme extends SlashCommand{
    constructor() {
        const data : SlashCommandBuilder = new SlashCommandBuilder()
        data.setName("meme")
        data.setDescription("Put meme text on an image.")
        data.addStringOption(new SlashCommandStringOption().setMaxLength(100).setName("text").setDescription("The text to put on the image. Use **|** to separate top and bottom text.").setRequired(true))
        data.addAttachmentOption(new SlashCommandAttachmentOption().setName("image").setDescription("The image to put the text on.").setRequired(false))
        data.addStringOption(new SlashCommandStringOption().setName("url").setDescription("The url of the image to put the text on.").setRequired(false))
        super(data)
    }

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {

        const text : string = interaction.options.getString("text", true);
        try{
            await interaction.deferReply();
            const editImage : EditImage = CommandUtils.processImageCommand(interaction);
            const image: Image = await loadImage(editImage.getUrl());
            const fontSize : number = Math.min(image.width,image.height) / 8;
            const canvas: Canvas = createCanvas(image.width, image.height);
            const ctx : CanvasRenderingContext2D = canvas.getContext("2d");
            // Check if the image is static
            if(editImage.getType() === "image/png" || editImage.getType() === "image/jpeg" || editImage.getType() === "image/jpg"){
                ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
                this.memeText(canvas, text, fontSize);
            }else{

            }



            const buffer : Buffer = canvas.toBuffer();

            await interaction.followUp({files: [{ attachment: buffer, name:"meme."+editImage.getExtension()}]});
        }catch (e) {
            await interaction.followUp({content: "**Error:** "+e, ephemeral: true})
        }

    }
    private memeText(canvas : Canvas, text : string, fontSize : number): void{
        let ctx: CanvasRenderingContext2D = canvas.getContext("2d");
        ctx.font = `bold ${fontSize.toString()}px Impact`;
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = (fontSize / 30);
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";

        const lines : string[] = text.split("|");
        const topText : string = lines[0].trim();

        // Bottom Text Stuff
        if(lines.length >1){
            const bottomText : string = lines[1].trim();
            const bottomTextHeight : number = ctx.measureText(bottomText).actualBoundingBoxDescent;
            const bottomLines : string[] = StringUtils.wrapText(ctx, bottomText, canvas.width);
            for(let i: number = 0; i < bottomLines.length; i++) {
                ctx.fillText(bottomLines[i], canvas.width / 2, canvas.height - 20 - bottomTextHeight - (i*fontSize) , canvas.width);
                ctx.strokeText(bottomLines[i], canvas.width / 2, canvas.height - 20 - bottomTextHeight - (i*fontSize) , canvas.width);
            }
        }


        const topLines : string[] = StringUtils.wrapText(ctx, topText, canvas.width);
        for(let i: number = 0; i < topLines.length; i++) {
            ctx.fillText(topLines[i], canvas.width / 2, (i * fontSize) + 20, canvas.width);
            ctx.strokeText(topLines[i], canvas.width / 2, (i * fontSize) + 20, canvas.width);
        }
    }
}