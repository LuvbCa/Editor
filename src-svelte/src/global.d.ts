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
	meta: {
		workersBooted: number;
	};
	ipc: {
		send: {
			sync: <T extends unknown>(channel: string, data: any) => void | T;
			async: (channel: string, data: any) => void;
		};
		listen: (channel: string, func: (...args: any[]) => void) => void;
		balanceLoad: (type: string, callback: (...args: any[]) => any) => void;
	};
	fs: {
		readDir: (readPath: string) => Promise<RecursiveObject[]>;
		readFile: (readPath: string) => Promise<string>;
	};
}
