import getDiscordUser from "../../util/functions/getDiscordUser.ts";
import { cache } from "../../util/cacheManager.ts";
import { GQLError } from "https://deno.land/x/oak_graphql/mod.ts";

export default async function (
	parent: any,
	params: { userId?: string; token: string },
	context: any,
	info: any
) {
	try {
		const dUser = await getDiscordUser(params.token);

		if (
			cache
				.get("credits")
				.find(
					(u: any) =>
						u.userId === dUser.id && u.roleIds.includes("685969048399249459")
				)
		)
			return params.userId
				? cache
						.get("applications")
						.filter((a: any) => a.userId === params.userId)
				: cache.get("applications");
	} catch (err) {
		return new GQLError("Invalid token providen");
	}
}
