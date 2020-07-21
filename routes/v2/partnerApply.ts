import { RouterContext } from "https://deno.land/x/oak/mod.ts";
import getDiscordUser from "../../util/functions/getDiscordUser.ts";
import { mongo } from "../../index.ts";

export const handler = async (ctx: RouterContext) => {
	let bodyData = await ctx.request.body().value!;

	if (
		!bodyData.type ||
		!bodyData.name ||
		!bodyData.link ||
		!bodyData.description ||
		!bodyData.imageLink ||
		!bodyData.token
	) {
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
				mongo.findOne("PreMiD", "applications", {
					type: "partner",
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
			type: "partner",
			userId: dUser.id,
			reviewed: false,
			pType: bodyData.type,
			name: bodyData.name,
			link: bodyData.link,
			description: bodyData.description,
			imageLink: bodyData.imageLink
		});

		let webhookURL = `https://discordapp.com/api/webhooks/${Deno.env.get(
			"DISCORD_WEBHOOK_ID"
		)}/${Deno.env.get("DISCORD_WEBHOOK_TOKEN")}`;

		let embeds = [
			{
				title: `Partner Application (${bodyData.type})`,
				description: `By <@${dUser.id}>`,
				fields: [
					{
						name: "Type",
						value: bodyData.type,
						inline: false
					},
					{
						name: "Name",
						value: bodyData.name,
						inline: false
					},
					{
						name: "URL",
						value: bodyData.link,
						inline: false
					},
					{
						name: "Description",
						value: bodyData.description,
						inline: false
					}
				],
				thumbnail: {
					url: `https://cdn.discordapp.com/avatars/${dUser.id}/${dUser.avatar}.png`
				},
				image: {
					url: bodyData.imageLink
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
	routes: "/partnerApply",
	method: "post"
};
