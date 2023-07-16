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
        // If they send an attachment, use that
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

        //If they send a url, use that
        if(interaction.options.getString("url", false) !== null){
            const url : string = interaction.options.getString("url", false);
            if(!this.isValidUrl(url)){
                throw new Error("The url must be a valid url!");
            }
            const uri : URL = new URL(url);
            let rawUrl : string = uri.href;

            // If the url is from tenor, get the id and use tenor api to get the gif, then get the gif raw url
            if(uri.hostname === "tenor.com"){
                const length: number = uri.pathname.split("-").length;
                const id : string = uri.pathname.split("-")[length - 1];
                const tenorFetch = await axios.get(`https://tenor.googleapis.com/v2/posts?key=${process.env.TENOR_API_KEY}&limit=1&ids=${id}&media_filter=gif`);
                rawUrl = tenorFetch.data.results[0].media_formats.gif.url;
                if(tenorFetch.data.results[0].media_formats.gif.size > 25000000){
                    throw new Error("The image must be less than 25mb! We will work on supporting larger images soon!");
                }
            }


            const response = await axios.get(rawUrl+`?key=${process.env.TENOR_API_KEY}`, {responseType: 'arraybuffer', headers:{"Accept": "image/*"}})

            if(response.data.byteLength > 25000000){
                throw new Error("The image must be less than 25mb! We will work on supporting larger images soon!");
            }
            if(CommandUtils.imageExtensions.includes(response.headers["content-type"])) {
                return new EditImage(response.headers["content-type"], url, Buffer.from(response.data));
            }else{
            }   throw new Error("Only GIFS, JPEGs, and PNGs are supported!");
        }

        throw new Error("You must have an image attached to the command!");
    }

    /**
     * Checks if the url is valid
     * @param url
     */
    static isValidUrl(url: string): boolean {
        const urlRegex: RegExp = /^(ftp|http|https):\/\/[^ "]+$/;
        return urlRegex.test(url);
    }
}