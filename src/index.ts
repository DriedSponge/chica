import {Client, Collection, Events, GatewayIntentBits, Interaction, REST, Routes} from "discord.js"
import {SlashCommand} from "./commands/SlashCommand";
import {Ping} from "./commands/Ping";
import "dotenv/config"
import {Meme} from "./commands/image/Meme";
import {registerFont} from "canvas";
const client: Client = new Client({ intents: [GatewayIntentBits.Guilds] });
const commands : Collection<string, SlashCommand> = new Collection<string, SlashCommand>();

client.login(process.env.TOKEN).then(r => console.log("Logged in!"));


commands.set("ping", new Ping());
commands.set("meme", new Meme());

client.on(Events.ClientReady, async (client: Client ): Promise<void> => {
    registerFont(__dirname+"/../resources/fonts/impact.ttf", {family: "Impact"});
    console.log("Client is ready and logged in!");
    const cmdsfinal: any[] = []

    const rest: REST = new REST().setToken(process.env.TOKEN);
    await rest.put(Routes.applicationCommands(process.env.CLIENTID), { body: [] })
        .then(() => console.log('Successfully deleted all application commands.'))
        .catch(console.error);
    console.log(`Started refreshing ${commands.size} application (/) commands.`);
    commands.forEach(command => {
        cmdsfinal.push(command.getCommandData().toJSON())
    })
    await rest.put(Routes.applicationCommands(process.env.CLIENTID), { body: cmdsfinal })

})

client.on(Events.InteractionCreate, async (interaction:Interaction): Promise<void> => {
    if (!interaction.isCommand()) return;
    commands.get(interaction.commandName)?.run(interaction);
})

