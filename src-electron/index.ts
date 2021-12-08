import { app, BrowserWindow, ipcMain, dialog, globalShortcut } from "electron";
import path from "path";
import { pluginLoader } from "./pluginLoader";
import { registerIpcEvents, registerKeyCombs, sleep } from "./utils";
// create a worker pool using an external worker script

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
	const win = new BrowserWindow({
		width: 800,
		height: 600,
		frame: false,
		show: false,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: true,
			preload: path.join(__dirname, "preload.js"),
		},
	});

	const loadWin = new BrowserWindow({
		width: 300,
		height: 300,
		frame: false,
		show: true,
		resizable: false,
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
		},
	});

	loadWin.loadFile("./startup/index.html");

	await pluginLoader();
	await sleep(10000);

	loadWin.close();

	win.once("ready-to-show", () => {
		//workaround: reset zoom
		win.webContents.setZoomFactor(1);
		win.show();
	});

	win.on("maximize", () => {
		win.webContents.send("maximized", true);
	});

	win.on("unmaximize", () => {
		win.webContents.send("maximized", false);
	});

	registerKeyCombs(win, globalShortcut);
	registerIpcEvents(ipcMain, dialog, app);

	win.webContents.openDevTools();

	win.loadURL("http://localhost:3000/");
};
