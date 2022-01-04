import ipc from "node-ipc";
import { readFile, stat } from "fs/promises";
import path from "path";

import { spawn, ChildProcessWithoutNullStreams } from "child_process";

interface Config {
	serverDirectory: string;
	servers: Server[];
	runtimePort: number;
	platforms: Platforms;
}

interface Server {
	type: "WindowServer" | "UIServer" | "FileServer";
	name: string;
	pathToIndex: string;
	platform: string;
}

interface Platforms {
	[key: string]: Command | undefined;
}
interface GlobalCommand {
	isGlobal: true;
	command: string;
	spawnArgs: string[];
}
interface LocalCommand {
	isGlobal: false;
	command: ExecutionLocation;
	spawnArgs: string[];
}
type Command = GlobalCommand | LocalCommand;
type validPlatforms = "win32" | "darwin" | "linux";
type ExecutionLocation = {
	[key in validPlatforms]: {
		/**
		 * will be relative to working dir of the directory the server is in.
		 */
		path: string;
	};
};

const main = async () => {
	overrideConsole();
	const config = await parseConfigFile();
	const abort = new AbortController();

	await createServer();

	ipc.server.on("register", (payload) => {
		console.log("new client trying to register:", payload);
	});

	ipc.server.on("error", (err) => {
		console.log("[CORE-SOCKET-ERR]:", err);
	});

	for (const server of config.servers) {
		const workingDir = path.resolve(config.serverDirectory, server.name);
		const indexFile = path.join(workingDir, server.pathToIndex);

		try {
			await stat(indexFile);

			const command = config.platforms[server.platform];

			if (!command) throw new Error("platform not defined in config file");

			const newSubServer = await extendedSpawn(
				command,
				workingDir,
				indexFile,
				abort.signal
			);

			console.log(`started ${server.type}`);

			const print = (data: string, suffix: string) => {
				const printing = data.split(/\n\r?/g).filter((a) => a.length > 0);

				for (const prints of printing) {
					process.stdout.write(`[${server.type}-${suffix}]: `);
					process.stdout.write(prints + "\n");
				}
			};

			newSubServer.stdout.on("data", (data) => {
				if (Buffer.isBuffer(data)) {
					const utf8Data = data.toString("utf-8");
					return print(utf8Data, "LOG");
				}
				print(data, "LOG");
			});

			newSubServer.stderr.on("data", (data) => {
				if (Buffer.isBuffer(data)) {
					const utf8Data = data.toString("utf-8");
					return print(utf8Data, "ERR");
				}
				print(data, "ERR");
			});
		} catch (e) {
			console.error(`Error accessing ${indexFile}:`);
		}
	}
};

/**
 * will try to recover by looking up the `.bin` directory
 */
const extendedSpawn = (
	command: Command,
	cwd: string,
	filePath: string,
	abort: AbortSignal
): Promise<ChildProcessWithoutNullStreams> => {
	return new Promise((resolve) => {
		if (command.isGlobal) {
			const cmd = spawn(command.command, [...command.spawnArgs, filePath], {
				stdio: ["pipe", "pipe", "pipe"],
				signal: abort,
				cwd,
				env: {},
			});

			cmd.on("spawn", () => {
				resolve(cmd);
			});
		}

		if (!command.isGlobal) {
			const mappedPlatform = getvalidPlatform();
			const pathToExec = path.resolve(
				cwd,
				command.command[mappedPlatform].path
			);

			const cmd = spawn(pathToExec, [...command.spawnArgs, filePath], {
				stdio: ["pipe", "pipe", "pipe"],
				signal: abort,
				cwd,
				env: {},
			});

			cmd.on("spawn", () => {
				resolve(cmd);
			});
		}
	});
};

const getvalidPlatform = (): validPlatforms => {
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

const parseConfigFile = async (): Promise<Config> => {
	const readConfigFile = await readFile("./config.json", "utf-8");

	const parsed = JSON.parse(readConfigFile);

	if (!isConfigFile(parsed))
		throw new Error("Config file is not properly configured.");

	return parsed;
};

const isConfigFile = (input: any): input is Config => {
	if (!Array.isArray(input.servers)) return false;

	if (typeof input !== "object") return false;
	if (typeof input.platforms !== "object") return false;
	if (typeof input.runtimePort !== "number") return false;
	if (typeof input.serverDirectory !== "string") return false;

	return true;
};

const createServer = (): Promise<void> => {
	return new Promise((resolve, reject) => {
		ipc.config.logger = () => {};

		ipc.serve("/tmp/nathene.editor", () => {
			resolve();
		});

		ipc.server.start();
	});
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

		originalConsoleLog.apply(console, args);
	};
};

main();
