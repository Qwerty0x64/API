import { walkSync } from "https://deno.land/std/fs/walk.ts";
import { join, dirname, basename } from "https://deno.land/std/path/mod.ts";
import { Router } from "https://deno.land/x/oak/mod.ts";

export default async function loadRoutes(router: Router) {
	for (const route of walkSync(join(Deno.cwd(), "./routes"), {
		exts: ["ts"],
		maxDepth: 2
	})) {
		try {
			const r = await import(`file:///${route.path}`),
				version =
					basename(dirname(route.path)) === "routes"
						? ""
						: "/" + basename(dirname(route.path));

			if (Array.isArray(r.config.routes))
				r.config.routes.forEach((r1: string) =>
					//@ts-ignore
					router[r.config.method || "get"](version + r1, r.handler)
				);
			else {
				//@ts-ignore
				router[r.config.method || "get"](version + r.config.routes, r.handler);
			}
		} catch (err) {
			console.error(err);
		}
	}
}
