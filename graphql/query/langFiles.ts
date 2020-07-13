import { cache } from "../../util/cacheManager.ts";

export default async function (
	parent: any,
	params: { lang?: string; project?: string },
	context: any,
	info: any
) {
	return cache.get("langFiles").filter((lF: any) => {
		let checksToPass = 2,
			checksThatPassed = 0;

		if (params.lang) {
			if (lF.lang === params.lang) checksThatPassed++;
		} else checksThatPassed++;

		if (params.project) {
			if (lF.project === params.project) checksThatPassed++;
		} else checksThatPassed++;

		return checksToPass === checksThatPassed;
	});
}
