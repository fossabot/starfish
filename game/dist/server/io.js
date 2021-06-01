"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dist_1 = __importDefault(require("../../../common/dist"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const frontend_1 = __importDefault(require("./events/frontend"));
const discord_1 = __importDefault(require("./events/discord"));
const general_1 = __importDefault(require("./events/general"));
const combat_1 = __importDefault(require("./events/combat"));
const crew_1 = __importDefault(require("./events/crew"));
const items_1 = __importDefault(require("./events/items"));
const httpServer = http_1.createServer();
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: `*`,
    },
});
io.on(`connection`, (socket) => {
    frontend_1.default(socket);
    discord_1.default(socket);
    general_1.default(socket);
    combat_1.default(socket);
    crew_1.default(socket);
    items_1.default(socket);
});
httpServer.listen(4200);
dist_1.default.log(`io server listening on port 4200`);
exports.default = io;
//# sourceMappingURL=io.js.map