import path from "path";
import { mkdir, opendir, readFile } from "fs/promises";
import { homedir } from "os";
import { v4 as uuidv4 } from "uuid";
import { NatheneGlobal } from "../../globals";

interface Plugin {
	name: string;
	entryPoint: string;
	version: string;
}

interface PluginIdentifier {
	name: string;
	uuid: string;
}
interface PluginCode {
	onPluginRegistered: (pluginIdentifier: PluginIdentifier) => {};
	[key: string | symbol | number]: any;
}

// TODO: run this async after preloading for plugins finshed => dispatch to worker thread?
export const pluginLoader = async () => {
	const allPlugins: Plugin[] = [];

	console.log("start parsing plugins");

	const pluginPath = path.join(homedir(), ".editor", "plugins");

	try {
		const dir = await opendir(pluginPath);

		for await (const pluginEntry of dir) {
			if (pluginEntry.isDirectory()) {
				const pluginMainifestPath = path.join(
					pluginPath,
					pluginEntry.name,
					"plugin.json"
				);
				const pluginManifestRaw = await readFile(pluginMainifestPath, "utf-8");
				const pluginManifest = JSON.parse(pluginManifestRaw);

				console.log(pluginManifest);

				if (!checkManifest(pluginManifest)) {
					return console.log(
						`Plugin '${pluginManifest.name}' doesn't meet the manifest definition `
					);
				}

				loadPlugin(pluginManifest);
			}
		}
	} catch (e) {
		if (e instanceof Error) {
			console.log("plugin loader status =>", e);
			//@ts-ignore
			if (e.code == "ENOENT") {
				await mkdir(pluginPath, { recursive: true });
			}
		}
	}
};

const checkManifest = (input: any): input is Plugin => {
	if (typeof input.name !== "string") return false;
	if (typeof input.entryPoint !== "string") return false;
	if (typeof input.version !== "string") return false;

	return true;
};

const checkPlugin = (input: any): input is PluginCode => {
	if (typeof input !== "object") return false;
	if (!(input["onPluginRegistered"] instanceof Function)) return false;
	return true;
};

const loadPlugin = async (plugin: Plugin) => {
	//TODOOO: expose global references to editor windows
	//TODOOOO: expose needed apis to PluginHandler -> events like: editorLoad, editorChanged, editorInput ==> subscribing to handler instead of directly to the event from svelte/dom
	//TODO: make every plugin load in to multithreaded context

	console.log(NatheneGlobal);

	const absEntryPointPath = path.join(
		homedir(),
		".editor",
		"plugins",
		plugin.name,
		plugin.entryPoint
	);

	const code = require(absEntryPointPath);

	if (!checkPlugin(code)) return;

	const pluginIdentifer: PluginIdentifier = {
		uuid: uuidv4(),
		name: `${plugin.name}-${plugin.version}`,
	};

	code.onPluginRegistered(pluginIdentifer);
};
