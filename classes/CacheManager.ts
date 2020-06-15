import { resolve, join } from "https://deno.land/std/path/mod.ts";
import {
	existsSync,
	readJsonSync,
	readFileStrSync,
	writeJsonSync
} from "https://deno.land/std/fs/mod.ts";

interface CacheManagerOptions {
	/**
	 * Stores the cache only in memory, if disabled will create a cache on disk to serve as a redundancy layer in case of an unexpected shutdown.
	 * Will restore the cache on startup and load its expire times
	 */
	memoryOnly?: boolean;
	/**
	 * Expire check interval
	 */
	checkInterval?: number;
	/**
	 * The time in miliseconds for when a new cache without an assigned expire date is counted as outdated, if it's outdated it will fire an outdated event
	 */
	defaultExpire?: number;
	/**
	 * Changes the default cache folder from process.cwd() + .cache
	 * Will be ingored when memoryOnly is true
	 */
	cacheDirectory?: string;
	/**
	 * Whether to discard any corrupt cache files on startup.
	 */
	discardTamperedCache?: boolean;
}

interface CacheListenerOptions {
	only?: string | Array<string>;
}

interface CacheEntry {
	// Any json object
	data: { [x: string]: any };
	// When the obkect will expire
	expires: number;
}

export default class CacheManager {
	private internalCache: { [x: string]: CacheEntry } = {};
	private listeners: Array<{
		event: string;
		callback: Function;
		options?: CacheListenerOptions;
	}> = [];
	private firedOutdatedCaches: string[] = [];

	/**
	 * Stores the cache only in memory, if disabled will create a cache on disk to serve as a redundancy layer in case of an unexpected shutdown.
	 * Will restore the cache on startup and load its expire times
	 */
	memoryOnly = true;
	/**
	 * Changes the default cache folder from process.cwd() + .cache
	 * Will be ingored when memoryOnly is true
	 */
	cacheDirectory = resolve(join(Deno.cwd(), ".cache/"));
	/**
	 * The time in miliseconds for when a new cache without an assigned expire date is counted as outdated, if it's outdated it will fire an outdated event
	 */
	defaultExpire = 5 * 60 * 1000;
	/**
	 * Expire check interval
	 */
	checkInterval = 250;
	/**
	 * Whether to discard any corrupt cache files on startup.
	 */
	discardTamperedCache = false;

	/**
	 * Creates a new instance of CacheManager
	 * @param options CacheManager options
	 */
	constructor(options?: CacheManagerOptions) {
		if (typeof options?.memoryOnly !== "undefined")
			this.memoryOnly = options.memoryOnly;

		if (options?.cacheDirectory) this.cacheDirectory = options.cacheDirectory;

		if (options?.defaultExpire) this.defaultExpire = options.defaultExpire;

		if (options?.checkInterval) this.checkInterval = options.checkInterval;

		if (options?.discardTamperedCache)
			this.discardTamperedCache = options.discardTamperedCache;

		setInterval(() => {
			for (let i = 0; this.keys().length > i; i++) {
				if (Date.now() > this.values()[i].expires)
					this.listeners
						.filter(
							l =>
								l.event === "outdated" &&
								(l.options?.only
									? Array.isArray(l.options.only)
										? l.options.only.find(
												o => o === Object.keys(this.internalCache)[i]
										  )
										: l.options.only === Object.keys(this.internalCache)[i]
									: true)
						)
						.forEach(l => {
							if (
								this.firedOutdatedCaches.includes(
									Object.keys(this.internalCache)[i]
								) ||
								!this.isExpired(Object.keys(this.internalCache)[i])
							)
								return;

							this.firedOutdatedCaches.push(Object.keys(this.internalCache)[i]);

							l.callback(
								Object.keys(this.internalCache)[i],
								(<CacheEntry>Object.values(this.internalCache)[i]).data
							);
						});
			}
		}, this.checkInterval);

		if (this.memoryOnly) return;

		if (!existsSync(this.cacheDirectory)) Deno.mkdirSync(this.cacheDirectory);
		else {
			const cachesToRead = Deno.readDirSync(this.cacheDirectory);

			for (let cTR of cachesToRead) {
				try {
					let data = readJsonSync(
						join(this.cacheDirectory, cTR.name, "data.json")
					) as CacheEntry;

					this.internalCache[cTR.name] = {
						data,
						expires: parseInt(
							readFileStrSync(join(this.cacheDirectory, cTR.name, "expires"))
						)
					};
				} catch (err) {
					if (this.discardTamperedCache)
						Deno.removeSync(join(this.cacheDirectory, cTR.name), {
							recursive: true
						});
				}
			}
		}
	}

	/**
	 * Set a value in the cache.
	 * @param name cache name
	 * @param data cache's data
	 * @param expires expire time of cache in miliseconds
	 */
	set(name: string, data: any, expires: number = this.defaultExpire) {
		expires += Date.now();

		this.firedOutdatedCaches = this.firedOutdatedCaches.filter(c => c !== name);

		this.internalCache[name] = {
			data,
			expires
		};

		this.listeners
			.filter(
				l =>
					l.event === "update" &&
					(l.options?.only
						? Array.isArray(l.options.only)
							? l.options.only.find(o => o === name)
							: l.options.only === name
						: true)
			)
			.forEach(l => {
				l.callback(name, data);
			});

		if (this.memoryOnly) return;

		if (!existsSync(join(this.cacheDirectory, name)))
			Deno.mkdirSync(join(this.cacheDirectory, name));

		writeJsonSync(join(this.cacheDirectory, name, "data.json"), data);
		Deno.writeTextFileSync(
			join(this.cacheDirectory, name, "expires"),
			expires.toString()
		);
	}

	/**
	 * Get the data of a cached object
	 * @param name cache name
	 */
	get(name: string) {
		return this.internalCache[name]?.data;
	}

	/**
	 * Check if the given cache has expired
	 * @param name cache name
	 */
	isExpired(name: string) {
		return this.internalCache[name]
			? Date.now() > this.internalCache[name].expires
			: true;
	}

	/**
	 * Returns all cached keys
	 */
	keys() {
		return Object.keys(this.internalCache);
	}

	/**
	 * Returns all cached values
	 */
	values() {
		return Object.values(this.internalCache);
	}

	/**
	 * Returns all entries
	 */
	entires() {
		return Object.entries(this.internalCache);
	}

	/**
	 * Listen to events
	 * @param event event name
	 * @param callback callback function
	 * @param options options
	 */
	on(
		event: "update" | "outdated",
		callback: (name: string, data?: any) => void,
		options?: CacheListenerOptions
	) {
		this.listeners.push({ event, callback, options });
	}
}
