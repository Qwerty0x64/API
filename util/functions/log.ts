import { bgCyan } from "https://deno.land/std/fmt/colors.ts";

export default function log(message: any) {
	console.log(`${bgCyan(" API ")} ${message}`);
}
