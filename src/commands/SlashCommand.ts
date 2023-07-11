import {ChatInputCommandInteraction, CommandInteraction, Interaction, SlashCommandBuilder} from "discord.js";

export abstract class SlashCommand {
    private readonly data: SlashCommandBuilder;

    protected constructor(data: SlashCommandBuilder) {
        this.data = data;
    }
    public getName(): string {
        return this.data.name;
    }

    public getDescription(): string {
        return this.data.description;
    }
    public getCommandData(): SlashCommandBuilder {
        return this.data;
    }
    public run(interaction: CommandInteraction): void {
        this.execute(interaction);
    }
    abstract execute(interaction : CommandInteraction): void;
}