export interface Config {
	serverDirectory: string;
	servers: Server[];
	runtimePort: number;
	platforms: Platforms;
}

export interface Server {
	type: "WindowServer" | "UIServer" | "FileServer";
	name: string;
	pathToIndex: string;
	platform: string;
}

export interface Platforms {
	[key: string]: Command | undefined;
}

export interface GlobalCommand {
	isGlobal: true;
	command: string;
	spawnArgs: string[];
}

export interface LocalCommand {
	isGlobal: false;
	command: ExecutionLocation;
	spawnArgs: string[];
}

export type Command = GlobalCommand | LocalCommand;

export type ValidPlatforms = "win32" | "darwin" | "linux";

export type ExecutionLocation = {
	[key in ValidPlatforms]: {
		/**
		 * will be relative to working dir of the directory the server is in.
		 */
		path: string;
	};
};
