import { RouterContext } from "https://deno.land/x/oak/mod.ts";

export const handler = async (context: RouterContext) =>
	context.response.redirect("https://docs.premid.app/");

export const config = {
	routes: "/"
};
