"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateIpcObject = void 0;
const uuid_1 = require("uuid");
const electron_1 = require("electron");
const validSendChannels = [
    "dirDialog",
    "close",
    "minimize",
    "maximize",
    "test",
    "testPerformance",
];
const validListenChannels = ["dirSelected", "maximized"];
const validBalanceTypes = ["recursiveDir"];
const generateIpcObject = (extendSendChannels, extendListenChannels) => {
    if (extendSendChannels)
        validSendChannels.push(...extendSendChannels);
    if (extendListenChannels)
        validListenChannels.push(...extendListenChannels);
    return {
        send: {
            async: sendAsync,
        },
        listen,
        balanceLoad,
    };
};
exports.generateIpcObject = generateIpcObject;
const listen = (channel, func) => {
    // if (validInternChannels.includes(channel)) {
    // 	ipcRenderer.on(channel, (...args) => func(...args));
    // }
    if (validListenChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        electron_1.ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
    else {
        console.warn(`channel not supported: ${channel}`);
    }
};
const sendAsync = (channel, data) => {
    if (validSendChannels.includes(channel)) {
        electron_1.ipcRenderer.send(channel, data);
    }
    else {
        console.warn(`channel not supported: ${channel}`);
    }
};
/**
 * @deprecated may be removed in the future
 * TODO: can be removed?
 */
const balanceLoad = (type, input, callback) => {
    if (!validBalanceTypes.includes(type)) {
        console.warn("balance type not supported!");
        return;
    }
    const uuid = (0, uuid_1.v4)();
    electron_1.ipcRenderer.send("balanceLoad", type, uuid, input);
    electron_1.ipcRenderer.once(`${type}:${uuid}`, (event, ...args) => {
        callback(...args);
    });
};
