"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connected = exports.io = void 0;
const dist_1 = __importDefault(require("../../../common/dist"));
const socket_io_client_1 = __importDefault(require("socket.io-client"));
// connect to server
const client = socket_io_client_1.default(`http://localhost:4200`);
exports.io = client.connect();
exports.io.on(`connect`, () => {
    dist_1.default.log(`Connected to game server.`);
});
exports.io.on(`disconnect`, () => {
    dist_1.default.log('red', `Lost connection to game server.`);
});
function connected() {
    return new Promise(async (resolve) => {
        if (exports.io.connected) {
            resolve(true);
            return;
        }
        let timeout = 0;
        while (timeout < 100) {
            // 10 seconds
            await dist_1.default.sleep(100);
            if (exports.io.connected) {
                resolve(true);
                return;
            }
            timeout++;
        }
        dist_1.default.log('yellow', `Attempted to access game server io while socket was disconnected.`);
        resolve(false);
    });
}
exports.connected = connected;
const ship = __importStar(require("./ship"));
exports.default = {
    connected,
    ship,
};
//# sourceMappingURL=index.js.map