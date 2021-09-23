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
const https_1 = require("https");
const http_1 = require("http");
const is_docker_1 = __importDefault(require("is-docker"));
require(`events`).captureRejections = true;
let serverConfig = {};
let webServer;
if ((0, is_docker_1.default)()) {
    if (process.env.NODE_ENV !== `production`) {
        serverConfig = {
            key: fs_1.default.readFileSync(path_1.default.resolve(`./ssl/localhost.key`)),
            cert: fs_1.default.readFileSync(path_1.default.resolve(`./ssl/localhost.crt`)),
        };
    }
    else {
        dist_1.default.log(`green`, `Launching production server...`);
        serverConfig = {
            key: fs_1.default.readFileSync(path_1.default.resolve(`/etc/letsencrypt/live/www.starfish.cool/privkey.pem`)),
            cert: fs_1.default.readFileSync(path_1.default.resolve(`/etc/letsencrypt/live/www.starfish.cool/fullchain.pem`)),
            ca: [
                fs_1.default.readFileSync(path_1.default.resolve(`/etc/letsencrypt/live/www.starfish.cool/chain.pem`)),
            ],
            // requestCert: true
        };
    }
    webServer = (0, https_1.createServer)(serverConfig);
}
else
    webServer = (0, http_1.createServer)(serverConfig);
// * test endpoint to check if the server is running and accessible
webServer.on(`request`, (req, res) => {
    res.end(`ok`);
});
const io = new socket_io_1.Server(webServer, {
    cors: {
        origin: `*`,
        methods: [`GET`, `POST`],
    },
});
io.on(`connection`, (socket) => {
    socket[Symbol.for(`nodejs.rejection`)] = (err) => {
        socket.emit(`disconnectFromServer`);
    };
    (0, frontend_1.default)(socket);
    (0, discord_1.default)(socket);
    (0, general_1.default)(socket);
    (0, crew_1.default)(socket);
    (0, items_1.default)(socket);
    (0, admin_1.default)(socket);
});
webServer.listen(4200);
dist_1.default.log(`green`, `io server listening on port 4200`);
exports.default = io;
//# sourceMappingURL=io.js.map