import { RouterContext } from "https://deno.land/x/oak/mod.ts";
import { cache } from "../../util/cacheManager.ts";
import getDiscordUser from "../../util/functions/getDiscordUser.ts";
import { mongo } from "../../util/mongoConnection.ts";

export const handler = async (ctx: RouterContext) => {
	let bodyData = await ctx.request.body();

	if (!bodyData.value.token || !bodyData.value.questions) {
		ctx.response.status = 400;
		ctx.response.body = {
			error: 1,
			message: "Missing fields."
		};
		return;
	}

	try {
		const dUser = await getDiscordUser(bodyData.value.token);

		if (
			Object.keys(
				await mongo.findOne("PreMiD", "applications", {
					type: "job",
					userId: dUser.id,
					reviewed: false
				})
			).length !== 0
		) {
			ctx.response.body = { error: 3, message: "You already applied before." };
			ctx.response.status = 400;

			return;
		}

		await mongo.insertOne("PreMiD", "applications", {
			type: "job",
			userId: dUser.id,
			reviewed: false,
			position: {
				name: bodyData.value.position,
				questions: bodyData.value.questions
			}
		});

		let webhookURL = `https://discordapp.com/api/webhooks/${Deno.env.get(
			"DISCORD_WEBHOOK_ID"
		)}/${Deno.env.get("DISCORD_WEBHOOK_TOKEN")}`;

		let embeds = [
			{
				title: `Job Application (${bodyData.value.position})`,
				description: `By <@${dUser.id}>`,
				fields: bodyData.value.questions.map((q: any) => {
					return {
						name: q.label,
						value: q.response ? q.response : "No response."
					};
				}),
				thumbnail: {
					url: `https://cdn.discordapp.com/avatars/${dUser.id}/${dUser.avatar}.png`
				}
			}
		];

		fetch(webhookURL, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ embeds })
		});

		ctx.response.status = 200;
	} catch (err) {
		ctx.response.status = 401;
	}
};

export const config = {
	routes: "/jobApply",
	method: "post"
};
