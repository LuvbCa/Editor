import { parentPort, workerData } from "worker_threads";
import path from "path";
import { homedir } from "os";
import { v4 as uuidv4 } from "uuid";
import { NatheneGlobal } from "../../globals";

import {
	PluginManifest,
	PluginIdentifier,
	PluginCode,
	MessageEvent,
} from "./types";

interface InternalFunctionQueue {
	func: Function;
	args: any[];
}
class FunctionQueue {
	private internalQueue: InternalFunctionQueue[] = [];
	private executing = false;

	constructor() {}

	public push(value: InternalFunctionQueue) {
		this.internalQueue.push(value);
	}

	public execute() {
		const latest = this.internalQueue.pop();
		if (!latest) return console.log("no latest function to execute.");
		if (this.executing)
			return console.log("Queue is executing. Wait to finish...");

		const { func, args } = latest;

		this.executing = true;
		func.apply({}, args);
		this.executing = false;
		this.execute();
	}
}

const main = () => {
	if (!parentPort) throw new SyntaxError("No parentPort");

	parentPort.on("message", (event: MessageEvent) => {
		const { type, input } = event;
		if (type === "start") startExecuting(input);
	});
};

const startExecuting = async (arrayOfPlugins: any[]) => {
	const queue = new FunctionQueue();

	for (const plugin of arrayOfPlugins) {
		const newPlugin = await loadPlugin(plugin);
		queue.push(newPlugin);
	}

	console.log("pushed all starting funcs");

	queue.execute();

	// console.log(arrayOfPlugins);
};

const checkPlugin = (input: any): input is PluginCode => {
	if (typeof input !== "object") return false;
	if (!(input["onPluginRegistered"] instanceof Function)) return false;
	return true;
};

const loadPlugin = async (
	plugin: PluginManifest
): Promise<InternalFunctionQueue> => {
	//TODOOO: expose global references to editor windows
	//TODOOOO: expose needed apis to PluginHandler -> events like: editorLoad, editorChanged, editorInput ==> subscribing to handler instead of directly to the event from svelte/dom
	//TODO: make every plugin load in to multithreaded context

	// console.log(NatheneGlobal);

	const absEntryPointPath = path.join(
		homedir(),
		".editor",
		"plugins",
		plugin.name,
		plugin.entryPoint
	);

	const code = require(absEntryPointPath);

	if (!checkPlugin(code))
		throw new Error(`${plugin.name} is not correclty defined`);

	const pluginIdentifer: PluginIdentifier = {
		uuid: uuidv4(),
		name: `${plugin.name}-${plugin.version}`,
	};

	return {
		func: code.onPluginRegistered,
		args: [pluginIdentifer],
	};
};

main();
