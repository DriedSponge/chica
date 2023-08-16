import { CanvasRenderingContext2D } from "canvas";
import * as fs from "fs";

export class StringUtils {
	/**
	 * Wrap text to fit in a canvas context
	 * @param ctx
	 * @param text
	 * @param maxWidth
	 */
	static wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
		const words: string[] = text.split(" ");
		let lines: string[] = [];
		let line = "";
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
				line = "";
			}
			if (words.length === 0) {
				lines.push(line.trim());
			}
		}
		return lines;
	}
	static createCenteredTextSVG(
		textLines: string[],
		width: number,
		fontFamily: string,
		fontSize: number,
		lineSpacing: number
	): string {
		const fontData: Buffer = fs.readFileSync(fontFamily);
		const fontDataUri: string = `data:font/ttf;base64,${fontData.toString("base64")}`;
		const svgLines = textLines
			.map((text, index) => {
				const x = "50%";
				const y = (index + 1) * (fontSize + lineSpacing);

				return `<text x="${x}" y="${y}" font-family="'Impact'" font-size="${fontSize}" text-anchor="middle">${text}</text>`;
			})
			.join("");

		const svg = `
    <svg width='${width}' height="100" xmlns="http://www.w3.org/2000/svg">
      ${svgLines}
      <defs>
      <style>
      @import "${fontDataUri}";
      	text {
					fill: white;
					stroke: black;
					stroke-width: 2px;
      	}
        @font-face {
          font-family: 'Impact';
          src: url("${fontDataUri}");
         }
      </style>
</defs>
      
    </svg>
  `;
		console.log(svg);
		return svg;
	}
}
