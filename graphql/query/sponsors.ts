import { cache } from "../../util/cacheManager.ts";

export default async function (
	parent: any,
	params: {},
	context: any,
	info: any
) {
	return cache.get("sponsors");
}
