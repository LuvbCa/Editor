import { contextBridge, ipcRenderer } from "electron";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";

const validSendChannels = [
	"dirDialog",
	"close",
	"minimize",
	"maximize",
	"test",
	"testPerformance",
];
const validListenChannels = ["dirSelected"];

const validBalanceTypes = ["test"];

type RecursiveObject = {
	name: string;
	path: string;
	children?: RecursiveObject[];
};

const metaObject = {
	workersBooted: parseInt(
		window.location.href.split("?")[1].replace("cores=", "")
	),
};

const ipcObject = {
	send: {
		sync: <T extends any>(channel: string, data: any): T | void => {
			if (validSendChannels.includes(channel))
				return ipcRenderer.sendSync(channel, data);

			console.warn("channel not supported!");
		},
		async: (channel: string, data: any): void => {
			if (validSendChannels.includes(channel)) {
				ipcRenderer.send(channel, data);
			} else {
				console.warn("channel not supported!");
			}
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
	balanceLoad: (type: string, callback: (...args: any[]) => any) => {
		if (!validBalanceTypes.includes(type)) {
			console.warn("balance type not supported!");
			return;
		}

		const uuid = uuidv4();

		ipcRenderer.send("test", type, uuid);
		ipcRenderer.once(type + uuid, (event, ...args) => {
			callback(...args);
		});
	},
};

const fsObject = {
	readDir: async (readPath: string) => {
		const fullPath = readPath;

		let dir = await fs.promises.opendir(fullPath);

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

contextBridge.exposeInMainWorld("meta", metaObject);
