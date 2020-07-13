import { RouterContext } from "https://deno.land/x/oak/mod.ts";
import { cache } from "../../util/cacheManager.ts";
import getDiscordUser from "../../util/functions/getDiscordUser.ts";

export const handler = async (ctx: RouterContext) => {
	let alphaUsers = cache.get("alphaUsers");
	let betaUsers = cache.get("betaUsers");
	let downloads = cache.get("downloads");

	if (!ctx.params.token)
		return (ctx.response.body = { error: 1, message: "No token providen" });
	if (!ctx.params.item)
		return (ctx.response.body = { error: 1, message: "No item providen" });

	try {
		const dUser = await getDiscordUser(ctx.params.token);
		let alphaUser = alphaUsers.find(
			(aU: { userId: string }) => aU.userId === dUser.id
		);
		let betaUser = betaUsers.find(
			(bU: { userId: string }) => bU.userId === dUser.id
		);

		let dItem = downloads.find((d: any) => d.item === ctx.params.item);

		if (dItem) {
			if (alphaUser) return (ctx.response.body = dItem);
			else if (betaUser && ctx.params.item === "beta")
				return (ctx.response.body = dItem);
			else
				return (ctx.response.body = {
					error: 3,
					message: `User doesn't have ${ctx.params.item} access.`
				});
		}
	} catch (err) {
		ctx.response.status = 401;
	}
};

export const config = {
	routes: ["/downloads", "/downloads/:token", "/downloads/:token/:item"]
};
