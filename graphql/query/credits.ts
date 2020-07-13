import { cache } from "../../util/cacheManager.ts";

let creditsCache = prepareCredits(cache.get("credits"));

cache.on("update", (_, data) => (creditsCache = prepareCredits(data)), {
	only: "credits"
});

export default async function (
	parent: any,
	params: { id?: string; limit?: number; random?: boolean },
	context: any,
	info: any
) {
	let res = creditsCache;

	if (params.id) res = res.filter((c: any) => c.user.id === params.id);
	if (params.random) res = shuffle(res);
	if (params.limit) res = res.slice(0, params.limit);

	return res;
}

function prepareCredits(credits: any) {
	return credits.map((c: any) => ({
		user: {
			name: c.name,
			id: c.userId,
			tag: c.tag,
			avatar: c.avatar,
			status: c.status,
			flags: c.flags,
			premium_since: c.premium_since,
			role: c.role,
			roleId: c.roleId,
			roleColor: c.roleColor,
			rolePosition: c.rolePosition
		},
		highestRole: {
			id: c.roleId,
			name: c.role
		},
		roles: c.roles?.map((r: any, i: number) => ({ id: c.roleIds[i], name: r }))
	}));
}

function shuffle(array: Array<any>) {
	var currentIndex = array.length,
		temporaryValue: any,
		randomIndex: number;

	while (0 !== currentIndex) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
}
