import { app, ipcMain, dialog, BrowserWindow, globalShortcut } from "electron";

export const registerIpcEvents = () => {
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
		const isMaximized = win?.isMaximized();

		if (isMaximized == undefined) return;

		if (isMaximized) {
			win?.unmaximize();
			return;
		}
		win?.maximize();
	});
};

export const registerWindowEvents = (win: BrowserWindow) => {
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
};

export const registerKeyCombinations = (win: BrowserWindow) => {
	const openDevTools = globalShortcut.register("CommandOrControl+X", () => {
		win.webContents.isDevToolsOpened()
			? win.webContents.closeDevTools()
			: win.webContents.openDevTools();
	});

	const stayOnTop = globalShortcut.register("CommandOrControl+U", () => {
		win.isAlwaysOnTop() ? win.setAlwaysOnTop(false) : win.setAlwaysOnTop(true);
	});

	const close = globalShortcut.register("CommandOrControl+C+Enter", () => {
		win.close();
	});

	console.log(
		`registration status => openDevTools: ${openDevTools}, stayOnTop: ${stayOnTop}, close: ${close}`
	);
};

export const sleep = (milliseconds: number) => {
	return new Promise((resolve) => setTimeout(resolve, milliseconds));
};
