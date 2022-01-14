import { v4 as uuid } from "uuid";
import { ipcRenderer } from "electron";

interface File {
	/**
	 * name of the file
	 */
	name: string;
	/**
	 * ending of the file. E.g.: `.ts` `.js` `.svelte` `.c` `.cpp` etc.
	 */
	ending: string;
	/**
	 * is the absoulte path to the file
	 */
	path: string;
}

interface EditorState {
	openFile?: File;
	workingDir?: string;
	text?: string;
}

const registeredEditor: Map<string, EditorState> = new Map();

export const generateStateObject = () => {
	return {
		updateEditorState,
		registerEditor,
		releaseEditor,
	};
};

const updateEditorState = (uuid: string, update: EditorState) => {
	const value = registeredEditor.get(uuid);
	if (!value) throw new TypeError("No editor found for that uuid");

	const merged = mergeDeep(value, update);

	registeredEditor.set(uuid, merged);

	ipcRenderer.send("editorStateUpdate", [uuid, registeredEditor.get(uuid)]);

	console.log(registeredEditor);
};

/**
 * @returns a uuid in form of string
 */
const registerEditor = (state?: EditorState): string => {
	const editorIdentifier = uuid({}, Buffer.alloc(16));
	const editorIdentifierHex = editorIdentifier.toString("hex");

	const editorState: EditorState = {
		...state,
	};

	registeredEditor.set(editorIdentifierHex, editorState);

	ipcRenderer.send("editorRegistered", editorState);

	return editorIdentifierHex;
};

const releaseEditor = (uuid: string) => {
	if (!registeredEditor.has(uuid))
		throw new TypeError("No editor found for that uuid");

	registeredEditor.delete(uuid);

	ipcRenderer.send("editorReleased", uuid);
};

const isObject = (item: any): item is object => {
	return item && typeof item === "object" && !Array.isArray(item);
};

const mergeDeep = <T>(target: T, ...sources: T[]): T => {
	if (!sources.length) return target;
	const source = sources.shift();

	if (isObject(target) && isObject(source)) {
		for (const key in source) {
			if (isObject(source[key])) {
				if (!target[key]) Object.assign(target, { [key]: {} });
				mergeDeep(target[key], source[key]);
			} else {
				Object.assign(target, { [key]: source[key] });
			}
		}
	}

	return mergeDeep(target, ...sources);
};
