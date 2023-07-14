import {Attachment, ChatInputCommandInteraction} from "discord.js";
import {EditImage} from "./EditImage";
import axios from "axios";
import {Buffer} from "buffer";

export class CommandUtils {
    private static imageExtensions : string[] = ["image/png", "image/gif", "image/jpeg", "image/jpg"];

    /**
     * An easy way to get the image url from a slash command. Possible sources include URL, attachment, and previous message.
     * @param interaction
     */
    public static async processImageCommand(interaction: ChatInputCommandInteraction): Promise<EditImage>{
        if(interaction.options.getAttachment("image", false) !== null){
            // check if it is a png gif or jpeg
            let attachment : Attachment = interaction.options.getAttachment("image", false);
            if(CommandUtils.imageExtensions.includes(attachment.contentType)){
                // if the attachment size is greater than 25mb, reject it
                if(attachment.size > 25000000){
                    throw new Error("The image must be less than 25mb! We will work on supporting larger images soon!");
                }
                const response = await axios.get(attachment.url, {responseType: 'arraybuffer'})
                return new EditImage(attachment.contentType, attachment.url, Buffer.from(response.data));
            }else{
                throw new Error("Only GIFS, JPEGs, and PNGs are supported!");
            }
        }

        if(interaction.options.getString("url", false) !== null){

        }

        throw new Error("You must have an image attached to the command!");
    }
}