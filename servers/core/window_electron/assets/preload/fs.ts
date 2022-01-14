import fs from "fs";
import path from "path";

interface LayerEntry {
	name: string;
	path: string;
}
interface LayerDir extends LayerEntry {
	children: { [key: string]: LayerDir | LayerFile };
	type: "directory";
}

interface LayerFile extends LayerEntry {
	type: "file";
}

export const generateFsObject = () => {
	return {
		layerReadDir,
		readFile,
	};
};

const readFile = async (readPath: string) => {
	const file = await fs.promises.readFile(readPath, {
		encoding: "utf-8",
	});

	return file;
};

const layerReadDir = async (
	readPath: string,
	maxLayer: number,
	currentLayer: number = 0
) => {
	/*
		maxLayer = 0: read only given dir, 
		maxLayer = 1: read given dir and every child dir, 
		maxLayer = 2: read given dir and every child dir and every child dir of the child dir etc...
		*/

	const fullPath = path.resolve(readPath);
	const root: LayerDir = {
		name: fullPath.slice(fullPath.lastIndexOf("\\") + 1),
		path: fullPath,
		children: {},
		type: "directory",
	};

	if (maxLayer < currentLayer) {
		return root;
	}

	const dir = await fs.promises.opendir(fullPath);

	for await (let currentEntry of dir) {
		if (currentEntry.isFile() || currentEntry.isSymbolicLink()) {
			const resolvedPath = path.join(fullPath, currentEntry.name);
			root.children[currentEntry.name] = {
				name: currentEntry.name,
				path: resolvedPath,
				type: "file",
			};
		}

		if (currentEntry.isDirectory()) {
			const newDir = path.join(fullPath, currentEntry.name);

			try {
				const newRead = await layerReadDir(newDir, maxLayer, currentLayer + 1);

				root.children[currentEntry.name] = newRead;
			} catch (e) {
				// root.children[currentEntry.name] = e;
				console.warn(`${e} -> reading will continue`);
			}
		}
	}

	return root;
};
