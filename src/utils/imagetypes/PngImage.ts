import { Sharp } from "sharp";
import { SourceImage } from "../SourceImage";
import * as sharp from "sharp";

export class PngImage extends SourceImage {
	constructor(url: string, data: Buffer) {
		super(url, data, "image/png", false);
	}

	public getHeight(): number {
		return this.metaData.height;
	}
	public getSharpInstance(): Sharp {
		return this.sharpInstance.png();
	}
	public getFrameCount(): number {
		return 1;
	}
	public toInputFormat(output: sharp.Sharp): sharp.Sharp {
		return output.png();
	}
}
