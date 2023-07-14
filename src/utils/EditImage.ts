import * as buffer from "buffer";

export class EditImage{
    private readonly type : string;
    private readonly url : string;
    private readonly extension : string;
    private data : Buffer;
    constructor(type : string, url : string, data : Buffer) {
        this.url = url;
        this.type = type;
        this.extension = type.split("/")[1];
        this.data = data;
    }
    public getType(): string {
        return this.type;
    }
    public getUrl(): string {
        return this.url;
    }
    public getData(): Buffer {
        return this.data;
    }
    public getExtension(): string {
        return this.extension;
    }
}