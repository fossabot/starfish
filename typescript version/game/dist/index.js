"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dist_1 = __importDefault(require("../../common/dist"));
dist_1.default.log(dist_1.default.GAME_NAME);
const Game_1 = require("./game/Game");
const g = new Game_1.Game();
const human1 = g.addHumanShip({
    name: `human1`,
    id: `123`,
    planet: `Origin`,
    faction: `green`,
    loadout: `human_default`,
});
const ai1 = g.addAIShip({
    name: `ai1`,
    loadout: `ai_default`,
    planet: `Hera`,
});
// g.identify()
// c.log(g.ships)
// c.log(ai1)
//# sourceMappingURL=index.js.map