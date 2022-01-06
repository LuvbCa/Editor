import ipc from "node-ipc";
import { stat } from "fs/promises";
import path from "path";
import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import { Command, Config, Server, ValidPlatforms } from "./types";
import { getConfigFile } from "./config";
import { Socket } from "net";

const main = async () => {
	overrideConsole();
	const config = await getConfigFile();

	if (
		process.argv.includes("--startAllNecessary") ||
		process.argv.includes("-san")
	) {
		await startAllServers(config);
	}
};

const startAllServers = async (config: Config) => {
	const startingServers: Promise<void>[] = [];

	for (const server of config.servers) {
		startingServers.push(startServer(config, server));
	}

	await Promise.all(startingServers);
};

const startServer = async (config: Config, server: Server) => {
	const workingDir = path.resolve(config.serverDirectory, server.name);
	const indexFile = path.join(workingDir, server.pathToIndex);

	try {
		await stat(indexFile);

		const command = config.platforms[server.platform];

		if (!command) throw new Error("platform not defined in config file");

		const newSubServer = await extendedSpawn(command, workingDir, indexFile);

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
