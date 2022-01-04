import { app, BrowserWindow, globalShortcut, nativeImage } from "electron";
import { parseNatheneConfig } from "./globals";
import { WebSocket } from "ws";
import path from "path";
import { pluginLoader } from "./assets/plugin/loader";

import {
	registerIpcEvents,
	registerKeyCombinations,
	registerWindowEvents,
} from "./utils";

app.on("ready", async (event, info) => {
	createWindow();

	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});
});

app.on("will-quit", () => {
	globalShortcut.unregisterAll();
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

const createWindow = async () => {
	const icon = nativeImage.createFromPath("./assets/loading_window/icon.png");

	const win = new BrowserWindow({
		width: 800,
		height: 600,
		frame: false,
		show: false,
		icon,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: true,
			preload: path.join(__dirname, "assets", "preload", "preload.js"),
		},
	});

	win.webContents.openDevTools();
	win.loadURL("http://localhost:3000/");

	//so window gets shown
	registerWindowEvents(win);

	win.webContents.on("did-start-loading", () => {});

	win.webContents.once("did-finish-load", async () => {
		await parseNatheneConfig();
		const releasePlugins = await pluginLoader();

		registerKeyCombinations(win);
		registerIpcEvents();

		win.webContents.send("finishedLoading");

		win.webContents.on("did-finish-load", () => {
			console.log("reloading");
			win.webContents.send("finishedLoading");
		});
	});
};
