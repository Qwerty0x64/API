import { MongoClient } from "https://deno.land/x/mongo@v0.8.0/mod.ts";

export default class Mongo {
	client = new MongoClient();
	db = this.client.database("PreMiD");

	constructor() {}

	login() {
		this.client.connectWithUri(Deno.env.get("MONGO_URL")!);
	}
}
