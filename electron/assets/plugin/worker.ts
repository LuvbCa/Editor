import { parentPort, workerData } from "worker_threads";
import { MessageEvent } from "./types";

const main = () => {
	if (!parentPort) throw new Error("no parentPort");
    
	parentPort.on("message", (input: MessageEvent) => {
		if (input.type === "start") {

		}
	});
};


const 

main();
