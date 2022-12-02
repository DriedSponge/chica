package net.driedsponge.commands;

import net.driedsponge.utils.Embeds;
import net.dv8tion.jda.api.entities.Message;
import net.dv8tion.jda.api.events.interaction.command.SlashCommandInteractionEvent;
import net.dv8tion.jda.api.hooks.ListenerAdapter;
import net.dv8tion.jda.api.utils.FileUpload;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.util.Arrays;
import java.util.Random;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

/**
 * Class for automatically processing commands meant for images.
 */
public class ImageCommand extends ListenerAdapter {
    private String name;

    private String[] alias;

    public ImageCommand(String name){
        this.name = name;
        this.alias = new String[]{};
    }
    @Override
    public void onSlashCommandInteraction(SlashCommandInteractionEvent event){
        if(event.getName().equals(this.name) || Arrays.asList(this.alias).contains(event.getName())){
            event.deferReply();
            Message.Attachment file = event.getOption("image").getAsAttachment();
            int randomId = new Random().nextInt(1000);
            File storage = new File("./temp/"+Integer.toString(randomId)+file.getFileName());
            CompletableFuture<File> downloadToFile = file.getProxy().downloadToFile(storage);
            File output = new File("./temp/"+Integer.toString(randomId)+file.getFileName()+"_"+this.name+".png");
            try {
                File original = downloadToFile.get();
                execute(event, file, original, ImageIO.read(original),output);
            } catch (InterruptedException | ExecutionException | IllegalArgumentException | IOException | FontFormatException e) {
                event.replyEmbeds(Embeds.errorEmbed(e.getMessage())).queue();
            }
        }
    }
    public void execute(SlashCommandInteractionEvent event, Message.Attachment attachment, File source, BufferedImage edit, File destination) throws IOException, FontFormatException {}
}
