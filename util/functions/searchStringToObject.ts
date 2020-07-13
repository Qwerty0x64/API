import { RouterContext } from "https://deno.land/x/oak/mod.ts";

export default function (ctx: RouterContext) {
	try {
		return JSON.parse(
			'{"' +
				decodeURI(
					ctx.request.url.search
						.slice(1)
						.replace(/&/g, '","')
						.replace(/=/g, '":"')
				) +
				'"}'
		);
	} catch (_) {
		return {};
	}
}
