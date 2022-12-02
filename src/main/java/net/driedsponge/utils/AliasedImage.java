package net.driedsponge.utils;

import java.awt.*;
import java.awt.image.BufferedImage;

/**
 * An extension of {@link BufferedImage} that automatically has antialiasing enabled. I might add other imag enhancements here too.
 */
public class AliasedImage extends BufferedImage {
    private Graphics2D g2d;
    public AliasedImage(int width, int height, int type){
        super(width,height, type);
        this.g2d = this.createGraphics();
        this.g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        this.g2d.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING,RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
    }

    public Graphics2D getG2d() {
        return g2d;
    }
}
