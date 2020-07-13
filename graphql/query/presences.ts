import { cache } from "../../util/cacheManager.ts";
import { prepareUsage } from "../../routes/v2/presenceUsage.ts";
import { preparePresences as imgurReplace } from "../../routes/v2/presences.ts";

let science = cache.get("science") as PMD_Science[],
	presencesCache = preparePresences(cache.get("presences"));

cache.on("update", (_, data) => (presencesCache = preparePresences(data)), {
	only: "presences"
});
cache.on("update", (_, data) => (science = data), {
	only: "science"
});

function preparePresences(cache: any) {
	const usage = prepareUsage(science);

	cache = cache.map((c: any) => {
		c.users = usage[c.metadata.service];
		return c;
	});
	return imgurReplace(cache);
}

export default async function (
	parent: any,
	params: {
		service?: string;
		author?: string;
		contributor?: string;
		start?: number;
		limit?: number;
		query?: string;
		tag?: string;
		altnames?: string | string[];
	},
	context: any,
	info: any
) {
	let result = presencesCache;

	result = result.filter((p: any) => {
		let checksToPass = 6,
			checksThatPassed = 0;

		if (params.service) {
			if (params.service === p.metadata.service) checksThatPassed++;
		} else checksThatPassed++;
		if (params.author) {
			if (params.author === p.metadata.author.id) checksThatPassed++;
		} else checksThatPassed++;
		if (params.contributor) {
			if (
				p.metadata.contributors &&
				p.metadata.contributors.find((c: any) => c.id === params.contributor)
			)
				checksThatPassed++;
		} else checksThatPassed++;
		if (params.query) {
			if (p.metadata.service.toLowerCase().includes(params.query.toLowerCase()))
				checksThatPassed++;
		} else checksThatPassed++;
		if (params.tag) {
			if (
				!Array.isArray(p.metadata.tags) &&
				p.metadata.tags.toLowerCase() === params.tag.toLowerCase()
			)
				checksThatPassed++;
			else if (
				Array.isArray(p.metadata.tags) &&
				p.metadata.tags.find(
					(t: string) => t.toLowerCase() === params.tag!.toLowerCase()
				)
			)
				checksThatPassed++;
		} else checksThatPassed++;
		if (params.altnames) {
			if (Array.isArray(params.altnames)) {
				if (
					params.altnames.find(a =>
						p.metadata.altnames?.find(
							(aN: string) => aN.toLowerCase() === a.toLowerCase()
						)
					)
				)
					checksThatPassed++;
			} else if (
				p.metadata.altnames?.find(
					(aN: string) =>
						aN.toLowerCase() === (params.altnames as string).toLowerCase()
				)
			)
				checksThatPassed++;
		} else checksThatPassed++;

		return checksToPass === checksThatPassed;
	});

	if (params.start) result = result.slice(params.start, result.length);
	if (params.limit) result = result.slice(0, params.limit);

	return result;
}
