/// <reference types="@sveltejs/kit" />

type RecursiveObject = {
	name: string;
	path: string;
	children?: RecursiveObject[];
};

interface Directroy {
	files: string[];
}

interface Window {
	ipc: {
		send: {
			sync: <T>(channel: string, data: any) => T | undefined;
			async: (channel: string, data: any) => void;
		};
		listen: (channel: string, func: (...args: any[]) => void) => void;
	};
	fs: {
		readDir: (readPath: string) => Promise<RecursiveObject[]>;
		readFile: (readPath: string) => Promise<string>;
	};
}
