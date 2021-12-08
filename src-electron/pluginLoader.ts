import path from "path";
import { access, mkdir, opendir, readFile } from "fs/promises";
import { homedir } from "os";
import { EventEmitter } from "events";

class Plugin extends EventEmitter {
	manifest: any;
	path: string;

	constructor(pluginManifest: any, pathOfRootDir: string) {
		super();

		if (typeof pluginManifest.name !== "string")
			throw new Error("name needs to be set / needs to be a string");
		if (typeof pluginManifest.entryPoint !== "string")
			throw new Error("name needs to be set / needs to be a string");
		if (typeof pluginManifest.version !== "string")
			throw new Error("name needs to be set / needs to be a string");

		this.manifest = pluginManifest;
		this.path = pathOfRootDir;

		this.finalizeConstruction();
	}

	async finalizeConstruction() {
		const entryFilePath = path.join(this.path, this.manifest.entryPoint);

		try {
			await access(entryFilePath);

			this.emit("finalizationComplete");
		} catch (e) {
			this.emit("finalizationFailed", e);
		}
	}
}

export const pluginLoader = async () => {
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

				const plugin = new Plugin(
					pluginManifest,
					path.join(pluginPath, pluginEntry.name)
				);

				plugin.once("finalizationFailed", (e) => {
					console.log(
						`Plugin '${plugin.manifest.name}' failed to initialize: ${e}`
					);
				});

				plugin.once("finalizationComplete", () => {
					loadPlugin(plugin);
				});
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

export const loadPlugin = (plugin: Plugin) => {};
