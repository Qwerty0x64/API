import { RouterContext } from "https://deno.land/x/oak/mod.ts";
import { cache } from "../../util/cacheManager.ts";

export const handler = async (ctx: RouterContext) => {
	ctx.response.body = cache.get("sponsors");
};

export const config = {
	routes: "/sponsors"
};
