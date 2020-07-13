import { RouterContext } from "https://deno.land/x/oak/mod.ts";
import { cache } from "../../util/cacheManager.ts";
import getDiscordUser from "../../util/functions/getDiscordUser.ts";
import { mongo } from "../../util/mongoConnection.ts";

export const handler = async (ctx: RouterContext) => {
	let bodyData = await ctx.request.body();

	if (
		!bodyData.value.type ||
		!bodyData.value.name ||
		!bodyData.value.link ||
		!bodyData.value.description ||
		!bodyData.value.imageLink ||
		!bodyData.value.token
	) {
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
			pType: bodyData.value.type,
			name: bodyData.value.name,
			link: bodyData.value.link,
			description: bodyData.value.description,
			imageLink: bodyData.value.imageLink
		});

		let webhookURL = `https://discordapp.com/api/webhooks/${Deno.env.get(
			"DISCORD_WEBHOOK_ID"
		)}/${Deno.env.get("DISCORD_WEBHOOK_TOKEN")}`;

		let embeds = [
			{
				title: `Partner Application (${bodyData.value.type})`,
				description: `By <@${dUser.id}>`,
				fields: [
					{
						name: "Type",
						value: bodyData.value.type,
						inline: false
					},
					{
						name: "Name",
						value: bodyData.value.name,
						inline: false
					},
					{
						name: "URL",
						value: bodyData.value.link,
						inline: false
					},
					{
						name: "Description",
						value: bodyData.value.description,
						inline: false
					}
				],
				thumbnail: {
					url: `https://cdn.discordapp.com/avatars/${dUser.id}/${dUser.avatar}.png`
				},
				image: {
					url: bodyData.value.imageLink
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
