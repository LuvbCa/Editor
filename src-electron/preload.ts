import { contextBridge, ipcRenderer } from "electron";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import { event } from "@tauri-apps/api";

const validSendChannels = [
	"dirDialog",
	"close",
	"minimize",
	"maximize",
	"test",
	"testPerformance",
];
const validListenChannels = ["dirSelected", "maximized"];

const validInternChannels = /[A-Za-z]\:(data|end)/g;

const validBalanceTypes = ["recursiveDir"];

type RecursiveObject = {
	name: string;
	path: string;
	children?: RecursiveObject[];
};

interface LayerEntry {
	name: string;
	path: string;
}
interface LayerDir extends LayerEntry {
	children: { [key: string]: LayerDir | LayerFile };
	type: "directory";
}

interface LayerFile extends LayerEntry {
	type: "file";
}

ipcRenderer.on("error", (event, errorcode: string) => {
	alert(errorcode);
});

ipcRenderer.on("meta", (event, meta) => {
	console.log("meta", meta);
});

const ipcObject = {
	send: {
		/**
		 * @deprecated do not use!! will be removed before 0.2.0
		 */
		sync: <T extends any>(channel: string, data: any): T | void => {
			if (validSendChannels.includes(channel))
				return ipcRenderer.sendSync(channel, data);

			console.warn(`channel not supported: ${channel}`);
		},
		async: (channel: string, data: any): void => {
			if (validSendChannels.includes(channel)) {
				ipcRenderer.send(channel, data);
			} else {
				console.warn(`channel not supported: ${channel}`);
			}
		},
	},
	listen: (channel: string, func: (...args: any[]) => void): void => {
		// if (validInternChannels.includes(channel)) {
		// 	ipcRenderer.on(channel, (...args) => func(...args));
		// }
		if (validListenChannels.includes(channel)) {
			// Deliberately strip event as it includes `sender`
			ipcRenderer.on(channel, (event, ...args) => func(...args));
		} else {
			console.warn(`channel not supported: ${channel}`);
		}
	},
	balanceLoad: (
		type: string,
		input: {
			[key: string]: string | number | boolean;
		},
		callback: (...args: any[]) => void
	) => {
		if (!validBalanceTypes.includes(type)) {
			console.warn("balance type not supported!");
			return;
		}

		const uuid = uuidv4();

		ipcRenderer.send("balanceLoad", type, uuid, input);
		ipcRenderer.once(`${type}:${uuid}`, (event, ...args) => {
			callback(...args);
		});
	},
};

const fsObject = {
	layerReadDir: async (
		readPath: string,
		maxLayer: number,
		currentLayer: number = 0
	) => {
		/*
		maxLayer = 0: read only given dir, 
		maxLayer = 1: read given dir and every child dir, 
		maxLayer = 2: read given dir and every child dir and every child dir of the child dir etc...
		*/

		const fullPath = path.resolve(readPath);
		const root: LayerDir = {
			name: fullPath.substr(fullPath.lastIndexOf("\\") + 1),
			path: fullPath,
			children: {},
			type: "directory",
		};

		if (maxLayer < currentLayer) {
			return root;
		}

		const dir = await fs.promises.opendir(fullPath);

		for await (let currentEntry of dir) {
			if (currentEntry.isFile() || currentEntry.isSymbolicLink()) {
				const resolvedPath = path.join(fullPath, currentEntry.name);
				root.children[currentEntry.name] = {
					name: currentEntry.name,
					path: resolvedPath,
					type: "file",
				};
			}

			if (currentEntry.isDirectory()) {
				const newDir = path.join(fullPath, currentEntry.name);

				try {
					const newRead = await fsObject.layerReadDir(
						newDir,
						maxLayer,
						currentLayer + 1
					);

					root.children[currentEntry.name] = newRead;
				} catch (e) {
					// root.children[currentEntry.name] = e;
					console.warn(`${e} -> reading will continue`);
				}
			}
		}

		return root;
	},
	readFile: async (readPath: string) => {
		const file = await fs.promises.readFile(readPath, {
			encoding: "utf-8",
		});

		return file;
	},
};

contextBridge.exposeInMainWorld("ipc", ipcObject);

contextBridge.exposeInMainWorld("fs", fsObject);

contextBridge.exposeInMainWorld("isElectron", true);
