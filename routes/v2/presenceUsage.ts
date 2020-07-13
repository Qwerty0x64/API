import { RouterContext } from "https://deno.land/x/oak/mod.ts";
import { cache } from "../../util/cacheManager.ts";
import { PMD_Science } from "../../@types/science.d.ts";

let science = prepareUsage(cache.get("science") as PMD_Science[]);

cache.on("update", (_, data) => (science = prepareUsage(data)), {
	only: "science"
});

//* Request Handler
export const handler = async (ctx: RouterContext) => {
	ctx.response.body = science;
};

export function prepareUsage(science: PMD_Science[]) {
	let ranking: any = {};

	([] as string[]).concat
		.apply(
			[],
			science.map(s => s.presences)
		)
		.map(x => {
			ranking[x] = (ranking[x] || 0) + 1;
		});

	return ranking;
}

export const config = {
	routes: "/presenceUsage"
};
