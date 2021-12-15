"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const ipc_1 = require("./ipc");
const fs_1 = require("./fs");
electron_1.ipcRenderer.on("error", (event, errorcode) => {
    alert(errorcode);
});
electron_1.contextBridge.exposeInMainWorld("ipc", (0, ipc_1.generateIpcObject)());
electron_1.contextBridge.exposeInMainWorld("fs", (0, fs_1.generateFsObject)());
electron_1.contextBridge.exposeInMainWorld("isElectron", true);
