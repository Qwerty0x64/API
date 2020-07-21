import { RouterContext } from "https://deno.land/x/oak/mod.ts";
import { mongo } from "../../index.ts";

let queue: { identifier: string; data: any }[] = [];

setInterval(async () => {
	const itemsToProcess = queue;

	//TODO Use bulkwrite (Broken rn for unknown reason)
	for (let i = 0; i < itemsToProcess.length; i++) {
		await mongo.findOneAndUpdate(
			Deno.env.get("MONGO_DB")!,
			"science",
			{
				identifier: itemsToProcess[i].identifier
			},
			{ $set: itemsToProcess[i].data },
			{ upsert: true }
		);
	}

	queue = queue.filter(
		q => !itemsToProcess.find(i => i.identifier === q.identifier)
	);
}, 60 * 1000);

export const handler = async (ctx: RouterContext) => {
	let bodyData = await ctx.request.body().value!;

	if (
		!bodyData.identifier ||
		typeof bodyData.identifier !== "string" ||
		!bodyData.presences ||
		!Array.isArray(bodyData.presences)
	) {
		ctx.response.status = 400;
		return;
	}

	let data: any = {
		identifier: bodyData.identifier,
		presences: bodyData.presences,
		updated: Date.now()
	};

	if (bodyData.platform) data.platform = bodyData.platform;

	queue.push({
		identifier: bodyData.identifier,
		data
	});

	ctx.response.status = 200;
};

export const config = {
	routes: "/science",
	method: "post"
};
