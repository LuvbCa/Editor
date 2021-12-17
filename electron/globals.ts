import { readFile, writeFile } from "fs/promises";
import { homedir } from "os";
import path from "path";

interface NatheneGlobal {
	[key: string | symbol | number]: any;
	pluginThreads: number;
}

const configPath = path.join(homedir(), ".editor", "config.json");

/**
 * `parseAtheneConfig` needs to be run before this can be accessed
 * `parseAtheneConfig` can also be run to make this up-to-date
 */
export let NatheneGlobal: NatheneGlobal;

/**
 * needs to be run before NatheneGlobal is set!
 */
export const parseNatheneConfig = async () => {
	const configFile = await readFile(configPath, "utf-8");

	const config = JSON.parse(configFile);

	if (checkConfig(config)) {
		NatheneGlobal = config;
		return;
	}

	console.error("check config file for it's rightness");
};

const checkConfig = (input: any): input is NatheneGlobal => {
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
export const addToNatheneGlobal = (
	key: string | number | symbol,
	value: any
) => {
	if (NatheneGlobal[key]) throw new TypeError("choose a different key");
	NatheneGlobal[key] = value;
};
