import { cache } from "../../util/cacheManager.ts";
import searchStringToObject from "../../util/functions/searchStringToObject.ts";
import { GQLError } from "https://deno.land/x/oak_graphql/mod.ts";
import getDiscordUser from "../../util/functions/getDiscordUser.ts";
import { mongo } from "../../util/mongoConnection.ts";

export default async function (
	parent: any,
	params: { userId: string; accepted: boolean },
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
						c.userId === dUser.id && c.roleIds.includes("685969048399249459")
				)
		)
			return new GQLError("User is not a staff head.");

		const application = await mongo.findOne("PreMiD", "applications", {
			userId: params.userId
		});

		if (!application) return new GQLError("Application not found.");

		if (application.reviewed)
			return new GQLError("Application is already reviewed.");

		if (application.reviewers?.find((r: any) => r.userId === dUser.id))
			return new GQLError("You already reviewed this application.");

		try {
			await mongo.findOneAndUpdate(
				"PreMiD",
				"applications",
				{ userId: params.userId, reviewed: false },
				{
					$addToSet: {
						reviewers: {
							userId: dUser.id,
							accepted: params.accepted,
							reviewedAt: Date.now()
						}
					}
				}
			);

			return params;
		} catch (err) {
			return new GQLError("Unexpected error occured.");
		}
	} catch (err) {
		return new GQLError("Invalid token providen.");
	}

	return cache.get("benefits");
}
