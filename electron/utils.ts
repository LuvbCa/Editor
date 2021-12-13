import {
	IpcMain,
	BrowserWindow,
	GlobalShortcut,
	Dialog,
	App,
} from "electron/main";

export const registerIpcEvents = (ipc: IpcMain, dialog: Dialog, app: App) => {
	ipc.on("dirDialog", async (event) => {
		const result = await dialog.showOpenDialog(
			BrowserWindow.fromWebContents(event.sender)!,
			{
				properties: ["openDirectory"],
			}
		);
		if (result.canceled) return;
		event.reply("dirSelected", result.filePaths[0]);
	});

	ipc.on("close", (event) => {
		BrowserWindow.fromWebContents(event.sender)?.close();
		app.quit();
	});

	ipc.on("minimize", (event) => {
		BrowserWindow.fromWebContents(event.sender)?.minimize();
	});

	ipc.on("maximize", (event) => {
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

export const registerKeyCombs = (
	win: BrowserWindow,
	shortcut: GlobalShortcut
) => {
	const openDevTools = shortcut.register("CommandOrControl+X", () => {
		win.webContents.isDevToolsOpened()
			? win.webContents.closeDevTools()
			: win.webContents.openDevTools();
	});

	const stayOnTop = shortcut.register("CommandOrControl+U", () => {
		win.isAlwaysOnTop() ? win.setAlwaysOnTop(false) : win.setAlwaysOnTop(true);
	});

	const close = shortcut.register("CommandOrControl+C+Enter", () => {
		win.close();
	});

	console.log(
		`registration status => openDevTools: ${openDevTools}, stayOnTop: ${stayOnTop}, close: ${close}`
	);
};

export const sleep = (milliseconds: number) => {
	return new Promise((resolve) => setTimeout(resolve, milliseconds));
};
