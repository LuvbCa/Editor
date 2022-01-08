import { v4 } from "uuid";
import { Server } from "net";
import { ChildProcess } from "child_process";

interface ServerOptions {
	type: "tcp" | "ipc" | "node-builtin-ipc";
	process?: ChildProcess;
}

export const startServer = (
	options: ServerOptions,
	receiveHandler: (event: string, data: any) => void
): Promise<(event: string, payload: any) => void> => {
	return new Promise((resolve, reject) => {
		if (options.type == "tcp" || options.type == "ipc") {
			const server = new Server((socket) => {
				socket.setEncoding("utf8");

				socket.on("connect", () => {
					console.log("connected");
				});

				socket.on("data", (data) => {
					if (!socket.readableEncoding) throw new Error("encoding not set");

					const stringData = data.toString(socket.readableEncoding);
					const jsonData = JSON.parse(stringData);

					const { event, payload } = jsonData;

					if (!event) throw new Error("no event delievered");

					receiveHandler(event, payload);
				});

				resolve((event, payload) => {
					const concat = { event, payload };

					const json = JSON.stringify(concat);

					if (!socket.readableEncoding) throw new Error("encoding not set");
					socket.write(json, socket.readableEncoding);
				});
			});

			if (options.type == "ipc") {
				server.listen("\\\\?\\pipe\\nathene.editor", 100, () => {
					console.log("ipc now listening on '\\\\?\\pipe\\nathene.editor'");
				});
			} else {
				server.listen(98573, "localhost", () => {
					console.log("tcp now listening on port '98573'");
				});
			}
		} else if (options.type == "node-builtin-ipc") {
			if (!options.process) throw new Error("no ChildProcess is given");

			options.process.on("message", (payload) => {
				if (typeof payload !== "object") throw new Error("wrong data type");
				const { event, data } = payload as any;

				if (!event) throw new Error("no event delievered");

				receiveHandler(event, data);
			});

			resolve((event, payload) => {
				const concat = { event, payload };
				options.process?.send(concat);
			});
		}
	});
};
