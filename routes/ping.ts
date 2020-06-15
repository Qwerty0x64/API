import { RouterContext } from "https://deno.land/x/oak/mod.ts";

export const handler = async (context: RouterContext) => {
	context.response.status = 200;
	context.response.body = "OK";
};

export const config = {
	routes: "/ping"
};
