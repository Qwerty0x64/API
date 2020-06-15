import Mongo from "./classes/Mongo.ts";
import "https://deno.land/x/denv/mod.ts";
import CacheManager from "./classes/CacheManager.ts";
import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { Snelm } from "https://deno.land/x/snelm/mod.ts";
import loadRoutes from "./util/loadRoutes.ts";

export const cacheManager = new CacheManager({
		memoryOnly: false,
		discardTamperedCache: true
	}),
	server = new Application(),
	router = new Router(),
	mongo = new Mongo();

const snelm = new Snelm("oak");
await snelm.init();

mongo.login();
await prepareCache();
setInterval(prepareCache, 60 * 1000);

server.use((ctx, next) => {
	ctx.response = snelm.snelm(ctx.request, ctx.response);
	ctx.response.headers.append("X-PreMiD-Host", Deno.hostname());
	ctx.response.headers.append("Content-Type", "application/json");

	next();
});

loadRoutes(router);

server.use(router.routes());
server.use(router.allowedMethods());

async function prepareCache() {
	console.time("Cache time");
	const collections = (await mongo.db.listCollectionNames()).filter(
		c => !["warns", "crowdin", "userSettings", "status"].includes(c)
	);

	//TODO Try to make a spam call of requests instead of awaiting
	for (const c of collections) {
		if (cacheManager.isExpired(c))
			cacheManager.set(c, await mongo.db.collection(c).find());
	}

	console.timeEnd("Cache time");
}

console.log("Listening");
await server.listen({ port: 3000 });
