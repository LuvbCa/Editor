import { readFile } from "fs/promises";
import { Config, Server } from "./types";

export const getConfigFile = async (): Promise<Config> => {
	const readConfigFile = await readFile("./config.json", "utf-8");

	const parsed = JSON.parse(readConfigFile);

	if (!isValidConfigFile(parsed))
		throw new Error("Config file is not properly configured.");

	return parsed;
};

export const isValidConfigFile = (config: any): config is Config => {
	if (!isConfig(config)) return false;

	for (const server of config.servers) {
		//conflict can't use node-builtin-ipc for non node processes
		if (
			!server.platform.includes("node") &&
			server.communication === "node-builtin-ipc"
		) {
			console.error("communication and platform conflict");
			return false;
		}
	}

	return true;
};

export const isConfig = (input: any): input is Config => {
	if (typeof input !== "object") return false;

	if (!Array.isArray(input.servers)) return false;

	if (typeof input.platforms !== "object") return false;

	if (typeof input.runtimePort !== "number") return false;

	if (typeof input.serverDirectory !== "string") return false;

	for (const server of input.servers) {
		if (!isServer(server)) return false;
	}

	return true;
};

export const isServer = (input: any): input is Server => {
	if (
		!(
			input.type == "windowServer" ||
			input.type == "uiServer" ||
			input.type == "fileServer"
		)
	)
		return false;

	if (typeof input.name !== "string") return false;
	if (typeof input.pathToIndex !== "string") return false;
	if (typeof input.platform !== "string") return false;
	if (
		!(input.communication == "tcp" || input.communication == "node-builtin-ipc")
	)
		return false;

	return true;
};
