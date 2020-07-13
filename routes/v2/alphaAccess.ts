import { RouterContext } from "https://deno.land/x/oak/mod.ts";
import { cache } from "../../util/cacheManager.ts";

export const handler = async (ctx: RouterContext) => {
	let alphaUsers = cache.get("alphaUsers");

	if (!ctx.params.userId)
		return (ctx.response.body = { error: 1, message: "No userId providen." });

	console.log(alphaUsers.find((u: any) => u.userId === ctx.params.userId));
};

export const config = {
	routes: ["/alphaAccess", "/alphaAccess/:userId"]
};
