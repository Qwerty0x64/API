import CacheManager from "../classes/CacheManager.ts";
import { mongo } from "./mongoConnection.ts";
import log from "./functions/log.ts";
import { yellow, green, cyan } from "https://deno.land/std/fmt/colors.ts";

let cacheUpdater: number;

export const cache = new CacheManager({
		memoryOnly: false,
		discardTamperedCache: true
	}),
	cacheExpireTimes = {
		science: 10 * 60 * 1000,
		changelog: 15 * 60 * 1000,
		discordUsers: 15 * 60 * 1000,
		partners: 15 * 60 * 1000,
		sponsors: 15 * 60 * 1000,
		presences: 5 * 60 * 1000,
		tickets: 5 * 60 * 1000,
		versions: 15 * 60 * 1000,
		credits: 10 * 1000
	};

export async function prepareCache() {
	const now = performance.now();
	log(yellow("Caching..."));

	const collections: { name: string }[] = (
		await mongo.listCollections(Deno.env.get("MONGO_DB")!)
	).filter(
		(c: { name: string }) =>
			!["warns", "crowdin", "userSettings", "status"].includes(c.name)
	);

	await Promise.all(
		collections.map(async c => {
			if (cache.isExpired(c.name))
				cache.set(
					c.name,
					await mongo.find(
						Deno.env.get("MONGO_DB")!,
						c.name,
						{},
						{ projection: { _id: false, identifier: false } }
					),
					Object.keys(cacheExpireTimes).includes(c.name)
						? //@ts-ignore
						  cacheExpireTimes[c.name]
						: 1 * 60 * 1000
				);
		})
	);
	log(
		green(
			`Caching took ${cyan(
				Math.floor(performance.now() - now).toString() + "ms"
			)}`
		)
	);

	if (!cacheUpdater) cacheUpdater = setInterval(prepareCache, 60 * 1000);
}
