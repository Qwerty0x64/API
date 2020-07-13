export default async function (token: string) {
	return new Promise<{
		id: string;
		username: string;
		avatar: string;
		discriminator: string;
		email: string;
		verified: boolean;
		locale: string;
		mfa_enabled: boolean;
		flags: number;
		premium_type: number;
	}>(async (resolve, reject) => {
		fetch("https://discord.com/api/users/@me", {
			headers: { Authorization: token }
		})
			.then(async res => {
				if (!res.ok) reject(await res.json());
				else resolve(await res.json());
			})
			.catch(reject);
	});
}
