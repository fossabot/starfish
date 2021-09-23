"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dist_1 = __importDefault(require("../../../../common/dist"));
const fs_1 = __importDefault(require("fs"));
const db_1 = require("../../db");
const __1 = require("../..");
let adminKeys;
try {
    adminKeys = fs_1.default
        .readFileSync(process.env.ADMIN_KEYS_FILE, `utf-8`)
        .trim();
}
catch (e) {
    try {
        adminKeys = fs_1.default
            .readFileSync(`/run/secrets/admin_keys`, `utf-8`)
            .trim();
    }
    catch (e) {
        adminKeys = ``;
    }
}
try {
    adminKeys = JSON.parse(adminKeys);
}
catch (e) {
    adminKeys = false;
    dist_1.default.log(`red`, `Error loading admin keys!`, e);
}
function isAdmin(id, password) {
    if (process.env.NODE_ENV === `development`)
        return true;
    if (!adminKeys)
        return false;
    if (password !== adminKeys?.password) {
        return false;
    }
    if (!adminKeys?.allowedIds?.includes(id)) {
        return false;
    }
    return true;
}
function default_1(socket) {
    socket.on(`game:adminCheck`, (id, password, callback) => {
        return callback(isAdmin(id, password));
    });
    socket.on(`game:save`, (id, password) => {
        if (!isAdmin(id, password))
            return dist_1.default.log(`Non-admin attempted to access game:save`);
        __1.game.save();
    });
    socket.on(`game:pause`, (id, password) => {
        if (!isAdmin(id, password))
            return dist_1.default.log(`Non-admin attempted to access game:pause`);
        __1.game.paused = true;
        dist_1.default.log(`yellow`, `Game paused`);
    });
    socket.on(`game:unpause`, (id, password) => {
        if (!isAdmin(id, password))
            return dist_1.default.log(`Non-admin attempted to access game:unpause`);
        __1.game.paused = false;
        dist_1.default.log(`yellow`, `Game unpaused`);
    });
    socket.on(`game:messageAll`, (id, password, message) => {
        if (!isAdmin(id, password))
            return dist_1.default.log(`Non-admin attempted to access game:messageAll`);
        if (Array.isArray(message))
            message.unshift({
                color: `#888`,
                text: `Message from game admin:`,
            });
        else
            message = [
                {
                    color: `#888`,
                    text: `Message from game admin:`,
                },
                message,
            ];
        __1.game.humanShips.forEach((s) => {
            s.logEntry(message, `critical`);
        });
    });
    socket.on(`game:resetAllPlanets`, async (id, password) => {
        if (!isAdmin(id, password))
            return dist_1.default.log(`Non-admin attempted to access game:resetAllPlanets`);
        dist_1.default.log(`Admin resetting all planets`);
        await db_1.db.planet.wipe();
        while (__1.game.planets.length)
            __1.game.planets.pop();
        __1.game.humanShips.forEach((s) => {
            while (s.seenPlanets.length)
                s.seenPlanets.pop();
            s.toUpdate.seenPlanets = [];
        });
        __1.game.factions.forEach((f) => (f.homeworld = null));
    });
    socket.on(`game:reLevelAllPlanets`, async (id, password) => {
        if (!isAdmin(id, password))
            return dist_1.default.log(`Non-admin attempted to access game:reLevelAllPlanets`);
        dist_1.default.log(`Admin releveling all planets`);
        __1.game.planets.forEach((p) => p.resetLevels());
    });
    socket.on(`game:resetAllZones`, async (id, password) => {
        if (!isAdmin(id, password))
            return dist_1.default.log(`Non-admin attempted to access game:resetAllZones`);
        dist_1.default.log(`Admin resetting all zones`);
        await db_1.db.zone.wipe();
        while (__1.game.zones.length)
            __1.game.zones.pop();
        __1.game.humanShips.forEach((s) => {
            while (s.seenLandmarks.length)
                s.seenLandmarks.pop();
            s.toUpdate.seenLandmarks = [];
        });
    });
    socket.on(`game:resetAllCaches`, async (id, password) => {
        if (!isAdmin(id, password))
            return dist_1.default.log(`Non-admin attempted to access game:resetAllCaches`);
        dist_1.default.log(`Admin resetting all caches`);
        await db_1.db.cache.wipe();
        while (__1.game.caches.length)
            __1.game.caches.pop();
    });
    socket.on(`game:resetAllAttackRemnants`, async (id, password) => {
        if (!isAdmin(id, password))
            return dist_1.default.log(`Non-admin attempted to access game:resetAllAttackRemnants`);
        dist_1.default.log(`Admin resetting all attack remnants`);
        await db_1.db.attackRemnant.wipe();
        while (__1.game.attackRemnants.length)
            __1.game.attackRemnants.pop();
    });
    socket.on(`game:resetAllAIShips`, async (id, password) => {
        if (!isAdmin(id, password))
            return dist_1.default.log(`Non-admin attempted to access game:resetAllAIShips`);
        dist_1.default.log(`Admin resetting all AI ships`);
        await db_1.db.ship.wipeAI();
        __1.game.ships.forEach((ship) => {
            if (ship.ai)
                __1.game.ships.splice(__1.game.ships.findIndex((s) => s === ship), 1);
        });
    });
    socket.on(`game:resetAllShips`, async (id, password) => {
        if (!isAdmin(id, password))
            return dist_1.default.log(`Non-admin attempted to access game:resetAllShips`);
        dist_1.default.log(`Admin resetting all ships`);
        await db_1.db.ship.wipe();
        while (__1.game.ships.length)
            __1.game.ships.pop();
    });
    socket.on(`game:shipList`, async (id, password, humanOnly, callback) => {
        if (!isAdmin(id, password))
            return dist_1.default.log(`Non-admin attempted to access game:shipList`);
        callback({
            data: __1.game.ships
                .filter((s) => (humanOnly ? s.human : true))
                .map((s) => ({
                name: s.name,
                id: s.id,
                faction: { id: s.faction.id },
                species: { id: s.species.id },
                crewMemberCount: s.crewMembers.length,
                isTutorial: s.tutorial
                    ? s.tutorial.ship?.crewMembers[0]?.name ||
                        `unknown crew member`
                    : false,
            })),
        });
    });
}
exports.default = default_1;
//# sourceMappingURL=admin.js.map