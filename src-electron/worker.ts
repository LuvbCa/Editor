import fs from "fs";
import path from "path";

import worker from "workerpool";

interface Dir {
	name: string;
	path: string;
	children?: Dir[];
	type: "directory" | "file";
}

async function recursiveDir(readPath: string): Promise<Dir> {
	const fullPath = path.resolve(readPath);

	let dir = await fs.promises.opendir(fullPath);

	const temp: Dir[] = [];

	for await (let currentEntry of dir) {
		if (currentEntry.isFile() || currentEntry.isSymbolicLink()) {
			temp.push({
				name: currentEntry.name,
				path: fullPath + "\\" + currentEntry.name,
				children: undefined,
				type: "file",
			});
		}

		if (currentEntry.isDirectory()) {
			temp.push({
				name: currentEntry.name,
				path: fullPath + "\\" + currentEntry.name,
				children: [],
				type: "directory",
			});
			worker.workerEmit(fullPath + "\\" + currentEntry.name);
		}
	}
	return {
		path: fullPath,
		children: temp,
		type: "directory",
		name: fullPath.substr(fullPath.lastIndexOf("\\") + 1),
	};
}

worker.worker({
	recursiveDir,
});
