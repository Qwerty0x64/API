import { RouterContext } from "https://deno.land/x/oak/mod.ts";
import getDiscordUser from "../../util/functions/getDiscordUser.ts";
import { mongo } from "../../util/mongoConnection.ts";
import DiscordUser from "../../@types/DiscordUser.d.ts";

let bugInfo: any;

export const handler = async (ctx: RouterContext) => {
	let bodyData = (await ctx.request.body()).value;

	if (!ctx.params.token)
		return (ctx.response.body = { error: 1, message: "No token providen." });

	if (!bodyData.brief || !bodyData.description) {
		ctx.response.body = { error: 2, message: "Missing fields." };
		ctx.response.status = 449;
		return;
	}

	try {
		let dUser: DiscordUser = await getDiscordUser(ctx.params.token);

		bugInfo = await mongo.find(
			"PreMiD",
			"bugs",
			{
				userId: dUser.id,
				status: "New"
			},
			{ projection: { _id: false } }
		);

		if (bugInfo.length < 3) {
			await mongo.insertOne("PreMiD", "bugs", {
				brief: bodyData.brief,
				system: bodyData.system,
				description: bodyData.description,
				status: bodyData.status,
				date: bodyData.date,
				userName: `${dUser.username}#${dUser.discriminator}`,
				userId: dUser.id
			});
			ctx.response.status = 200;
		} else ctx.response.status = 429;
	} catch (err) {
		ctx.response.status = 500;
	}
};

export const config = {
	routes: ["/bugPost", "/bugPost/:token"],
	method: "post"
};
