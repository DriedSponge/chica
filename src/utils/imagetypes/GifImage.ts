import { Sharp } from "sharp";
import { SourceImage } from "../SourceImage";
import * as sharp from "sharp";

export class GifImage extends SourceImage {
	constructor(url: string, data: Buffer) {
		super(url, data, "image/gif", true);
	}

	public getHeight(): number {
		return this.metaData.pageHeight;
	}

	public getSharpInstance(): Sharp {
		return this.sharpInstance.gif();
	}
	public getFrameCount(): number {
		return this.metaData.delay.length;
	}

	public toInputFormat(output: sharp.Sharp): sharp.Sharp {
		return output.gif();
	}
}
