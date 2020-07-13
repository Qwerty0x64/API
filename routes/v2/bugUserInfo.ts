import { RouterContext } from "https://deno.land/x/oak/mod.ts";
import { cache } from "../../util/cacheManager.ts";
import getDiscordUser from "../../util/functions/getDiscordUser.ts";
import { mongo } from "../../util/mongoConnection.ts";
import DiscordUser from "../../@types/DiscordUser.d.ts";

let bugs: Array<any> = [];

export const handler = async (ctx: RouterContext) => {
	if (!ctx.params.token) {
		ctx.response.status = 401;
		ctx.response.body = { error: 1, message: "No token providen." };

		return;
	}

	try {
		let dUser: DiscordUser = await getDiscordUser(ctx.params.token);

		bugs = await mongo.find("PreMiD", "bugs", {
			userId: dUser.id,
			status: "New"
		});

		if (bugs.length === 0) return (ctx.response.body = { count: 3 });
		else if (bugs.length >= 1 && bugs.length <= 3)
			return (ctx.response.body = { count: 3 - bugs.length, bugs: bugs });
		else return (ctx.response.status = 500);
	} catch (err) {
		ctx.response.status = 500;
	}
};

export const config = {
	routes: ["/bugUserInfo", "/bugUserInfo/:token"]
};
