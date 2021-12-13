import path from "path";
import { mkdir, opendir, readFile, writeFile } from "fs/promises";
import { homedir } from "os";
import type { BrowserWindow } from "electron";
import fetch from "node-fetch";
import AdmZip from "adm-zip";
import { spawn } from "child_process";
import { EventEmitter } from "events";
import { DenoWorker } from "deno-vm";

interface Plugin {
	name: string;
	entryPoint: string;
	version: string;
}
// TODO: run this async after preloading for plugins finshed => dispatch to worker thread?
export const pluginLoader = async (pluginMaster) => {
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

const checkManifest = (pluginManifest: any): pluginManifest is Plugin => {
	if (typeof pluginManifest.name !== "string") return false;
	if (typeof pluginManifest.entryPoint !== "string") return false;
	if (typeof pluginManifest.version !== "string") return false;

	return true;
};

const loadPlugin = async (plugin: Plugin) => {
	//TODOOO: expose global references to editor windows
	//TODOOOO: expose needed apis to PluginHandler -> events like: editorLoad, editorChanged, editorInput ==> subscribing to handler instead of directly to the event from svelte/dom
	//TODO: make every plugin load in to multithreaded context?
	/**
	 * Every Plugin gets no permission from deno!
	 * can request more resources via preload script
	 * --> once running, plugins can't request more resources
	 */

	const absEntryPointPath = path.join(
		homedir(),
		".editor",
		"plugins",
		plugin.name,
		plugin.entryPoint
	);
	const absRuntimePath = path.join(
		homedir(),
		".editor",
		"plugin_runtime",
		plugin.runtime,
		"deno"
	);
	const code = await readFile(absEntryPointPath, "utf-8");
	const vm = new DenoWorker(code, {
		denoExecutable: absRuntimePath,
	});
};
