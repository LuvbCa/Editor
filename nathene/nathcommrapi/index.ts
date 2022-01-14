import { v4 } from "uuid";
import { Server, createServer } from "net";
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
			const server = createServer((socket) => {
				console.log("connection received.");

				socket.setEncoding("utf8");

				socket.on("data", (data) => {
					if (!socket.readableEncoding) throw new Error("encoding not set");

					const stringData = data.toString(socket.readableEncoding);

					if (
						stringData.startsWith("\u0002") &&
						stringData.endsWith("\u0003")
					) {
						console.log("received new command");

						const length = stringData.length;

						const text = stringData.slice(1, length - 1);

						console.log(text);
					}
					// parseAndHandle(stringData, receiveHandler);
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
				server.listen(54732, "localhost", () => {
					console.log("tcp now listening on port '54732'");
				});
			}

			server.on("error", (err) => {
				console.error(err);
			});
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

const parseAndHandle = (
	data: string,
	handler: (event: string, payload: any) => void
) => {
	const jsonData = JSON.parse(data);

	const { event, payload } = jsonData;

	if (!event) throw new Error("no event delievered");

	handler(event, payload);
};

