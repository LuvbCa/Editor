export type CommunicationTypes = "tcp" | "ipc" | "node-builtin-ipc";
export type ServerTypes = "windowServer" | "uiServer" | "fileServer";
export type LocationTypes = "local" | "remote";
export type PlatformTypes = "win32" | "darwin" | "linux";
export interface Config {
	serverDirectory: string;
	servers: Server[];
	runtimePort: number;
	platforms: Platforms;
}

export interface Server {
	type: ServerTypes;
	name: string;
	pathToIndex: string;
	platform: string;
	communication: CommunicationTypes;
	location: LocationTypes;
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

export type ExecutionLocation = {
	[key in PlatformTypes]: {
		/**
		 * will be relative to working dir of the directory the server is in.
		 */
		path: string;
	};
};
