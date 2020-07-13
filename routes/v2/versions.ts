import { RouterContext } from "https://deno.land/x/oak/mod.ts";
import { cache } from "../../util/cacheManager.ts";

export const handler = async (ctx: RouterContext) => {
	let versions = cache.get("versions")[0];
	delete versions.key;

	ctx.response.body = versions;
	ctx.response.status = 200;
};

export const config = {
	routes: ["/versions"]
};
