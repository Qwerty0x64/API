import { RouterContext } from "https://deno.land/x/oak/mod.ts";
import { cache } from "../../util/cacheManager.ts";
import getDiscordUser from "../../util/functions/getDiscordUser.ts";

export const handler = async (ctx: RouterContext) => {
	const credits = cache.get("credits"),
		applications = cache.get("applications");

	if (!ctx.params.token) {
		ctx.response.status = 401;
		ctx.response.body = { error: 1, message: "No token providen." };
		return;
	}

	try {
		const dUser = await getDiscordUser(ctx.params.token);
		let user = credits.find((u: any) => u.userId === dUser.id);

		//* Check if the user has the Staff Head role
		if (user.roleIds.includes("685969048399249459")) {
			ctx.response.body = applications;
		} else ctx.response.status = 401;
	} catch (err) {
		console.log(err);
		ctx.response.status = 401;
	}
};

export const config = {
	routes: ["/applications", "/applications/:token"]
};
