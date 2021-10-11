import { contextBridge, ipcRenderer } from "electron";
import fs from "fs";
import path from "path";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
let validSendChannels = [
	"dirDialog",
	"close",
	"minimize",
	"maximize",
	"testPerformance",
];
let validListenChannels = ["dirSelected"];

type RecursiveObject = {
	name: string;
	path: string;
	children?: RecursiveObject[];
};

const ipcObject = {
	send: {
		sync: <T>(channel: string, data: any): T | void => {
			if (validSendChannels.includes(channel)) {
				return ipcRenderer.sendSync(channel, data);
			} else {
				console.log("channel not supported!");
			}
		},
		async: (channel: string, data: any): undefined => {
			if (validSendChannels.includes(channel)) {
				ipcRenderer.send(channel, data);
			} else {
				console.log("channel not supported!");
			}
			return undefined;
		},
	},
	listen: (channel: string, func: (...args: any[]) => void): void => {
		if (validListenChannels.includes(channel)) {
			// Deliberately strip event as it includes `sender`
			ipcRenderer.on(channel, (event, ...args) => func(...args));
		} else {
			console.log("channel not supported!");
		}
	},
};

const fsObject = {
	readDir: async (readPath: string) => {
		const fullPath = readPath;

		let dir = fs.opendirSync(fullPath);

		const temp: RecursiveObject[] = [];

		if (!dir) return [];

		for await (let currentEntry of dir) {
			if (currentEntry.isFile() || currentEntry.isSymbolicLink()) {
				temp.push({
					name: currentEntry.name,
					path: readPath + "\\" + currentEntry.name,
					children: undefined,
				});
			}

			if (currentEntry.isDirectory()) {
				const newDir = path.join(fullPath, currentEntry.name);

				const newRead = await fsObject.readDir(newDir);

				if (!newRead) return [];

				temp.push({
					name: currentEntry.name,
					path: readPath + "\\" + currentEntry.name,
					children: newRead,
				});
			}
		}
		return temp;
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
