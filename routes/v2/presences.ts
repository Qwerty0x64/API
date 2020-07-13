import { RouterContext } from "https://deno.land/x/oak/mod.ts";
import { cache } from "../../util/cacheManager.ts";

export const handler = async (ctx: RouterContext) => {
	const presences = preparePresences(cache.get("presences") as Array<Presence>);

	if (Object.keys(ctx.params).length == 0) {
		ctx.response.body = presences.map((p: Presence) => {
			return {
				name: p.name,
				url: p.url,
				metadata: p.metadata
			};
		});
	}

	if (ctx.params.presence === "versions" && !ctx.params.file) {
		ctx.response.body = presences.map((p: Presence) => {
			return {
				name: p.name,
				url: p.url,
				version: p.metadata.version
			};
		});

		return;
	}

	if (ctx.params.presence && !ctx.params.file) {
		let p = presences.find((p: Presence) => p.name === ctx.params.presence);

		if (p) {
			delete p.presenceJs;
			delete p.iframeJs;

			ctx.response.body = p;
		} else ctx.response.body = { error: 4, message: "Presence not found." };
	}

	if (ctx.params.presence && ctx.params.file) {
		let presence: Presence | undefined = presences.find(
			(p: Presence) => p.name === ctx.params.presence
		);

		if (!presence)
			return (ctx.response.body = { error: 4, message: "Presence not found." });

		if (ctx.params.file.endsWith(".js"))
			ctx.response.headers.set("content-type", "text/javascript");

		switch (ctx.params.file) {
			case "metadata.json":
				//* Show only the metadata file
				//@ts-ignore
				presence = { metadata: presence.metadata };
				break;
			case "presence.js":
				//* Show only the presence file
				//@ts-ignore
				presence = unescape(<string>presence.presenceJs);
				break;
			case "iframe.js":
				//* Show only the iframe file
				//@ts-ignore
				presence = presence.iframeJs;
				break;
			default:
				//* Send error
				ctx.response.body = { error: 5, message: "No such file." };
				ctx.response.status = 404;
				return;
		}

		ctx.response.body = presence;
	}
};

interface Presence {
	name: string;
	url: string;
	metadata: PresenceMetadata;
	presenceJs?: string;
	iframeJs?: string;
}

interface PresenceMetadata {
	author: {
		id: string;
		name: string;
	};
	service: string;
	description: { [langCode: string]: string };
	url: string | Array<string>;
	version: string;
	logo: string;
	thumbnail: string;
	iframe: boolean;
	color: string;
	tags: Array<string>;
	regExp?: RegExp | string;
	iFrameRegExp?: string;
	button?: boolean;
	warning?: boolean;
	settings?: Array<PresenceSetting>;
	category: string;
}

interface PresenceSetting {
	id: string;
	title: string;
	icon: string;
	value: string | boolean;
	placeholder?: string;
	if?: { [something: string]: string | boolean };
}

export function preparePresences(presences: Array<Presence>) {
	return presences.map((presence: Presence) => {
		if (
			presence.metadata.logo.includes("imgur.com") &&
			!presence.metadata.logo.includes("proxy.duckduckgo.com")
		)
			presence.metadata.logo = `https://proxy.duckduckgo.com/iu/?u=${presence.metadata.logo}`;
		if (
			presence.metadata.thumbnail.includes("imgur.com") &&
			!presence.metadata.thumbnail.includes("proxy.duckduckgo.com")
		)
			presence.metadata.thumbnail = `https://proxy.duckduckgo.com/iu/?u=${presence.metadata.thumbnail}`;

		return presence;
	});
}

export const config = {
	routes: ["/presences", "/presences/:presence", "/presences/:presence/:file"]
};
