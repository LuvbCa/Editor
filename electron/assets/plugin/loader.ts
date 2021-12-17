import path from "path";
import { mkdir, opendir, readFile } from "fs/promises";
import { homedir } from "os";
import { NatheneGlobal } from "../../globals";

import { PluginManifest, PluginIdentifier, PluginCode } from "./types";
import { WorkerPool } from "./workerPool";

// TODO: run this async after preloading for plugins finshed => dispatch to worker thread?
export const pluginLoader = async () => {
	const allPlugins: PluginManifest[][] = [];
	const workerPool = new WorkerPool(NatheneGlobal.pluginThreads || 4);

	console.log("start parsing plugins");

	const pluginPath = path.join(homedir(), ".editor", "plugins");

	try {
		const dir = await opendir(pluginPath);

		let i = 0;
		for await (const pluginEntry of dir) {
			if (pluginEntry.isDirectory()) {
				const pluginMainifestPath = path.join(
					pluginPath,
					pluginEntry.name,
					"plugin.json"
				);
				const pluginManifestRaw = await readFile(pluginMainifestPath, "utf-8");
				const pluginManifest = JSON.parse(pluginManifestRaw);

				// console.log(pluginManifest);

				if (!checkManifest(pluginManifest)) {
					throw new Error(
						`Plugin '${pluginManifest.name}' doesn't meet the manifest definition`
					);
				}

				const thread = i % (NatheneGlobal.pluginThreads || 4);

				if (!allPlugins[thread]) allPlugins[thread] = [];

				allPlugins[thread].push(pluginManifest);

				i++;
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

	for (let q = 0; q < allPlugins.length; q++) {
		workerPool.startThread(q, allPlugins[q]);
	}

	return async () => {
		await workerPool.releaseAll();
	};
};

const checkManifest = (input: any): input is PluginManifest => {
	if (typeof input.name !== "string") return false;
	if (typeof input.entryPoint !== "string") return false;
	if (typeof input.version !== "string") return false;

	return true;
};
