import {
	ChatInputCommandInteraction,
	CommandInteraction,
	Interaction,
	SlashCommandBuilder
} from "discord.js";

export abstract class SlashCommand {
	private readonly data: SlashCommandBuilder;
	protected interaction: ChatInputCommandInteraction;
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
		this.interaction = <ChatInputCommandInteraction>interaction;
		this.execute(interaction);
	}
	protected test() {
		console.log("test");
	}
	abstract execute(interaction: CommandInteraction): void;
}
