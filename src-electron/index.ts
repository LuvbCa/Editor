import { app, BrowserWindow, ipcMain, dialog, globalShortcut } from "electron";
import path from "path";
import os from "os";

app.on("ready", async () => {
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

ipcMain.on("dirDialog", async (event) => {
	const result = await dialog.showOpenDialog(
		BrowserWindow.fromWebContents(event.sender)!,
		{
			properties: ["openDirectory"],
		}
	);
	if (result.canceled) return;
	event.reply("dirSelected", result.filePaths[0]);
});

ipcMain.on("close", (event) => {
	BrowserWindow.fromWebContents(event.sender)?.close();
	app.quit();
});

ipcMain.on("minimize", (event) => {
	BrowserWindow.fromWebContents(event.sender)?.minimize();
});

ipcMain.on("maximize", (event) => {
	const win = BrowserWindow.fromWebContents(event.sender);
	if (win?.isMaximized()) {
		win?.unmaximize();
		return;
	}
	win?.maximize();
});

ipcMain.on("testPerformance", (event) => {
	let p0 = 0;
	let p1 = 0;

	p0 = performance.now();
	const winSender = BrowserWindow.fromWebContents(event.sender);
	p1 = performance.now();

	console.log(p1 - p0 + "ms");

	console.log(" // ");

	p0 = performance.now();
	const winFocused = BrowserWindow.getFocusedWindow();
	p1 = performance.now();
	console.log(p1 - p0 + "ms");
});

function registerKeyCombs(win: BrowserWindow) {
	const ret = globalShortcut.register("CommandOrControl+X", () => {
		win.webContents.isDevToolsOpened()
			? win.webContents.closeDevTools()
			: win.webContents.openDevTools();
	});

	if (!ret) {
		console.log("registration shortcut failed failed");
		win.webContents.openDevTools();
	}
}

function spinUpWorkers() {
	const cores = os.cpus().length;
	console.log(cores);
}

function createWindow() {
	const win = new BrowserWindow({
		width: 800,
		height: 600,
		frame: false,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: true,
			preload: path.join(__dirname, "preload.js"),
		},
	});

	registerKeyCombs(win);
	spinUpWorkers();

	win.webContents.openDevTools();

	win.loadURL(`http://localhost:3000/`);
}
