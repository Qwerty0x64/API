import { RouterContext } from "https://deno.land/x/oak/mod.ts";
import { cache } from "../../util/cacheManager.ts";

export const handler = async (ctx: RouterContext) => {
	let langFiles = prepareLangFiles(cache.get("langFiles") as Array<langFile>);

	if (ctx.request.url.pathname.endsWith("/list") && !ctx.params.project) {
		ctx.response.body = langFiles
			.filter(lF => lF.project === "extension")
			.map(lF => {
				let lang = lF.lang;

				switch (lang!.toLowerCase()) {
					case "ja":
						lang = "ja_JP";
						break;
					case "zh-cn":
						lang = "zh_CN";
						break;
					case "zh-tw":
						lang = "zh_TW";
						break;
					case "ko":
						lang = "ko_KR";
						break;
					default:
						break;
				}

				return lang;
			});
	}

	let langFile: langFile | undefined;

	if (ctx.params.project) {
		let pParam = ctx.params.project.toLowerCase();

		if (
			ctx.params.project &&
			["extension", "website", "presence"].includes(pParam)
		) {
			langFile = langFiles.find(
				lF => lF.project === ctx.params.project && lF.lang === ctx.params.lang
			);
		} else {
			const masterLangFile: langFile | undefined = langFiles.find(
				lF => lF.project === "presence" && lF.lang === "en"
			);

			const masterLangKeys = Object.keys(masterLangFile!.translations);

			if (!masterLangKeys.find(key => key.startsWith(`${pParam}_`))) {
				ctx.response.status = 404;
				return;
			}

			if (ctx.request.url.pathname.endsWith("/list")) {
				let referenceKeys = masterLangKeys.filter(
					keyName =>
						keyName.startsWith(`${pParam}_`) || keyName.startsWith(`general_`)
				);
				let locales: Array<any> = [];
				for (const langFile of langFiles.filter(
					lF => lF.project === "presence"
				)) {
					let fileKeys = Object.keys(langFile.translations).filter(
						lF => lF.startsWith(`${pParam}_`) || lF.startsWith(`general_`)
					);

					if (fileKeys.length === referenceKeys.length) {
						locales.push(langFile.lang);
					}
				}
				return (ctx.response.body = locales);
			} else if (ctx.params.lang) {
				let allStrings = langFiles.find(
					lF => lF.project === "presence" && lF.lang === ctx.params.lang
				);
				if (!allStrings) {
					return (ctx.response.status = 404);
				}
				allStrings = formatLangFile(allStrings);
				let strings: any = {};

				for (const key of Object.keys(allStrings!)) {
					if (key.startsWith(`${pParam}.`)) {
						//@ts-ignore
						strings[key] = allStrings[key];
					}
				}
				return (ctx.response.body = strings);

				for (const key of Object.keys(allStrings!)) {
					if (key.startsWith(`${pParam}.`)) {
						//@ts-ignore
						strings[key] = allStrings[key];
					}
				}
			}
			ctx.response.status = 404;
			return;
		}

		if (!langFile) {
			ctx.response.body = { error: 6, message: "No translations found." };
			return;
		}

		langFile = { translations: langFile.translations };

		ctx.response.body = formatLangFile(langFile);
	}
};

interface langFile {
	lang?: string;
	project?: string;
	translations: { [lang: string]: string };
}

function formatLangFile(langFile: langFile) {
	return Object.assign(
		{},
		...Object.keys(langFile.translations).map((translationKey: any) => {
			const newKey = translationKey.replace(/[_]/g, ".");
			return {
				[newKey]: langFile.translations[translationKey]
			};
		})
	);
}

function prepareLangFiles(langFiles: Array<langFile>) {
	langFiles.forEach(lF => {
		if (lF.project !== "extension") return;

		switch (lF.lang) {
			case "ja_JP":
				lF.lang = "ja";
				break;
			case "zh_CN":
				lF.lang = "zh-CN";
				break;
			case "zh_TW":
				lF.lang = "zh-TW";
				break;
			case "zh_HK":
				lF.lang = "zh-TW";
				break;
			case "ko_KR":
				lF.lang = "ko";
				break;
		}
	});

	return langFiles;
}

export const config = {
	routes: [
		"/langFile/list",
		"/langFile/:project/:lang",
		"/langFile/:project/list"
	]
};
