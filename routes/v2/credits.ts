import { RouterContext } from "https://deno.land/x/oak/mod.ts";
import { cache } from "../../util/cacheManager.ts";

export const handler = async (ctx: RouterContext) => {
	if (ctx.params.id) {
		const user = cache
			.get("credits")
			.find((c: any) => c.userId === ctx.params.id);
		if (!user) {
			ctx.response.status = 404;
			ctx.response.body = { error: 1, message: "User not found." };
			return;
		}
		ctx.response.status = 200;
		ctx.response.body = user;
		return;
	}

	ctx.response.body = cache.get("credits");
	ctx.response.status = 200;
};

export const config = {
	routes: ["/credits", "/credits/:id"]
};
