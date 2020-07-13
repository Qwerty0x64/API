import { cache } from "../../util/cacheManager.ts";
import searchStringToObject from "../../util/functions/searchStringToObject.ts";
import { GQLError } from "https://deno.land/x/oak_graphql/mod.ts";
import getDiscordUser from "../../util/functions/getDiscordUser.ts";

export default async function (
	parent: any,
	params: { userId?: string },
	context: any,
	info: any
) {
	const search = searchStringToObject(context);

	if (!search.token) return new GQLError("No token providen.");

	try {
		const dUser = await getDiscordUser(search.token);

		if (
			!cache
				.get("credits")
				.find(
					(c: any) =>
						c.userId === dUser.id && c.roleIds.includes("566417964820070421")
				)
		)
			return new GQLError("User is not a support agent.");

		return params.userId
			? cache.get("tickets").filter((t: any) => t.userId === params.userId)
			: cache.get("tickets");
	} catch (err) {
		return new GQLError("Invalid token providen.");
	}
}
