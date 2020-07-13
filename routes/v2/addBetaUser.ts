import { RouterContext } from "https://deno.land/x/oak/mod.ts";
import { cache } from "../../util/cacheManager.ts";
import { mongo } from "../../util/mongoConnection.ts";
import getDiscordUser from "../../util/functions/getDiscordUser.ts";

export const handler = async (ctx: RouterContext) => {
	let betaUsers = cache.get("betaUsers");
	let discordUsers = cache.get("discordUsers");

	if (!ctx.params.token) {
		ctx.response.body = { error: 1, message: "No token providen." };
		ctx.response.status = 401;
		return;
	}

	try {
		let dUser: DiscordUser = await getDiscordUser(ctx.params.token);
		let user = Object.keys(
			await mongo.findOne("PreMiD", "betaUsers", { userId: dUser.id })
		);
		let DGuildUser = Object.keys(
			await mongo.findOne("PreMiD", "discordUsers", { userId: dUser.id })
		);

		if (betaUsers.length < 200) {
			if (user.length !== 0)
				return (ctx.response.body = {
					error: 3,
					message: "User already has beta access."
				});
			else if (user.length == 0 && DGuildUser.length != 0) {
				await mongo.insertOne("PreMiD", "betaUsers", { userId: dUser.id });
				ctx.response.status = 200;
			} else {
				ctx.response.body = {
					error: 4,
					message: "User is not in the Discord Server."
				};
				ctx.response.status = 400;
				return;
			}
		} else {
			ctx.response.body = {
				error: 5,
				message: "No more beta access slots available."
			};
			ctx.response.status = 400;
		}
	} catch (err) {
		ctx.response.status = 401;
	}
};

interface DiscordUser {
	id: string;
	username: string;
	avatar: string;
	discriminator: string;
	email: string;
	verified: boolean;
	locale: string;
	mfa_enabled: boolean;
	flags: number;
	premium_type: number;
}

export const config = {
	routes: ["/addBetaUser", "/addBetaUser/:token"]
};
