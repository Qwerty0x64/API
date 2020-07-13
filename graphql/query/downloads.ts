import { cache } from "../../util/cacheManager.ts";
import { RouterContext } from "https://deno.land/x/oak/mod.ts";
import getDiscordUser from "../../util/functions/getDiscordUser.ts";
import { GQLError } from "https://deno.land/x/oak_graphql/mod.ts";
import searchStringToObject from "../../util/functions/searchStringToObject.ts";

let downloadsCache = prepareDownloads(cache.get("downloads"));

cache.on("update", (_, data) => (downloadsCache = prepareDownloads(data)), {
	only: "downloads"
});

export default async function (
	parent: any,
	params: {},
	context: RouterContext,
	info: any
) {
	const search = searchStringToObject(context);

	if (search.token) {
		try {
			const dUser = await getDiscordUser(search.token),
				accessType = cache
					.get("alphaUsers")
					.find((aU: any) => aU.userId === dUser.id)
					? "alpha"
					: cache.get("betaUsers").find((aU: any) => aU.userId === dUser.id)
					? "beta"
					: false;

			if (accessType === "alpha") return downloadsCache;
			else if (accessType === "beta")
				return [downloadsCache.find((c: any) => c.releaseType === "beta")];
			else return [];
		} catch (e) {
			return new GQLError("Invalid token providen.");
		}
	} else return new GQLError("No token providen.");
}

function prepareDownloads(downloads: any) {
	return downloads.map((c: any) => ({
		releaseType: c.item,
		appLinks: c.app_links,
		extLinks: c.ext_links
	}));
}
