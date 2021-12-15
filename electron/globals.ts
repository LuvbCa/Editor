import { readFile } from "fs/promises";
import { homedir } from "os";
import path from "path";

interface NatheneGlobal {
	pluginThreads: number;
}

/**
 * `parseAtheneConfig` needs to be run before this can be access
 * `parseAtheneConfig` can also be run to make this up-to-date
 */
export let NatheneGlobal: NatheneGlobal | null = null;

/**
 * needs to be run before NatheneGlobal is set!
 */
export const parseNatheneConfig = async () => {
	const configFilePath = path.join(homedir(), ".editor", "config.json");

	const configFile = await readFile(configFilePath, "utf-8");

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
