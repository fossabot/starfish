"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.game = void 0;
const dist_1 = __importDefault(require("../../common/dist"));
const Game_1 = require("./game/Game");
require("./server/io");
const db_1 = require("./db");
db_1.init({});
exports.game = new Game_1.Game();
db_1.runOnReady(async () => {
    // await db.attackRemnant.wipe()
    // await db.planet.wipe()
    // await db.ship.wipe()
    // await db.cache.wipe()
    // await db.zone.wipe()
    // await db.ship.wipeAI()
    const savedPlanets = await db_1.db.planet.getAllConstructible();
    dist_1.default.log(`Loaded ${savedPlanets.length} saved planets from DB.`);
    for (let planet of savedPlanets)
        exports.game.addPlanet(planet, false);
    const savedCaches = await db_1.db.cache.getAllConstructible();
    dist_1.default.log(`Loaded ${savedCaches.length} saved caches from DB.`);
    savedCaches.forEach((cache) => exports.game.addCache(cache, false));
    const savedZones = await db_1.db.zone.getAllConstructible();
    dist_1.default.log(`Loaded ${savedZones.length} saved zones from DB.`);
    savedZones.forEach((zone) => exports.game.addZone(zone, false));
    const savedShips = await db_1.db.ship.getAllConstructible();
    dist_1.default.log(`Loaded ${savedShips.length} saved ships (${savedShips.filter((s) => !s.ai).length} human) from DB.`);
    for (let ship of savedShips) {
        if (ship.ai)
            exports.game.addAIShip(ship, false);
        else
            exports.game.addHumanShip(ship);
    }
    const savedAttackRemnants = await db_1.db.attackRemnant.getAllConstructible();
    dist_1.default.log(`Loaded ${exports.game.attackRemnants.length} saved attack remnants from DB.`);
    savedAttackRemnants.forEach((ar) => exports.game.addAttackRemnant(ar, false));
    exports.game.startGame();
});
//# sourceMappingURL=index.js.map