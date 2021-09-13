"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dist_1 = __importDefault(require("../../../common/dist"));
const socket_io_1 = require("socket.io");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const frontend_1 = __importDefault(require("./events/frontend"));
const discord_1 = __importDefault(require("./events/discord"));
const general_1 = __importDefault(require("./events/general"));
const crew_1 = __importDefault(require("./events/crew"));
const items_1 = __importDefault(require("./events/items"));
const admin_1 = __importDefault(require("./events/admin"));
const http_1 = require("http");
const https_1 = require("https");
let server;
try {
    const serverConfig = {
        key: fs_1.default.readFileSync(path_1.default.resolve(`/etc/letsencrypt/live/www.starfish.cool/privkey.pem`)),
        cert: fs_1.default.readFileSync(path_1.default.resolve(`/etc/letsencrypt/live/www.starfish.cool/fullchain.pem`)),
        ca: fs_1.default.readFileSync(path_1.default.resolve(`/etc/letsencrypt/live/www.starfish.cool/chain.pem`)),
        requestCert: true,
        rejectUnauthorized: false,
    };
    server = https_1.createServer(serverConfig);
}
catch (e) {
    server = http_1.createServer();
}
const io = new socket_io_1.Server(server, {
    cors: {
        origin: `*`,
    },
});
io.on(`connection`, (socket) => {
    frontend_1.default(socket);
    discord_1.default(socket);
    general_1.default(socket);
    crew_1.default(socket);
    items_1.default(socket);
    admin_1.default(socket);
});
server.listen(4200);
dist_1.default.log(`io server listening on port 4200`);
exports.default = io;
//# sourceMappingURL=io.js.map