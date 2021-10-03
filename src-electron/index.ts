import { app, BrowserWindow, ipcMain, dialog, globalShortcut } from "electron";
import path from "path";

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
		BrowserWindow.getFocusedWindow()!,
		{
			properties: ["openDirectory"],
		}
	);
	if (result.canceled) return;
	event.reply("dirSelected", result.filePaths[0]);
});

ipcMain.on("close", (event) => {
	BrowserWindow.getFocusedWindow()?.close();
	app.quit();
});

ipcMain.on("minimize", (event) => {
	BrowserWindow.getFocusedWindow()?.minimize();
});

ipcMain.on("maximize", (event) => {
	const win = BrowserWindow.getFocusedWindow();
	if (win?.isMaximized()) {
		win?.unmaximize();
		return;
	}
	win?.maximize();
});

ipcMain.on("select-dir", async (event) => {
	const result = await dialog.showOpenDialog(
		BrowserWindow.getFocusedWindow()!,
		{
			properties: ["openDirectory"],
		}
	);
	event.returnValue = result.filePaths;
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

	win.loadURL(`http://localhost:3000/`);
}
