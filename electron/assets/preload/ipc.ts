import { v4 as uuidv4 } from "uuid";
import { ipcRenderer } from "electron";

const validSendChannels = [
	"dirDialog",
	"close",
	"minimize",
	"maximize",
	"test",
	"testPerformance",
];
const validListenChannels = ["dirSelected", "maximized", "finishedLoading"];

const validBalanceTypes = ["recursiveDir"];

export const generateIpcObject = (
	extendSendChannels?: string[],
	extendListenChannels?: string[]
) => {
	if (extendSendChannels) validSendChannels.push(...extendSendChannels);
	if (extendListenChannels) validListenChannels.push(...extendListenChannels);
	return {
		send: {
			async: sendAsync,
		},
		listen,
		balanceLoad,
	};
};

const listen = (channel: string, func: (...args: any[]) => void): void => {
	// if (validInternChannels.includes(channel)) {
	// 	ipcRenderer.on(channel, (...args) => func(...args));
	// }
	if (validListenChannels.includes(channel)) {
		// Deliberately strip event as it includes `sender`
		ipcRenderer.on(channel, (event, ...args) => func(...args));
	} else {
		console.warn(`channel not supported: ${channel}`);
	}
};

const sendAsync = (channel: string, data: any): void => {
	if (validSendChannels.includes(channel)) {
		ipcRenderer.send(channel, data);
	} else {
		console.warn(`channel not supported: ${channel}`);
	}
};

/**
 * @deprecated may be removed in the future
 * TODO: can be removed?
 */
const balanceLoad = (
	type: string,
	input: {
		[key: string]: string | number | boolean;
	},
	callback: (...args: any[]) => void
) => {
	if (!validBalanceTypes.includes(type)) {
		console.warn("balance type not supported!");
		return;
	}

	const uuid = uuidv4();

	ipcRenderer.send("balanceLoad", type, uuid, input);
	ipcRenderer.once(`${type}:${uuid}`, (event, ...args) => {
		callback(...args);
	});
};
