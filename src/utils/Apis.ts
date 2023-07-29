import axios from "axios";

export class Apis {
	static async getTenorGifUrlFromApi(url: URL): Promise<string> {
		const length: number = url.pathname.split("-").length;
		const id: string = url.pathname.split("-")[length - 1];

		return await axios
			.get(
				`https://tenor.googleapis.com/v2/posts?key=${process.env.TENOR_API_KEY}&limit=1&ids=${id}&media_filter=gif`
			)
			.then((response) => {
				if (response.data.results[0].media_formats.gif.size > 25000000) {
					throw new Error(
						"The image must be less than 25mb! We will work on supporting larger images soon!"
					);
				}
				return response.data.results[0].media_formats.gif.url;
			})
			.catch((error) => {
				if (error.response) {
					switch (error.response.status) {
						case 429:
							throw new Error("I am being rate limited by tenor! Please try again later!");
						case 500:
							throw new Error("Tenor is having issues! Please try again later!");
						case 400:
							throw new Error("Invalid Tenor URL! Try using a different one!");
					}
				}
				throw error;
			});
	}
}
