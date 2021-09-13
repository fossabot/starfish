"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dist_1 = __importDefault(require("../../../../common/dist"));
const db_1 = require("../../db");
const __1 = require("../..");
function default_1(socket) {
    socket.on(`game:save`, () => {
        __1.game.save();
    });
    socket.on(`game:resetAllPlanets`, async () => {
        dist_1.default.log(`Admin resetting all planets`);
        await db_1.db.planet.wipe();
        while (__1.game.planets.length)
            __1.game.planets.pop();
    });
    socket.on(`game:resetAllZones`, async () => {
        dist_1.default.log(`Admin resetting all zones`);
        await db_1.db.zone.wipe();
        while (__1.game.zones.length)
            __1.game.zones.pop();
    });
    socket.on(`game:resetAllCaches`, async () => {
        dist_1.default.log(`Admin resetting all caches`);
        await db_1.db.cache.wipe();
        while (__1.game.caches.length)
            __1.game.caches.pop();
    });
    socket.on(`game:resetAllAttackRemnants`, async () => {
        dist_1.default.log(`Admin resetting all attack remnants`);
        await db_1.db.attackRemnant.wipe();
        while (__1.game.attackRemnants.length)
            __1.game.attackRemnants.pop();
    });
    socket.on(`game:resetAllAIShips`, async () => {
        dist_1.default.log(`Admin resetting all AI ships`);
        await db_1.db.ship.wipeAI();
        __1.game.ships.forEach((ship) => {
            if (ship.ai)
                __1.game.ships.splice(__1.game.ships.findIndex((s) => s === ship), 1);
        });
    });
    socket.on(`game:resetAllShips`, async () => {
        dist_1.default.log(`Admin resetting all ships`);
        await db_1.db.ship.wipe();
        while (__1.game.ships.length)
            __1.game.ships.pop();
    });
}
exports.default = default_1;
//# sourceMappingURL=admin.js.map