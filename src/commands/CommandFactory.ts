import { SlashCommand } from "./SlashCommand";
import { Ping } from "./Ping";
import { Meme } from "./image/Meme";
import { Caption } from "./image/Caption";
import { Flop } from "./image/Flop";

export type CommandName = "ping" | "meme" | "caption" | "flop";
export class CommandFactory {
	public static createCommandInstance(commandName: CommandName): SlashCommand {
		console.log("Running the command " + commandName);
		switch (commandName) {
			case "ping":
				return new Ping();
			case "meme":
				return new Meme();
			case "caption":
				return new Caption();
			case "flop":
				return new Flop();
			default:
				throw new Error("Command not found");
		}
	}
}
