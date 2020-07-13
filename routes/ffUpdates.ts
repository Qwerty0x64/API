import { cache } from "../util/cacheManager.ts";
import { RouterContext } from "https://deno.land/x/oak/mod.ts";

export const handler = async (ctx: RouterContext) => {
	ctx.response.body = {
		addons: {
			"support@premid.app": {
				updates: cache.get("ffUpdates")
			}
		}
	};
};

export const config = {
	routes: "/firefox/updates"
};
