import { app, BrowserWindow, ipcMain, dialog, globalShortcut } from "electron";
import path from "path";

// create a worker pool using an external worker script

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

ipcMain.on("test", (event, type: string, uuid: string) => {
	event.reply(type + uuid, "amongus");
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

async function createWindow() {
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

	win.once("ready-to-show", () => {
		//workaround: reset zoom
		win.webContents.setZoomFactor(1);
		win.show();
	});

	registerKeyCombs(win);

	win.webContents.openDevTools();

	win.loadURL("http://localhost:3000/");
}
