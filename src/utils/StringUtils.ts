import {CanvasRenderingContext2D} from "canvas";

export class StringUtils {
    /**
     * Wrap text to fit in a canvas context
     * @param ctx
     * @param text
     * @param maxWidth
     */
    static wrapText(ctx : CanvasRenderingContext2D, text :string, maxWidth : number): string[] {
        const words: string[] = text.split(' ');
        let lines : string[] = [];
        let line = '';
        if (ctx.measureText(text).width < maxWidth) {
            lines.push(text);
            return lines;
        }
        while (words.length > 0) {
            let split = false;
            while (ctx.measureText(words[0]).width >= maxWidth) {
                const tmp = words[0];
                words[0] = tmp.slice(0, -1);
                if (split) {
                    words[1] = `${tmp.slice(-1)}${words[1]}`;
                } else {
                    split = true;
                    words.splice(1, 0, tmp.slice(-1));
                }
            }
            if (ctx.measureText(line + words[0]).width < maxWidth) {
                line += `${words.shift()} `;
            } else {
                lines.push(line.trim());
                line = '';
            }
            if (words.length === 0) {
                lines.push(line.trim());
            }
        }
        return lines;

    }
}