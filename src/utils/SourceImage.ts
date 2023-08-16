import { Sharp } from "sharp";
import * as sharp from "sharp";

export type SupportedFiles = "image/png" | "image/gif" | "image/jpeg" | "image/jpg";

export abstract class SourceImage {
	protected readonly mimeType: SupportedFiles;
	protected readonly url: string;
	protected readonly extension: string;
	protected readonly animated: boolean;
	protected data: Buffer;
	protected sharpInstance: Sharp;
	protected metaData: sharp.Metadata;
	protected constructor(url: string, data: Buffer, mimeType: SupportedFiles, animated: boolean) {
		this.data = data;
		this.url = url;
		this.mimeType = mimeType;
		this.extension = mimeType.split("/")[1];
		this.animated = animated;
		this.sharpInstance = sharp(data, { animated });
	}

	abstract getHeight(): number;
	abstract getSharpInstance(): Sharp;
	abstract getFrameCount(): number;
	abstract toInputFormat(output: Sharp): Sharp;

	async init(): Promise<SourceImage> {
		this.metaData = await this.sharpInstance.metadata();
		return this;
	}

	public getWidth(): number {
		return this.metaData.width;
	}
	public getMetaData(): sharp.Metadata {
		return this.metaData;
	}
	public getData(): Buffer {
		return this.data;
	}
	public isAnimated(): boolean {
		return this.animated;
	}
	public getExtension(): string {
		return this.extension;
	}
}
