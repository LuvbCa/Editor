import { contextBridge, ipcRenderer } from "electron";
import { generateIpcObject } from "./ipc";
import { generateFsObject } from "./fs";
import { generateStateObject } from "./state";

ipcRenderer.on("error", (event, errorcode: string) => {
	alert(errorcode);
});

let loading = true;

contextBridge.exposeInMainWorld("ipc", generateIpcObject());

contextBridge.exposeInMainWorld("fs", generateFsObject());

contextBridge.exposeInMainWorld("loading", {
	waitInitial: new Promise<void>((resolve, reject) => {
		if (!loading) return resolve();
		ipcRenderer.once("finishedLoading", () => {
			resolve();
			loading = false;
		});
	}),
});

contextBridge.exposeInMainWorld("state", generateStateObject());

contextBridge.exposeInMainWorld("isElectron", true);
