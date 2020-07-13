import { RouterContext } from "https://deno.land/x/oak/mod.ts";
import { mongo } from "../../util/mongoConnection.ts";

export const handler = async (ctx: RouterContext) => {
	if (!ctx.params.userId)
		return (ctx.response.body = { error: 1, message: "No userId providen." });

	try {
		let user =
			Object.keys(
				await mongo.findOne(
					"PreMiD",
					"betaUsers",
					{ userId: ctx.params.userId },
					{ projection: { _id: false, keysLeft: false } }
				)
			).length ||
			Object.keys(
				await mongo.findOne(
					"PreMiD",
					"alphaUsers",
					{ userId: ctx.params.userId },
					{ projection: { _id: false } }
				)
			).length;

		ctx.response.body = { access: user ? true : false };
	} catch (err) {
		ctx.response.status = 500;
	}
};

export const config = {
	routes: ["/betaAccess", "/betaAccess/:userId"]
};
