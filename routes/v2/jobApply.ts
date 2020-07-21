import { RouterContext } from "https://deno.land/x/oak/mod.ts";
import getDiscordUser from "../../util/functions/getDiscordUser.ts";
import { mongo } from "../../index.ts";

export const handler = async (ctx: RouterContext) => {
	let bodyData = await ctx.request.body().value;

	if (!bodyData.token || !bodyData.questions) {
		ctx.response.status = 400;
		ctx.response.body = {
			error: 1,
			message: "Missing fields."
		};
		return;
	}

	try {
		const dUser = await getDiscordUser(bodyData.token);

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
				name: bodyData.position,
				questions: bodyData.questions
			}
		});

		let webhookURL = `https://discordapp.com/api/webhooks/${Deno.env.get(
			"DISCORD_WEBHOOK_ID"
		)}/${Deno.env.get("DISCORD_WEBHOOK_TOKEN")}`;

		let embeds = [
			{
				title: `Job Application (${bodyData.position})`,
				description: `By <@${dUser.id}>`,
				fields: bodyData.questions.map((q: any) => {
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
