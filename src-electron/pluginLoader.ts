import path from "path";
import { mkdir, opendir, readFile, writeFile } from "fs/promises";
import { homedir } from "os";
import type { BrowserWindow } from "electron";
import fetch from "node-fetch";
import AdmZip from "adm-zip";
import { spawn } from "child_process";
import { DenoWorker } from "deno-vm";

interface Plugin {
	name: string;
	entryPoint: string;
	version: string;
	runtime: string;
}

export const pluginLoader = async () => {
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

				console.log(pluginManifest);

				const downloadedVersion = await checkRuntime(pluginManifest.runtime);
				console.log(`deno ${downloadedVersion} downloaded!`);

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

const checkRuntime = async (version: string): Promise<string> => {
	const latestVersion =
		version === "latest" ? await getLatestVersion() : version;

	const latestRuntimePath = path.join(
		homedir(),
		".editor",
		"plugin_runtime",
		latestVersion
	);

	let downloadedVersion = "";

	try {
		const dir = await opendir(latestRuntimePath);

		const deno = await dir.read();

		if (!deno) {
			downloadedVersion = await downloadDenoVersion(latestVersion);
		} else {
			downloadedVersion = latestVersion;
		}

		await dir.close();
	} catch (e) {
		if (e instanceof Error) {
			//@ts-ignore
			if (e.code == "ENOENT") {
				console.log(
					`Deno ${version} folder not found. Creating folder and downloading`
				);
				await mkdir(latestRuntimePath, { recursive: true });
				downloadedVersion = await downloadDenoVersion(latestVersion);
			}
		}
	}

	return downloadedVersion;
};

const downloadDenoVersion = async (version: string): Promise<string> => {
	let arch = "";
	let platform = "";

	console.log("start downloading Deno", version);

	switch (process.arch) {
		case "x64":
			arch = "x86_64";
			break;
		case "arm64":
			arch = "aarch64";
			break;
	}

	switch (process.platform) {
		case "win32":
			platform = "pc-windows-msvc";
			break;
		case "linux":
			platform = "unknown-linux-gnu";
			break;
		case "darwin":
			platform = "apple-darwin";
			break;
	}

	const downloadURI = `https://github.com/denoland/deno/releases/download/v${version}/deno-${arch}-${platform}.zip`;

	const download = await fetch(downloadURI, {
		method: "GET",
	});

	const downloadArray = await download.buffer();

	const latestRuntimePath = path.join(
		homedir(),
		".editor",
		"plugin_runtime",
		version
	);

	const zip = new AdmZip(downloadArray);
	zip.extractAllTo(latestRuntimePath, true);

	return version;
};

const getLatestVersion = async (): Promise<string> => {
	const latestRelease = await fetch(
		"https://github.com/denoland/deno/releases/latest",
		{
			redirect: "manual",
		}
	);
	const location = latestRelease.headers.get("location");
	if (!location) throw new Error("Github doesn't behave normally");

	const latestVersion = location.slice(location.lastIndexOf("/") + 2);
	return latestVersion;
};

const checkManifest = (pluginManifest: any): pluginManifest is Plugin => {
	if (typeof pluginManifest.name !== "string") return false;
	if (typeof pluginManifest.entryPoint !== "string") return false;
	if (typeof pluginManifest.version !== "string") return false;
	if (typeof pluginManifest.runtime !== "string") return false;

	const runtime = pluginManifest.runtime.split(".");
	if (runtime[0] < 1) return false;
	if (runtime[1] < 16) return false;

	return true;
};

export const loadPlugin = async (plugin: Plugin, window?: BrowserWindow) => {
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
