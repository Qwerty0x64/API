import { cache } from "../../util/cacheManager.ts";

export default async function (
	parent: any,
	params: { version?: string },
	context: any,
	info: any
) {
	if (params.version)
		return cache
			.get("changelog")
			.filter((c: any) => c.version === params.version);
	else return cache.get("changelog");
}
