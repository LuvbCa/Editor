import { contextBridge, ipcRenderer } from "electron";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import { generateIpcObject } from "./ipc";
import { generateFsObject } from "./fs";

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

contextBridge.exposeInMainWorld("ipc", generateIpcObject());

contextBridge.exposeInMainWorld("fs", generateFsObject());

contextBridge.exposeInMainWorld("isElectron", true);
