import {Attachment, Channel, ChatInputCommandInteraction, Collection, Embed, Message} from "discord.js";
import {EditImage} from "./EditImage";
import axios from "axios";
import {Buffer} from "buffer";
import {Apis} from "./Apis";

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

        //If they send an url, use that
        if(interaction.options.getString("url", false) !== null){
            const url : string = interaction.options.getString("url", false);
            if(!this.isValidImageURL(url)){
                throw new Error("The url must be a valid image url! If you think this is a mistake and your url should be supported, let me know.");
            }
            return this.processURL(url);
        }

        // Detect the most recent image from the channel
        const channel:Channel = interaction.channel;
        const messages : Collection<string, Message> = await channel.messages.fetch({limit: 25});
        for(let i = 0; i < messages.size; i++){
            const message : Message = messages.get(messages.keyAt(i))
            if(message.attachments.size >= 1){
                const attachment: Attachment = message.attachments.first();
                if(this.imageExtensions.includes(attachment.contentType)){
                    const response = await axios.get(attachment.url, {responseType: 'arraybuffer'})
                    return new EditImage(attachment.contentType, attachment.url, Buffer.from(response.data));
                }
            }else if(this.isValidImageURL(message.content)){
                return this.processURL(message.content);
            }else if(message.embeds.length>=1){
                const embed: Embed = message.embeds[0];
                if(embed.image){
                    return this.processURL(embed.image.url);
                }else if(embed.thumbnail){
                    return this.processURL(embed.thumbnail.url);
                }
            }
        }

        throw new Error("You must have an image attached to the command!");
    }

    /**
     * Checks if the url is valid
     * @param url
     */
    static isValidImageURL(url: string): boolean {
        const urlRegex: RegExp = /^(http|https):\/\/[^ "]+$/;
        return (urlRegex.test(url) && (url.includes("tenor.com")||url.endsWith("gif")||url.endsWith("jpeg")||url.endsWith("png")||url.endsWith("jpg")));
    }

    /**
     * All this does is fetch the url using axios and returns a EditImage.
     * @throws Error if it is larger than 25mb, or it's not the right type.
     * @param url
     */
    static async fetchImageFromUrl(url: string): Promise<EditImage>{
        const response = await axios.get(url, {responseType: 'arraybuffer', headers:{"Accept": "image/*"}})

        if(response.data.byteLength > 25000000){
            throw new Error("The image must be less than 25mb! We will work on supporting larger images soon!");
        }
        if(CommandUtils.imageExtensions.includes(response.headers["content-type"])) {
            return new EditImage(response.headers["content-type"], url, Buffer.from(response.data));
        }else{
        }   throw new Error("Only GIFS, JPEGs, and PNGs are supported!");
    }

    /**
     * Process a raw URL. (make sure it's real first)
     * @param url
     */
    static async processURL(url:string): Promise<EditImage>{
        const uri : URL = new URL(url);
        let rawUrl : string = uri.href;

        // If the url is from tenor, get the id and use tenor api to get the gif, then get the gif raw url
        if(uri.hostname === "tenor.com"){
            rawUrl = await Apis.getTenorGifUrlFromApi(uri);
        }
        return this.fetchImageFromUrl(rawUrl);
    }
}