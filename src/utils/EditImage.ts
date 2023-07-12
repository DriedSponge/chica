export class EditImage{
    private readonly type : string;
    private readonly url : string;
    private readonly extension : string;
    constructor(type : string, url : string) {
        this.url = url;
        this.type = type;
        this.extension = type.split("/")[1];
    }
    public getType(): string {
        return this.type;
    }
    public getUrl(): string {
        return this.url;
    }
    public getExtension(): string {
        return this.extension;
    }
}