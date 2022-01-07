import ipc from "node-ipc";
import { v4 } from "uuid";
import type { Socket } from "net";

/**
 * resolves when server is succesfully created
 */
export const startCommunication = (
	location: "remote" | "local",
	platform: string
): Promise<void> => {
	return new Promise((resolve, reject) => {
		ipc.config.logger = () => {};

		ipc.serve("/tmp/nathene.editor", () => {
			resolve();
		});

		ipc.server.start();
	});
};
