import { readFile } from "fs/promises";
import { Config } from "./types";

export const getConfigFile = async (): Promise<Config> => {
	const readConfigFile = await readFile("./config.json", "utf-8");

	const parsed = JSON.parse(readConfigFile);

	if (!isConfigFile(parsed))
		throw new Error("Config file is not properly configured.");

	return parsed;
};

export const isConfigFile = (input: any): input is Config => {
	if (!Array.isArray(input.servers)) return false;

	if (typeof input !== "object") return false;
	if (typeof input.platforms !== "object") return false;
	if (typeof input.runtimePort !== "number") return false;
	if (typeof input.serverDirectory !== "string") return false;

	return true;
};
