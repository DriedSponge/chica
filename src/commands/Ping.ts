import {SlashCommand} from "./SlashCommand";
import {CommandInteraction, SlashCommandBuilder} from "discord.js";

export class Ping extends SlashCommand{
    constructor() {
        const data : SlashCommandBuilder = new SlashCommandBuilder()
        data.setName("ping")
        data.setDescription("Replies with Pong!")
        super(data)
    }

    async execute(interaction: CommandInteraction): Promise<void> {
        await interaction.reply("Pong!");
    }

}