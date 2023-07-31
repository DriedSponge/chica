import {
	Client,
	Collection,
	Events,
	GatewayIntentBits,
	Interaction,
	REST,
	Routes,
	ActivityType
} from "discord.js";
import { SlashCommand } from "./commands/SlashCommand";
import games from "./games";
import { Ping } from "./commands/Ping";
import "dotenv/config";
import { Meme } from "./commands/image/Meme";
import { registerFont } from "canvas";
import { Caption } from "./commands/image/Caption";
const client: Client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent]
});
const commands: Collection<string, SlashCommand> = new Collection<string, SlashCommand>();

commands.set("ping", new Ping());
commands.set("meme", new Meme());
commands.set("caption", new Caption());

client.on(Events.ClientReady, async (client: Client): Promise<void> => {
	registerFont(__dirname + "/../resources/fonts/impact.ttf", { family: "Impact" });
	registerFont(__dirname + "/../resources/fonts/caption.otf", { family: "Caption" });

	console.log("Client is ready and logged in!");

	client.user.setActivity("Brink", { type: ActivityType.Playing });
	client.user.setStatus("online");

	//every ten minutes set the status
	setInterval(() => {
		const game: string = games[Math.floor(Math.random() * games.length)];
		client.user.setActivity(game, { type: ActivityType.Playing });
		client.user.setStatus("online");
	}, 600000);

	const cmdsfinal: any[] = [];

	const rest: REST = new REST().setToken(process.env.TOKEN);
	console.log(`Started refreshing ${commands.size} application (/) commands.`);
	commands.forEach((command) => {
		cmdsfinal.push(command.getCommandData().toJSON());
	});
	await rest
		.put(Routes.applicationCommands(process.env.CLIENTID), { body: cmdsfinal })
		.then((res) => {
			console.log("Successfully reloaded application (/) commands.");
			console.log(res);
		})
		.catch(console.error);
});

client.on(Events.InteractionCreate, async (interaction: Interaction): Promise<void> => {
	if (!interaction.isCommand()) return;
	commands.get(interaction.commandName)?.run(interaction);
});

client.login(process.env.TOKEN).then((r) => console.log("Logged in!"));
