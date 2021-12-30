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

interface Point {
	row: number;
	column: number;
}

interface SyntaxLine {
	type: string;
	endPosition: Point;
	startPosition: Point;
	text: string;
}

interface MetaLine {
	render: EditorLine;
	syntax: SyntaxLine[];
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

interface Input {
	[key: string]: any;
}

interface ReadInput extends Input {
	path: string;
}

interface ReadDirInput extends ReadInput {
	maxLayer: number;
	currentLayer: number;
}
interface Window {
	invoke(event: string, input?: Input): Promise<any>;
	invoke(event: 'fs_layer_read_dir', path: ReadDirInput): Promise<LayerDir>;
	invoke(event: 'fs_read_file', input: ReadDirInput): Promise<string>;
}

// interface Window {
// 	meta: {
// 		workersBooted: number;
// 	};
// 	ipc: {
// 		send: {
// 			sync: <T extends unknown>(channel: string, data: any) => void | T;
// 			async: (channel: string, data: any) => void;
// 		};
// 		listen: (channel: string, func: (...args: any[]) => void) => void;
// 		balanceLoad: (
// 			type: string,
// 			input: {
// 				[key: string]: any;
// 			},
// 			callback: (...args: any[]) => any
// 		) => void;
// 	};
// 	fs: {
// 		readDir: (readPath: string) => Promise<RecursiveObject[]>;
// 		readFile: (readPath: string) => Promise<string>;
// 		layerReadDir: (readPath: string, maxLayer: number, currentLayer: number) => Promise<LayerDir>;
// 	};
// 	loading: {
// 		waitInitial: Promise<void>;
// 	};
// }
