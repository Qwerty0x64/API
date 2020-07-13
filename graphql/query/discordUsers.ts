import { cache } from "../../util/cacheManager.ts";

export default async function (
	parent: any,
	params: { userId?: string },
	context: any,
	info: any
) {
	if (params.userId)
		return cache
			.get("discordUsers")
			.filter((c: any) => c.userId === params.userId);
	else return cache.get("discordUsers");
}
