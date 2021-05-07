"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stubify = exports.io = void 0;
const dist_1 = __importDefault(require("../../../common/dist"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const __1 = require("../");
const httpServer = http_1.createServer();
exports.io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: `*`,
    },
});
exports.io.on(`connection`, (socket) => {
    // ----- Admin Frontend -----
    socket.on('god', () => {
        socket.join(['game']);
    });
    // ----- Frontend -----
    socket.on('ship:listen', (id, callback) => {
        dist_1.default.log(`Frontend client started watching ship ${id} io`);
        socket.join([`ship:${id}`]);
        const foundShip = __1.game.ships.find((s) => s.id === id);
        if (foundShip) {
            const stub = stubify(foundShip);
            callback({ data: stub });
        }
        else
            callback({ error: `No ship found by that ID.` });
    });
    socket.on('ship:unlisten', (id) => {
        dist_1.default.log('gray', `Frontend client stopped watching ${id} io`);
        socket.leave(`ship:${id}`);
    });
    socket.on('ship:targetLocation', (id, targetLocation) => {
        if (!Array.isArray(targetLocation) ||
            targetLocation.length !== 2 ||
            targetLocation.find((l) => isNaN(parseInt(l))))
            return dist_1.default.log('Invalid call to set targetLocation:', id, targetLocation);
        const foundShip = __1.game.ships.find((s) => s.id === id);
        if (foundShip)
            foundShip.targetLocation = targetLocation;
    });
    // socket.on(`ship:get`, (id, callback) => {
    //   const foundShip = game.ships.find((s) => s.id === id)
    //   if (foundShip) {
    //     const stub = stubify<Ship, ShipStub>(foundShip)
    //     callback({
    //       data: stub,
    //     })
    //   } else
    //     callback({ error: `No ship found by that ID.` })
    // })
    // ----- Discord -----
    socket.on('discord', () => {
        dist_1.default.log(`Discord process connected to io`);
        socket.join([`discord`]);
    });
    socket.on(`ship:get`, (id, callback) => {
        const foundShip = __1.game.ships.find((s) => s.id === id);
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
        const foundShip = __1.game.ships.find((s) => s.id === data.id);
        if (foundShip) {
            dist_1.default.log(`Call to create existing ship, returning existing`);
            const stub = stubify(foundShip);
            callback({
                data: stub,
            });
        }
        else {
            const ship = __1.game.addHumanShip(data);
            const stub = stubify(ship);
            callback({
                data: stub,
            });
        }
    });
    socket.on(`ship:attack`, (data, callback) => {
        const foundShip = __1.game.ships.find((s) => s.id === data.id);
        const enemyShip = __1.game.ships.find((s) => s.id === data.enemyId);
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
    circularReferencesRemoved.lastUpdated = Date.now();
    return circularReferencesRemoved;
}
exports.stubify = stubify;
httpServer.listen(4200);
//# sourceMappingURL=clientEvents.js.map