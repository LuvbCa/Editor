import WebSocket, { WebSocketServer } from "ws";
import { readFile, stat } from "fs/promises";
import path from "path";

import { fork, spawn, ChildProcessWithoutNullStreams } from "child_process";

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
	const config = await parseConfigFile();
	const wss = await createWebSocketServer(config.runtimePort);
	const abort = new AbortController();

	wss.on("connection", (socket, request) => {
		console.log(socket);
		console.log(request);

		socket.on("message", (data, isBinary) => {
			console.log(data);
		});
	});

	for (const server of config.servers) {
		const workingDir = path.resolve(config.serverDirectory, server.name);
		const indexFile = path.join(workingDir, server.pathToIndex);

		try {
			await stat(indexFile);

			// const newSubServer = fork(indexFile, {
			// 	stdio: ["pipe", "pipe", "pipe", "ipc"],
			// 	signal: abort.signal,
			// });

			const command = config.platforms[server.platform];

			if (!command) throw new Error("platform not defined in config file");

			console.log(workingDir);

			const newSubServer = await extendedSpawn(
				command,
				workingDir,
				indexFile,
				abort.signal
			);

			newSubServer.stdout.on("data", (data) => {
				process.stdout.write(`[${server.type}-LOG]: `);
				process.stdout.write(data);
			});

			newSubServer.stderr.on("data", (data) => {
				process.stdout.write(`[${server.type}-ERR]: `);
				process.stdout.write(data);
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
			break;
		}
		case "linux": {
			return "linux";
			break;
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

const createWebSocketServer = (port: number): Promise<WebSocket.Server> => {
	return new Promise((resolve, reject) => {
		const wss = new WebSocketServer({
			port,
			perMessageDeflate: {
				zlibDeflateOptions: {
					// See zlib defaults.
					chunkSize: 1024,
					memLevel: 7,
					level: 3,
				},
				zlibInflateOptions: {
					chunkSize: 10 * 1024,
				},
				// Other options settable:
				clientNoContextTakeover: true, // Defaults to negotiated value.
				serverNoContextTakeover: true, // Defaults to negotiated value.
				serverMaxWindowBits: 10, // Defaults to negotiated value.
				// Below options specified as default values.
				concurrencyLimit: 10, // Limits zlib concurrency for perf.
				threshold: 1024, // Size (in bytes) below which messages
				// should not be compressed if context takeover is disabled.
			},
		});

		wss.once("listening", () => {
			console.log("WebSocket Server listens on port 8080");
			resolve(wss);
		});
	});
};

main();
