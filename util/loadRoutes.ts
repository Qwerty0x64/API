import { walkSync } from "https://deno.land/std/fs/walk.ts";
import { join } from "https://deno.land/std/path/mod.ts";
import { Router } from "https://deno.land/x/oak/mod.ts";

export default async function loadRoutes(router: Router) {
	for (const route of walkSync(join(Deno.cwd(), "./routes"), {
		exts: ["ts"],
		maxDepth: 2
	})) {
		try {
			const r = await import(`file:///${route.path}`);
			console.log(r);
			if (Array.isArray(r.config.routes))
				r.config.routes.forEach((r1: string) =>
					//@ts-ignore
					router[r.config.method || "get"](r1, ctx => r.handler.bind(this, ctx))
				);
			else {
				//@ts-ignore
				router[r.config.method || "get"](r.config.routes, ctx =>
					//@ts-ignore
					r.handler.bind(this, ctx)
				);
			}
		} catch (err) {
			console.log(err);
		}
	}
}
