"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var uuid_1 = require("uuid");
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var validSendChannels = [
    "dirDialog",
    "close",
    "minimize",
    "maximize",
    "test",
    "testPerformance",
];
var validListenChannels = ["dirSelected"];
var validBalanceTypes = ["recursiveDir"];
electron_1.ipcRenderer.on("error", function (event, errorcode) {
    alert(errorcode);
});
electron_1.ipcRenderer.on("meta", function (event, meta) {
    console.log("meta", meta);
});
var ipcObject = {
    send: {
        sync: function (channel, data) {
            if (validSendChannels.includes(channel))
                return electron_1.ipcRenderer.sendSync(channel, data);
            console.warn("channel not supported!");
        },
        async: function (channel, data) {
            if (validSendChannels.includes(channel)) {
                electron_1.ipcRenderer.send(channel, data);
            }
            else {
                console.warn("channel not supported!");
            }
        },
    },
    listen: function (channel, func) {
        if (validListenChannels.includes(channel)) {
            // Deliberately strip event as it includes `sender`
            electron_1.ipcRenderer.on(channel, function (event) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
                return func.apply(void 0, args);
            });
        }
        else {
            console.log("channel not supported!");
        }
    },
    balanceLoad: function (type, input, callback) {
        if (!validBalanceTypes.includes(type)) {
            console.warn("balance type not supported!");
            return;
        }
        var uuid = (0, uuid_1.v4)();
        electron_1.ipcRenderer.send("balanceLoad", type, uuid, input);
        electron_1.ipcRenderer.once(type + ":" + uuid, function (event) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            callback.apply(void 0, args);
        });
    },
};
var fsObject = {
    /**
     * @deprecated will removed before v1.0.0 -> use layerReadDir instead
     */
    readDir: function (readPath) { return __awaiter(void 0, void 0, void 0, function () {
        var fullPath, dir, temp, dir_1, dir_1_1, currentEntry, newDir, newRead, e_1_1;
        var e_1, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    fullPath = readPath;
                    return [4 /*yield*/, fs_1.default.promises.opendir(fullPath)];
                case 1:
                    dir = _b.sent();
                    temp = [];
                    if (!dir)
                        return [2 /*return*/, []];
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 8, 9, 14]);
                    dir_1 = __asyncValues(dir);
                    _b.label = 3;
                case 3: return [4 /*yield*/, dir_1.next()];
                case 4:
                    if (!(dir_1_1 = _b.sent(), !dir_1_1.done)) return [3 /*break*/, 7];
                    currentEntry = dir_1_1.value;
                    if (currentEntry.isFile() || currentEntry.isSymbolicLink()) {
                        temp.push({
                            name: currentEntry.name,
                            path: readPath + "\\" + currentEntry.name,
                            children: undefined,
                        });
                    }
                    if (!currentEntry.isDirectory()) return [3 /*break*/, 6];
                    newDir = path_1.default.join(fullPath, currentEntry.name);
                    return [4 /*yield*/, fsObject.readDir(newDir)];
                case 5:
                    newRead = _b.sent();
                    temp.push({
                        name: currentEntry.name,
                        path: readPath + "\\" + currentEntry.name,
                        children: newRead,
                    });
                    _b.label = 6;
                case 6: return [3 /*break*/, 3];
                case 7: return [3 /*break*/, 14];
                case 8:
                    e_1_1 = _b.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 14];
                case 9:
                    _b.trys.push([9, , 12, 13]);
                    if (!(dir_1_1 && !dir_1_1.done && (_a = dir_1.return))) return [3 /*break*/, 11];
                    return [4 /*yield*/, _a.call(dir_1)];
                case 10:
                    _b.sent();
                    _b.label = 11;
                case 11: return [3 /*break*/, 13];
                case 12:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 13: return [7 /*endfinally*/];
                case 14: return [2 /*return*/, temp];
            }
        });
    }); },
    layerReadDir: function (readPath, maxLayer, currentLayer) {
        if (currentLayer === void 0) { currentLayer = 0; }
        return __awaiter(void 0, void 0, void 0, function () {
            var fullPath, root, dir, dir_2, dir_2_1, currentEntry, resolvedPath, newDir, newRead, e_2, e_3_1;
            var e_3, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        fullPath = path_1.default.resolve(readPath);
                        root = {
                            name: fullPath.substr(fullPath.lastIndexOf("\\") + 1),
                            path: fullPath,
                            children: {},
                            type: "directory",
                        };
                        if (maxLayer < currentLayer) {
                            return [2 /*return*/, root];
                        }
                        return [4 /*yield*/, fs_1.default.promises.opendir(fullPath)];
                    case 1:
                        dir = _b.sent();
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 10, 11, 16]);
                        dir_2 = __asyncValues(dir);
                        _b.label = 3;
                    case 3: return [4 /*yield*/, dir_2.next()];
                    case 4:
                        if (!(dir_2_1 = _b.sent(), !dir_2_1.done)) return [3 /*break*/, 9];
                        currentEntry = dir_2_1.value;
                        if (currentEntry.isFile() || currentEntry.isSymbolicLink()) {
                            resolvedPath = path_1.default.join(fullPath, currentEntry.name);
                            root.children[currentEntry.name] = {
                                name: currentEntry.name,
                                path: resolvedPath,
                                type: "file",
                            };
                        }
                        if (!currentEntry.isDirectory()) return [3 /*break*/, 8];
                        newDir = path_1.default.join(fullPath, currentEntry.name);
                        _b.label = 5;
                    case 5:
                        _b.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, fsObject.layerReadDir(newDir, maxLayer, currentLayer + 1)];
                    case 6:
                        newRead = _b.sent();
                        root.children[currentEntry.name] = newRead;
                        return [3 /*break*/, 8];
                    case 7:
                        e_2 = _b.sent();
                        // root.children[currentEntry.name] = e;
                        console.warn(e_2, "----> reading will continue");
                        return [3 /*break*/, 8];
                    case 8: return [3 /*break*/, 3];
                    case 9: return [3 /*break*/, 16];
                    case 10:
                        e_3_1 = _b.sent();
                        e_3 = { error: e_3_1 };
                        return [3 /*break*/, 16];
                    case 11:
                        _b.trys.push([11, , 14, 15]);
                        if (!(dir_2_1 && !dir_2_1.done && (_a = dir_2.return))) return [3 /*break*/, 13];
                        return [4 /*yield*/, _a.call(dir_2)];
                    case 12:
                        _b.sent();
                        _b.label = 13;
                    case 13: return [3 /*break*/, 15];
                    case 14:
                        if (e_3) throw e_3.error;
                        return [7 /*endfinally*/];
                    case 15: return [7 /*endfinally*/];
                    case 16: return [2 /*return*/, root];
                }
            });
        });
    },
    readFile: function (readPath) { return __awaiter(void 0, void 0, void 0, function () {
        var file;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fs_1.default.promises.readFile(readPath, {
                        encoding: "utf-8",
                    })];
                case 1:
                    file = _a.sent();
                    return [2 /*return*/, file];
            }
        });
    }); },
};
electron_1.contextBridge.exposeInMainWorld("ipc", ipcObject);
electron_1.contextBridge.exposeInMainWorld("fs", fsObject);
