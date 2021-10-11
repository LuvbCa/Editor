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
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
var validSendChannels = [
    "dirDialog",
    "close",
    "minimize",
    "maximize",
    "testPerformance",
];
var validListenChannels = ["dirSelected"];
var ipcObject = {
    send: {
        sync: function (channel, data) {
            if (validSendChannels.includes(channel)) {
                return electron_1.ipcRenderer.sendSync(channel, data);
            }
            else {
                console.log("channel not supported!");
            }
        },
        async: function (channel, data) {
            if (validSendChannels.includes(channel)) {
                electron_1.ipcRenderer.send(channel, data);
            }
            else {
                console.log("channel not supported!");
            }
            return undefined;
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
};
var fsObject = {
    readDir: function (readPath) { return __awaiter(void 0, void 0, void 0, function () {
        var fullPath, dir, temp, dir_1, dir_1_1, currentEntry, newDir, newRead, e_1_1;
        var e_1, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    fullPath = readPath;
                    dir = fs_1.default.opendirSync(fullPath);
                    temp = [];
                    if (!dir)
                        return [2 /*return*/, []];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 7, 8, 13]);
                    dir_1 = __asyncValues(dir);
                    _b.label = 2;
                case 2: return [4 /*yield*/, dir_1.next()];
                case 3:
                    if (!(dir_1_1 = _b.sent(), !dir_1_1.done)) return [3 /*break*/, 6];
                    currentEntry = dir_1_1.value;
                    if (currentEntry.isFile() || currentEntry.isSymbolicLink()) {
                        temp.push({
                            name: currentEntry.name,
                            path: readPath + "\\" + currentEntry.name,
                            children: undefined,
                        });
                    }
                    if (!currentEntry.isDirectory()) return [3 /*break*/, 5];
                    newDir = path_1.default.join(fullPath, currentEntry.name);
                    return [4 /*yield*/, fsObject.readDir(newDir)];
                case 4:
                    newRead = _b.sent();
                    if (!newRead)
                        return [2 /*return*/, []];
                    temp.push({
                        name: currentEntry.name,
                        path: readPath + "\\" + currentEntry.name,
                        children: newRead,
                    });
                    _b.label = 5;
                case 5: return [3 /*break*/, 2];
                case 6: return [3 /*break*/, 13];
                case 7:
                    e_1_1 = _b.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 13];
                case 8:
                    _b.trys.push([8, , 11, 12]);
                    if (!(dir_1_1 && !dir_1_1.done && (_a = dir_1.return))) return [3 /*break*/, 10];
                    return [4 /*yield*/, _a.call(dir_1)];
                case 9:
                    _b.sent();
                    _b.label = 10;
                case 10: return [3 /*break*/, 12];
                case 11:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 12: return [7 /*endfinally*/];
                case 13: return [2 /*return*/, temp];
            }
        });
    }); },
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
