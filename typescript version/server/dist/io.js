"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dist_1 = __importDefault(require("../../common/dist"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const dist_2 = require("../../game/dist");
const httpServer = http_1.createServer();
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: `*`,
    },
});
const ioFrontend = io.of(`/frontend`);
ioFrontend.on(`connection`, (socket) => {
    dist_1.default.log(`Frontend client connected to io`);
    socket.emit(`hello`);
    socket.on(`ship:get`, (id, callback) => {
        const foundShip = dist_2.game.ships.find((s) => s.id === id);
        if (foundShip) {
            const stub = stubify(foundShip);
            callback({
                data: stub,
            });
        }
        else
            callback({ error: `No ship found by that ID.` });
    });
});
const ioDiscord = io.of(`/discord`);
ioDiscord.on(`connection`, (socket) => {
    dist_1.default.log(`Discord process connected to io`);
    socket.emit(`hello`);
    socket.on(`ship:get`, (id, callback) => {
        const foundShip = dist_2.game.ships.find((s) => s.id === id);
        if (foundShip) {
            const stub = stubify(foundShip);
            callback({
                data: stub,
            });
        }
        else
            callback({ error: `No ship found by that ID.` });
    });
    socket.on(`ship:create`, (data, callback) => {
        const foundShip = dist_2.game.ships.find((s) => s.id === data.id);
        if (foundShip) {
            dist_1.default.log(`Call to create existing ship, returning existing`);
            const stub = stubify(foundShip);
            callback({
                data: stub,
            });
        }
        else {
            const ship = dist_2.game.addHumanShip(data);
            const stub = stubify(ship);
            callback({
                data: stub,
            });
        }
    });
    socket.on(`ship:thrust`, (data, callback) => {
        const foundShip = dist_2.game.ships.find((s) => s.id === data.id);
        if (!foundShip) {
            dist_1.default.log(`Call to thrust nonexistant ship`);
            callback({
                error: `No ship found by id ${data.id}.`,
            });
        }
        else {
            const res = foundShip.thrust(data.angle, data.powerPercent);
            callback({
                data: res,
            });
        }
    });
    socket.on(`ship:attack`, (data, callback) => {
        const foundShip = dist_2.game.ships.find((s) => s.id === data.id);
        const enemyShip = dist_2.game.ships.find((s) => s.id === data.enemyId);
        const weapon = foundShip.weapons.find((w) => w.id === data.weaponId);
        if (!foundShip || !enemyShip) {
            dist_1.default.log(`Call to attack nonexistant ship`);
            callback({
                error: `No ship found! ${data.id} ${data.enemyId}`,
            });
        }
        else if (!(`attack` in foundShip) ||
            !(`attack` in enemyShip)) {
            dist_1.default.log(`Call to attack pacifist ship`);
            callback({
                error: `Ship not combat ready! ${data.id} ${data.enemyId}`,
            });
        }
        else if (!weapon) {
            dist_1.default.log(`Call to attack without valid weapon id`);
            callback({
                error: `No weapon! ${data.weaponId}`,
            });
        }
        else {
            const res = foundShip.attack(enemyShip, weapon);
            callback({
                data: res,
            });
        }
    });
});
function stubify(prop) {
    const circularReferencesRemoved = JSON.parse(JSON.stringify(prop, (key, value) => {
        if ([`game`, `ship`].includes(key))
            return;
        return value;
    }));
    return circularReferencesRemoved;
}
httpServer.listen(4200);
//# sourceMappingURL=io.js.map