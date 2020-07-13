interface DiscordUser {
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
}
