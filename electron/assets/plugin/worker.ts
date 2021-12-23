import { parentPort, workerData } from "worker_threads";
import path from "path";
import { homedir } from "os";
import { v4 as uuidv4 } from "uuid";

import {
	PluginManifest,
	PluginIdentifier,
	PluginCode,
	MessageEvent,
} from "./types";

interface Plugin {
	content: any;
	name: string;
}

const plugins: Map<string, Plugin> = new Map();

const main = () => {
	if (!parentPort) throw new SyntaxError("No parentPort");

	parentPort.on("message", (event: MessageEvent) => {
		const { type, input } = event;
		if (type === "start") return registerPlugins(input);

		updatePlugins(type, input);
	});
};

const registerPlugins = async (arrayOfPlugins: any[]) => {
	for (const plugin of arrayOfPlugins) {
		loadPlugin(plugin);
	}
};

const loadPlugin = async (plugin: PluginManifest) => {
	const absEntryPointPath = path.join(
		homedir(),
		".editor",
		"plugins",
		plugin.name,
		plugin.entryPoint
	);

	const code = require(absEntryPointPath);

	const uuid = uuidv4({}, Buffer.alloc(16));
	const uuidHex = uuid.toString("hex");

	if (!(code["onPluginRegistered"] instanceof Function))
		throw new Error(`plugin ${plugin.name} couldn't load`);

	code["onPluginRegistered"]({
		uuid: uuidHex,
		name: `${plugin.name}-${plugin.version}`,
	});

	plugins.set(uuidHex, {
		content: code,
		name: `${plugin.name}-${plugin.version}`,
	});
};

const checkAnswerType = (input: string): boolean => {
	if (input === "updateHighlight") return true;

	return false;
};

const updatePlugins = (event: string, input: any) => {
	for (const [_, plugin] of plugins) {
		if (plugin.content[event] instanceof Function) {
			(plugin.content[event] as Function).apply(
				{
					answer: (type: string) => {
						if (!checkAnswerType(type))
							return plugin.content["errorHandler"]("bad answer type");

						console.log("answer received");
					},
				},
				input
			);
		}
	}
};

main();
