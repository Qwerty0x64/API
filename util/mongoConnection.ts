import { MongoClient } from "https://raw.githubusercontent.com/Timeraa/deno-node-mongo/master/mod.ts";

export const mongo = new MongoClient(Deno.env.get("MONGO_URL")!, {
	useUnifiedTopology: true,
	appname: "PreMiD-API"
});
