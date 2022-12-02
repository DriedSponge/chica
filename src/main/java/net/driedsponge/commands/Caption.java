package net.driedsponge.commands;

import net.driedsponge.utils.AliasedImage;
import net.driedsponge.utils.StringUtils;
import net.dv8tion.jda.api.entities.Message;
import net.dv8tion.jda.api.events.interaction.command.SlashCommandInteractionEvent;
import net.dv8tion.jda.api.interactions.InteractionHook;
import net.dv8tion.jda.api.utils.FileUpload;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Objects;
import java.util.function.Consumer;

public class Caption extends ImageCommand {

    private int width;
    private int offsetY;

    public Caption() {
        super("caption");
    }

    @Override
    public void execute(SlashCommandInteractionEvent event, Message.Attachment attachment, File input, BufferedImage edit, File output) throws IOException, FontFormatException {
        String caption = Objects.requireNonNull(event.getOption("caption")).getAsString();
        this.width = edit.getWidth();
        int originalY = edit.getHeight();




        // Import Font
        InputStream stream = ClassLoader.getSystemClassLoader().getResourceAsStream("roboto-bold.ttf");
        float fontSize = 100f - ((caption.length() * 0.5f));
        Font roboto = Font.createFont(Font.TRUETYPE_FONT, stream).deriveFont(fontSize);
        BufferedImage buildImg = new BufferedImage(width, originalY,BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics2D = buildImg.createGraphics();
        graphics2D.setFont(roboto);
        FontMetrics fontMetrics = graphics2D.getFontMetrics();
        graphics2D.dispose();
        int textMargin = width - (width/20);

        ArrayList<String> strings = StringUtils.wrapText(caption, fontMetrics, textMargin);

        int textHeight = fontMetrics.getHeight();
        this.offsetY = (textHeight*strings.size()) + 30;

        AliasedImage finalImg = new AliasedImage(width, offsetY + originalY);

        Graphics2D g2d = finalImg.getG2d();

        g2d.setFont(roboto);
        drawBgRect(g2d);
        drawText(g2d,strings);


        g2d.drawImage(edit,0,offsetY, null);
        ImageIO.write(finalImg, Objects.requireNonNull(attachment.getFileExtension()),output);
        FileUpload fileUpload = FileUpload.fromData(output);

        // Delte original file after upload
        event.replyFiles(fileUpload).queue((f) ->{
                output.delete();
                });
        input.delete();
        g2d.dispose();

    }

    /**
     * Draw the white rectangle behind the text.
     * @param g2d
     */
    private void drawBgRect(Graphics2D g2d){
        g2d.setColor(Color.WHITE);
        g2d.fillRect(0,0,width,offsetY);
    }

    /**
     * Draw the text.
     * @param g2d
     * @param strings
     */
    private void drawText(Graphics2D g2d, ArrayList<String> strings){
        FontMetrics fontMetrics = g2d.getFontMetrics();
        g2d.setColor(Color.BLACK);
        for(int i = 0; i<strings.size(); i++) {
            System.out.println(strings.get(i));
            g2d.drawString(strings.get(i), (width - fontMetrics.stringWidth(strings.get(i)))/2,  fontMetrics.getHeight() + (i * fontMetrics.getHeight()));
        }
    }

}
