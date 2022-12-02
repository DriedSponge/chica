package net.driedsponge.utils;

import net.dv8tion.jda.api.EmbedBuilder;
import net.dv8tion.jda.api.entities.MessageEmbed;

import java.awt.*;

/**
 * Utility class for maintaining uniform embeds.
 */
public class Embeds {
    public static MessageEmbed errorEmbed(String error){
        EmbedBuilder embed= new EmbedBuilder();
        embed.setTitle(":broken_heart: An error occurred on my end! :broken_heart: ");
        embed.appendDescription("The following error message is as follows: \n");
        embed.appendDescription("\n`"+error+"`\n\n");
        embed.appendDescription("If this keeps occurring, please create an issue on [GitHub](https://github.com/driedsponge/)!");
        embed.setColor(Color.RED);
        return embed.build();
    }
}
