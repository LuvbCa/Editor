import ipc from "node-ipc";
import type { Socket } from "net";

interface ServerConnection {
	type: ServerTypes;
	emit: CommunicationFunction;
}

type ServerTypes = "windowServer" | "fileServer" | "uiServer";
type CommunicationFunction = (event: string, payload: any) => void;

export const register = (type: ServerTypes): Promise<ServerConnection> => {
	return new Promise((resolve, reject) => {
		const handler = (payload: { type: ServerTypes }, socket: Socket) => {
			if (payload.type == type)
				resolve({
					type: payload.type,
					emit: (event, payload) => {
						ipc.server.emit(socket, event, payload);
					},
				});
			ipc.server.off("register", handler);
		};
		ipc.server.on("register", handler);
	});
};

/**
 * resolves when server is succesfully created
 */
export const start = (): Promise<void> => {
	return new Promise((resolve, reject) => {
		ipc.config.logger = () => {};

		ipc.serve("/tmp/nathene.editor", () => {
			resolve();
		});

		ipc.server.start();
	});
};
