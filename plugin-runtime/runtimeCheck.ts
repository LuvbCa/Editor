import path from "path";
import { mkdir, opendir } from "fs/promises";
import { homedir } from "os";
import fetch from "node-fetch";
import AdmZip from "adm-zip";

export const checkRuntime = async (): Promise<string> => {
	const latestVersion = await getLatestDenoVersion();

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
				console.log(`Deno folder not found. Creating folder and downloading`);
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

const getLatestDenoVersion = async (): Promise<string> => {
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
