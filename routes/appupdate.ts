import { cache } from "../util/cacheManager.ts";
import { RouterContext } from "https://deno.land/x/oak/mod.ts";

let versions = prepare(cache.get("versions"));

cache.on("update", (_, data) => (versions = prepare(data)), {
	only: "versions"
});

export const handler = async (ctx: RouterContext) => {
	ctx.response.headers.set("Content-Type", "text/xml");
	ctx.response.body = versions;
};

function prepare(versions: any) {
	return Deno.readTextFileSync("data/appUpdate.xml")
		.replace("VERSIONID", versions[0].app.replace(/[.]/g, "").padStart(4, "0"))
		.replace("VERSION", versions[0].app);
}

export const config = {
	routes: ["/app/update", "/app/update/:bit"]
};
