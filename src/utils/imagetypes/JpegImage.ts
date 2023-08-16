import { Sharp } from "sharp";
import { SourceImage, SupportedFiles } from "../SourceImage";
import * as sharp from "sharp";

export class JpegImage extends SourceImage {
	constructor(url: string, data: Buffer, type: SupportedFiles) {
		super(url, data, type, false);
	}

	public getHeight(): number {
		return this.metaData.height;
	}

	public getSharpInstance(): Sharp {
		return this.sharpInstance.jpeg();
	}
	public getFrameCount(): number {
		return 1;
	}
	public toInputFormat(output: sharp.Sharp): sharp.Sharp {
		return output.jpeg();
	}
}
