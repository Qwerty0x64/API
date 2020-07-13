import { RouterContext } from "https://deno.land/x/oak/mod.ts";
import { cache } from "../../util/cacheManager.ts";

export const handler = async (ctx: RouterContext) => {
	let betaUsers = cache.get("betaUsers");

	ctx.response.body = {
		betaUsers: betaUsers.length
	};
};

export const config = {
	routes: "/betaUsers"
};
