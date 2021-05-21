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
    const savedCaches = await db_1.db.cache.getAllConstructible();
    dist_1.default.log(`Loaded ${savedCaches.length} saved caches from DB.`);
    savedCaches.forEach((cache) => exports.game.addCache(cache, false));
    // const newCache = game.addCache({
    //   id: `12323123312`,
    //   contents: [{ type: `food`, amount: 3 }],
    //   location: [0.01, 0],
    //   ownerId: `123`,
    // })
    // await db.ship.wipe()
    // const ai1 = game.addAIShip({
    //   id: `1234`,
    //   name: `ai1`,
    //   loadout: `ai_default`,
    //   location: [-0.5, 0.2] as CoordinatePair,
    // })
    const savedShips = await db_1.db.ship.getAllConstructible();
    dist_1.default.log(`Loaded ${savedShips.length} saved ships from DB.`);
    for (let ship of savedShips) {
        if (ship.ai)
            exports.game.addAIShip(ship, false);
        else
            exports.game.addHumanShip(ship);
    }
    const savedAttackRemnants = await db_1.db.attackRemnant.getAllConstructible();
    savedAttackRemnants.forEach((ar) => exports.game.addAttackRemnant(ar, false));
    dist_1.default.log(`Loaded ${exports.game.attackRemnants.length} saved attack remnants from DB.`);
});
//# sourceMappingURL=index.js.map