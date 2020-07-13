import { RouterContext } from "https://deno.land/x/oak/mod.ts";
import { cache } from "../../util/cacheManager.ts";

export const handler = async (ctx: RouterContext) => {
	ctx.response.body = { users: cache.get("science").length };
	ctx.response.status = 200;
};

export const config = {
	routes: ["/usage"]
};
