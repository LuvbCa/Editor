"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFsObject = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const generateFsObject = () => {
    return {
        layerReadDir,
        readFile,
    };
};
exports.generateFsObject = generateFsObject;
const readFile = async (readPath) => {
    const file = await fs_1.default.promises.readFile(readPath, {
        encoding: "utf-8",
    });
    return file;
};
const layerReadDir = async (readPath, maxLayer, currentLayer = 0) => {
    /*
        maxLayer = 0: read only given dir,
        maxLayer = 1: read given dir and every child dir,
        maxLayer = 2: read given dir and every child dir and every child dir of the child dir etc...
        */
    const fullPath = path_1.default.resolve(readPath);
    const root = {
        name: fullPath.substr(fullPath.lastIndexOf("\\") + 1),
        path: fullPath,
        children: {},
        type: "directory",
    };
    if (maxLayer < currentLayer) {
        return root;
    }
    const dir = await fs_1.default.promises.opendir(fullPath);
    for await (let currentEntry of dir) {
        if (currentEntry.isFile() || currentEntry.isSymbolicLink()) {
            const resolvedPath = path_1.default.join(fullPath, currentEntry.name);
            root.children[currentEntry.name] = {
                name: currentEntry.name,
                path: resolvedPath,
                type: "file",
            };
        }
        if (currentEntry.isDirectory()) {
            const newDir = path_1.default.join(fullPath, currentEntry.name);
            try {
                const newRead = await layerReadDir(newDir, maxLayer, currentLayer + 1);
                root.children[currentEntry.name] = newRead;
            }
            catch (e) {
                // root.children[currentEntry.name] = e;
                console.warn(`${e} -> reading will continue`);
            }
        }
    }
    return root;
};
