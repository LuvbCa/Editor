import ipc from "node-ipc";
import { stat } from "fs/promises";
import path from "path";
import {
	fork,
	spawn,
	ChildProcess,
	ChildProcessWithoutNullStreams,
} from "child_process";

import type { Readable, Writable } from "stream";
import { Command, Config, Server, ValidPlatforms } from "./types";
import { getConfigFile } from "./config";
import { Socket } from "net";
import { parse } from "uuid";

const main = async () => {
	overrideConsole();
	const config = await getConfigFile();

	if (process.argv.includes("--startLocal") || process.argv.includes("-sl")) {
		await startLocalServers(config);
	}
};

const startLocalServers = async (config: Config) => {
	const startingServers: Promise<void>[] = [];

	for (const server of config.servers) {
		if (server.location === "remote") continue;

		if (server.communication === "node-builtin-ipc") {
			startingServers.push(startServer(config, server, true));
			return;
		}
		if (server.communication === "tcp") {
			startingServers.push(startServer(config, server));
			return;
		}
		console.log(`${server.name} is remote, so not starting it`);
	}

	await Promise.all(startingServers);
};

const startServer = async (config: Config, server: Server, fork = false) => {
	const workingDir = path.resolve(config.serverDirectory, server.name);
	const indexFile = path.join(workingDir, server.pathToIndex);

	try {
		//check if file is accesable
		await stat(indexFile);

		const command = config.platforms[server.platform];
		if (!command) throw new Error("platform not defined in config file");

		if (!fork) {
			const newSubServer = await extendedSpawn(command, workingDir, indexFile);

			console.log(`started ${server.type}`);

			const print = getPrintFunction(server.type);

			prefixReadableStream(newSubServer.stdout, "LOG", print);
			prefixReadableStream(newSubServer.stderr, "ERR", print);

			return;
		}
	} catch (e) {
		console.error(`Error accessing ${indexFile}:`);
	}
};

/**
 * will try to recover by looking up the `.bin` directory
 */
const extendedSpawn = (
	command: Command,
	cwd: string,
	filePath: string
): Promise<ChildProcessWithoutNullStreams> => {
	return new Promise((resolve) => {
		if (command.isGlobal) {
			const cmd = spawn(command.command, [...command.spawnArgs, filePath], {
				stdio: ["pipe", "pipe", "pipe"],
				cwd,
				env: {},
			});

			cmd.on("spawn", () => {
				resolve(cmd);
			});
		}

		if (!command.isGlobal) {
			const mappedPlatform = getValidPlatform();
			const pathToExec = path.resolve(
				cwd,
				command.command[mappedPlatform].path
			);

			const cmd = spawn(pathToExec, [...command.spawnArgs, filePath], {
				stdio: ["pipe", "pipe", "pipe"],
				cwd,
				env: {},
			});

			cmd.on("spawn", () => {
				resolve(cmd);
			});
		}
	});
};

const extendedFork = (
	command: Command,
	cwd: string,
	filePath: string
): Promise<ChildProcess> => {
	return new Promise((resolve) => {
		if (command.isGlobal) {
			const cmd = fork(command.command, [...command.spawnArgs, filePath], {
				stdio: ["pipe", "pipe", "pipe", "ipc"],
				cwd,
				env: {},
			});

			cmd.on("spawn", () => {
				resolve(cmd);
			});
		}

		if (!command.isGlobal) {
			const mappedPlatform = getValidPlatform();
			const pathToExec = path.resolve(
				cwd,
				command.command[mappedPlatform].path
			);

			const cmd = spawn(pathToExec, [...command.spawnArgs, filePath], {
				stdio: ["pipe", "pipe", "pipe", "ipc"],
				cwd,
				env: {},
			});

			cmd.on("spawn", () => {
				resolve(cmd);
			});
		}
	});
};

const getPrintFunction = (prefix: string) => {
	return (data: string, suffix: string) => {
		const printing = data.split(/\n\r?/g).filter((a) => a.length > 0);

		for (const prints of printing) {
			process.stdout.write(`[${prefix}-${suffix}]: `);
			process.stdout.write(prints + "\n");
		}
	};
};

const prefixReadableStream = (
	stream: Readable,
	suffix: string,
	printFunction: (data: string, suffix: string) => void
) => {
	stream.on("data", (data) => {
		if (Buffer.isBuffer(data)) {
			const utf8Data = data.toString("utf-8");
			return printFunction(utf8Data, suffix);
		}
		printFunction(data, suffix);
	});
};

const getValidPlatform = (): ValidPlatforms => {
	switch (process.platform) {
		case "win32": {
			return "win32";
		}
		case "linux": {
			return "linux";
		}
		case "darwin": {
			return "darwin";
		}
		default: {
			throw new Error(
				`platform ${process.platform} not supported! try forking this and open a pull request!`
			);
		}
	}
};

const overrideConsole = () => {
	const originalConsoleLog = console.log;

	console.log = function () {
		const args = [];

		args.push("[Main-LOG]:");

		for (var i = 0; i < arguments.length; i++) {
			args.push(arguments[i]);
		}

		originalConsoleLog.apply(console, args);
	};

	const originalConsoleError = console.error;

	console.error = function () {
		const args = [];

		args.push("[Main-ERR]:");

		for (var i = 0; i < arguments.length; i++) {
			args.push(arguments[i]);
		}

		originalConsoleError.apply(console, args);
	};
};

main();
