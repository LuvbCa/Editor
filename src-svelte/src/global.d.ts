/// <reference types="@sveltejs/kit" />

type RecursiveObject = {
	name: string;
	path: string;
	children?: RecursiveObject[];
};

interface EditorLine {
	text: string;
	indent: number;
}

interface SyntaxLine {
	content: {
		type: string;
		endPosition: Parser.Point;
		startPosition: Parser.Point;
	}[];
}

interface MetaLine {
	render: EditorLine;
	syntax: SyntaxLine;
	uuid: number;
}

interface LayerEntry {
	name: string;
	path: string;
}
interface LayerDir extends LayerEntry {
	children: { [key: string]: LayerDir | LayerFile };
	type: 'directory';
}

interface LayerFile extends LayerEntry {
	type: 'file';
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
		balanceLoad: (
			type: string,
			input: {
				[key: string]: any;
			},
			callback: (...args: any[]) => any
		) => void;
	};
	fs: {
		readDir: (readPath: string) => Promise<RecursiveObject[]>;
		readFile: (readPath: string) => Promise<string>;
		layerReadDir: (readPath: string, maxLayer: number, currentLayer: number) => Promise<LayerDir>;
	};
}
