import { readFile, writeFile } from "fs/promises";
import { homedir } from "os";
import path from "path";

type Key = string | number;

interface JsonObject {
	[key: Key]: JsonTypes | JsonObject;
}
type JsonTypes = string | number | JsonTypes[] | JsonObject | boolean | null;

class NatheneGlobal {
	dynamic: { [key: Key]: any };

	readonly plugin: NatheneGlobalPlugin;
	readonly config: NatheneGlobalConfig;

	constructor() {
		const configFile = await readFile(configPath, "utf-8");

		const config = JSON.parse(configFile);
	}

	modifyConfig(key: Key, value: JsonTypes, save = false) {
		this.config = value;
	}
}

interface NatheneGlobalConfig {
	[key: string | symbol | number]: any;
	pluginThreads: number;
}

interface NatheneGlobalPlugin {
	/**
	 * returns uuid
	 */
	register: (name: string) => string;
}

const configPath = path.join(homedir(), ".editor", "config.json");

/**
 * `parseAtheneConfig` needs to be run before this can be accessed
 * `parseAtheneConfig` can also be run to make this up-to-date
 */

declare global {
	var nathene: NatheneGlobal;
}

/**
 * needs to be run before NatheneGlobal is set!
 */
export const parseNatheneConfig = async () => {
	const configFile = await readFile(configPath, "utf-8");

	const config = JSON.parse(configFile);

	if (checkConfig(config)) {
		nathene.modifyConfig = config;
		return;
	}

	console.error("check config file for it's rightness");
};

const checkConfig = (input: any): input is NatheneGlobalConfig => {
	if (typeof input.pluginThreads !== "number") return false;
	return true;
};

/**
 * comparison against `addToNatheneGlobal`
 *
 * - adds to the actual config file
 * - calls `addToNatheneGlobal` internally
 * - cannot be called with a function as value
 * - is persistend
 */
export const addToNatheneConfig = async (
	key: string | number | symbol,
	value: any
) => {
	if (value instanceof Function)
		throw new TypeError("a function cannot be parsed into config");

	addToNatheneGlobal(key, value);

	const config = JSON.stringify(NatheneGlobal);

	await writeFile(configPath, config, "utf-8");
};

/**
 * comparison against `addToNatheneConfig`
 *
 * - add to NatheneGlobal object everthing you want
 * - can be called with a function as value
 * - is not persistend
 *   - this can change however
 *
 */
export const modifyNatheneGlobalDynamic = (
	key: string | number | symbol,
	value: any
) => {
	nathene.dynamic[key] = value;
};
