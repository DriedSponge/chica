package net.driedsponge;

import net.driedsponge.commands.Caption;
import net.dv8tion.jda.api.JDA;
import net.dv8tion.jda.api.JDABuilder;
import net.dv8tion.jda.api.entities.Activity;
import net.dv8tion.jda.api.interactions.commands.OptionType;
import net.dv8tion.jda.api.interactions.commands.build.Commands;
import net.dv8tion.jda.api.utils.cache.CacheFlag;

import java.io.File;

public class Main {
    public static void main(String[] args) {
        String token = System.getenv("DISCORD_TOKEN");
        JDABuilder builder = JDABuilder.createDefault(token);
        // Disable parts of the cache
        builder.disableCache(CacheFlag.MEMBER_OVERRIDES);
        builder.enableCache(CacheFlag.VOICE_STATE);
        // Enable the bulk delete event
        builder.setBulkDeleteSplittingEnabled(false);

        builder.addEventListeners(new Caption());

        builder.setActivity(Activity.watching("for /help"));

        new File("./temp").mkdirs();


        JDA jda = builder.build();
        jda.updateCommands().addCommands(
                Commands.slash("caption","Add a caption to an image!")
                        .addOption(OptionType.STRING,"caption","Your caption.",true)
                        .addOption(OptionType.ATTACHMENT,"image","An image/gif to upload.",false)
                        .addOption(OptionType.STRING,"url","An image/gif URL.",false)
                )
                .queue();

    }
}