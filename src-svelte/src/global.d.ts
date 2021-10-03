/// <reference types="@sveltejs/kit" />

interface RecursiveObject extends Object {
	[key: string]: (string | RecursiveObject)[];
}

interface Directroy {
	files: string[];
}

interface Window {
	ipcRenderer: {
		send: {
			sync: <T>(channel: string, data: any) => T | undefined;
			async: (channel: string, data: any) => void;
		};
		listen: (channel: string, func: (...args: any[]) => void) => void;
	};
	fs: {
		readDir: (readPath: string) => Promise<RecursiveObject | undefined>;
	};
}
