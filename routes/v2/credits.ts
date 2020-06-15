import { RouterContext } from "https://deno.land/x/oak/mod.ts";

export const handler = async (ctx: RouterContext) => {
	//@ts-ignore
	console.log(this);

	const cacheManager: any = "cum";

	if (ctx.params.id) {
		const user = cacheManager
			.get("credits")
			.find((c: any) => c.userId === ctx.params.id);
		if (!user) {
			ctx.response.status = 404;
			ctx.response.body = { error: 2, message: "User not found." };
			return;
		}
		ctx.response.status = 200;
		ctx.response.body = user;
		return;
	}

	ctx.response.body = cacheManager.get("credits");
	ctx.response.status = 200;
};

export const config = {
	routes: ["/credits", "/credits/:id"]
};
