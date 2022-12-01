package net.driedsponge.commands;

import net.driedsponge.utils.Embeds;
import net.dv8tion.jda.api.entities.Message;
import net.dv8tion.jda.api.events.interaction.command.SlashCommandInteractionEvent;
import net.dv8tion.jda.api.hooks.ListenerAdapter;
import net.dv8tion.jda.api.utils.FileUpload;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.font.TextAttribute;
import java.awt.image.BufferedImage;
import java.awt.image.ImageObserver;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.text.AttributedString;
import java.util.*;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

public class Caption extends ImageCommand {
    public Caption() {
        super("caption");
    }

    @Override
    public void execute(SlashCommandInteractionEvent event, Message.Attachment attachment, File input, BufferedImage edit, File output) throws IOException, FontFormatException {
        String caption = Objects.requireNonNull(event.getOption("caption")).getAsString();
        int originalX = edit.getWidth();
        int originalY = edit.getHeight();
        int wordCount = caption.split("\\s+").length;
        int offsetY = ((wordCount / 6) * 100) +150;
        int newY = originalY + offsetY;


        BufferedImage image = new BufferedImage(originalX, newY,BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics2D = image.createGraphics();
        graphics2D.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        graphics2D.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING,RenderingHints.VALUE_TEXT_ANTIALIAS_ON);

        InputStream stream = ClassLoader.getSystemClassLoader().getResourceAsStream("roboto-bold.ttf");
        Font font = Font.createFont(Font.TRUETYPE_FONT, stream).deriveFont(100f - ((caption.length() * 0.5f)));
        graphics2D.setFont(font);
        FontMetrics fontMetrics = graphics2D.getFontMetrics();
        String[] words = caption.split("\\s+");

        int totalWidth = 0;
        ArrayList<String> strings = new ArrayList<>();
        StringBuilder tempString = new StringBuilder();
         for(int i =0; i<words.length; i++){
            String word = words[i];
            int wordSize = fontMetrics.stringWidth(word);
            if(totalWidth + wordSize > originalX){
                // insert new line
                totalWidth = 0;
                strings.add(tempString.toString().trim());
                tempString = new StringBuilder();
                tempString.append(word+" ");
            }else{
                tempString.append(word+" ");
                totalWidth += fontMetrics.stringWidth(word);
            }
        };
        if(!tempString.isEmpty()){
            strings.add(tempString.toString().trim());
        }
        graphics2D.fillRect(0,0,originalX,offsetY);
        graphics2D.setColor(Color.BLACK);

        System.out.println(Arrays.toString(strings.toArray()));

        for(int i = 0; i<strings.size(); i++) {
            System.out.println(strings.get(i));
            graphics2D.drawString(strings.get(i), ((originalX-30) - fontMetrics.stringWidth(strings.get(i)))/2,  fontMetrics.getHeight() + (i * fontMetrics.getHeight()));
        }

        graphics2D.drawImage(edit,0,offsetY, null);

        ImageIO.write(image,"png",output);
        FileUpload fileUpload = FileUpload.fromData(output);
        event.replyFiles(fileUpload).queue();
        output.delete();
        input.delete();

    }
}
