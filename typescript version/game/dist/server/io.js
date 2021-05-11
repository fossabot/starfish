"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stubify = exports.io = void 0;
const dist_1 = __importDefault(require("../../../common/dist"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const frontend_1 = __importDefault(require("./events/frontend"));
const discord_1 = __importDefault(require("./events/discord"));
const general_1 = __importDefault(require("./events/general"));
const combat_1 = __importDefault(require("./events/combat"));
const motion_1 = __importDefault(require("./events/motion"));
const crew_1 = __importDefault(require("./events/crew"));
const httpServer = http_1.createServer();
exports.io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: `*`,
    },
});
exports.io.on(`connection`, (socket) => {
    frontend_1.default(socket);
    discord_1.default(socket);
    general_1.default(socket);
    combat_1.default(socket);
    motion_1.default(socket);
    crew_1.default(socket);
});
function stubify(prop) {
    const circularReferencesRemoved = JSON.parse(JSON.stringify(prop, (key, value) => {
        if ([`toUpdate`].includes(key))
            return;
        if ([`game`, `ship`].includes(key))
            return value.id;
        if ([`ships`].includes(key) && Array.isArray(value))
            return value.map((v) => stubify({
                ...v,
                visible: null,
            }));
        return value;
    }));
    circularReferencesRemoved.lastUpdated = Date.now();
    return circularReferencesRemoved;
}
exports.stubify = stubify;
httpServer.listen(4200);
dist_1.default.log('io server listening on port 4200');
//# sourceMappingURL=io.js.map