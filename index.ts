import "https://deno.land/x/denv/mod.ts";
import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { Snelm } from "https://deno.land/x/snelm/mod.ts";
import loadRoutes from "./util/functions/loadRoutes.ts";
import { mongo } from "./util/mongoConnection.ts";
import { applyGraphQL, gql } from "https://deno.land/x/oak_graphql/mod.ts";
import { prepareCache } from "./util/cacheManager.ts";
import { green, cyan, yellow } from "https://deno.land/std/fmt/colors.ts";
import log from "./util/functions/log.ts";
import loadResolver from "./util/functions/loadResolver.ts";

export const server = new Application(),
	router = new Router();

//* Deno.hostname is slow af
const hostname = Deno.hostname();
server.use(async (ctx, next) => {
	//* Response time header
	let resTime = performance.now();

	ctx.response = new Snelm("oak", {
		hidePoweredBy: null
	}).snelm(ctx.request, ctx.response);
	ctx.response.headers.set("X-PreMiD-Host", hostname);

	//* Don't set content type on /v3 routes
	if (ctx.request.url.pathname !== "/v3")
		ctx.response.headers.set("Content-Type", "application/json");

	//* Await execution of "next"
	const n = await next();

	//* Append response time header
	ctx.response.headers.set(
		"X-Response-Time",
		(performance.now() - resTime).toString()
	);

	//* Return next > resolves issues with async functions inside routes
	return n;
});

//* Use router
server.use(router.routes());
//* Use allowed Methods > Results in 405 Method not allowed
server.use(router.allowedMethods());

//* Connect to db > prepare cache > load routes > listen
log(yellow("Connecting to MongoDB..."));
await mongo.connect();
log(green("MongoDB connected"));
await prepareCache();
loadRoutes(router);

//* v3 GraphQL API
const GraphQLService = await applyGraphQL({
	path: "/v3",
	typeDefs: (gql as any)(
		Deno.readTextFileSync("graphql/schema.graphql") as any
	),
	resolvers: {
		Query: await loadResolver("query"),
		Mutation: await loadResolver("mutation")
	},
	context: ctx => ctx
});

server.use(GraphQLService.routes(), GraphQLService.allowedMethods());

server.listen({ port: 3001 });
log(green(`Listening on port ${cyan("3001")}`));
