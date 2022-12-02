package net.driedsponge.utils;

import java.awt.*;
import java.util.ArrayList;

/**
 * Utility methods for drawing text with Graphics2D
 */
public class StringUtils {

    /**
     * Calculate text wrap for given width.
     * @param text The text to analyze.
     * @param fontMetrics Font properties.
     * @param maxWidth The max width the text is allowed to be. I would advise adding a margin.
     * @return An {@link ArrayList<String>}. Each value in the array list should be a new line.
     */
    public static ArrayList<String> wrapText(String text, FontMetrics fontMetrics, int maxWidth){
        String[] words = text.split("\\s+");
        int totalWidth = 0;
        ArrayList<String> strings = new ArrayList<>();
        StringBuilder tempString = new StringBuilder();
        for(int i =0; i<words.length; i++){
            String word = words[i];
            int wordSize = fontMetrics.stringWidth(word);
            if(totalWidth + wordSize > maxWidth){
                // insert new line

                strings.add(tempString.toString().trim());
                tempString = new StringBuilder();
                totalWidth = 0;
                i--;
            }else{
                tempString.append(word+" ");
                totalWidth += fontMetrics.stringWidth(word);
            }
        };
        if(!tempString.isEmpty()){
            strings.add(tempString.toString().trim());
        }
        return strings;
    }

}