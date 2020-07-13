export default async function (name: string) {
	return Object.assign(
		{},
		...(await Promise.all(
			Array.from(Deno.readDirSync(`graphql/${name}`)).map(async entry => {
				return {
					[entry.name.replace(".ts", "")]: (
						await import(`file:///${Deno.cwd()}/graphql/${name}/${entry.name}`)
					).default
				};
			})
		))
	);
}
