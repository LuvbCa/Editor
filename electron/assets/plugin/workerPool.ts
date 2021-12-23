import { EventEmitter } from "events";
import { Worker } from "worker_threads";
import { PluginManifest, PluginIdentifier, PluginCode } from "./types";
import path from "path";
import { ipcMain } from "electron";

interface ExtendedWorker {
	worker: Worker;
	executing: boolean;
	id: number;
}

export class WorkerPool extends EventEmitter {
	workers: ExtendedWorker[];
	debug = true;

	constructor(threads: number, debug?: boolean) {
		super();

		if (debug) this.debug = debug;
		this.workers = [];

		for (let i = 0; i < threads; i++) {
			const newWorker = new Worker(
				path.resolve("dist", "assets", "plugin", "worker.js"),
				{
					stdout: true,
					stderr: true,
					resourceLimits: {
						stackSizeMb: 8,
					},
				}
			);

			//TODO: Isolate Workers from global System?

			if (this.debug) {
				newWorker.stdout.on("data", (data) => {
					if (Buffer.isBuffer(data)) {
						const utf8Data = data.toString("utf-8");
						process.stdout.write(`[Worker-${i}]: ${utf8Data}`);
						return;
					}
					console.log(`[Worker-${i}]: ${data}`);
				});

				newWorker.stderr.on("data", (data) => {
					if (Buffer.isBuffer(data)) {
						const utf8Data = data.toString("utf-8");
						process.stdout.write(`[Worker-${i}]: ${utf8Data}`);
						return;
					}
					console.log(`[Worker-${i}]: ${data}`);
				});
			}

			this.workers.push({
				executing: false,
				worker: newWorker,
				id: i,
			});
		}

		ipcMain.on("editorRegistered", (_, state) => {
			this.broadcastToAll("onEditorRegistered", state);
		});

		ipcMain.on("editorReleased", (_, uuid) => {
			this.broadcastToAll("onEditorReleased", uuid);
		});

		ipcMain.on("editorStateUpdate", (_, state) => {
			this.broadcastToAll("onEditorStateUpdate", state);
		});
	}

	public getWorkerById(id: number): ExtendedWorker | undefined {
		const worker = this.workers.find((value) => {
			if (value.id == id) return value;
		});

		return worker;
	}

	public async releaseAll() {
		console.log("releasing all Workers");
		for (const worker of this.workers) {
			await worker.worker.terminate();
		}
	}

	public broadcastToAll(event: string, input?: any) {
		for (const worker of this.workers) {
			worker.worker.postMessage({ type: event, input });
		}
	}

	public startThread(threadId: number, input: PluginManifest[]) {
		const worker = this.getWorkerById(threadId);
		if (!worker) throw new TypeError(`Worker-${threadId} does not exsist.`);

		worker.worker.postMessage({ type: "start", input });
	}
}
