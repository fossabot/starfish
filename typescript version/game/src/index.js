"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.game = void 0;
const dist_1 = __importDefault(require("../../common/dist"));
const Game_1 = require("./game/Game");
exports.game = new Game_1.Game();
exports.game.on('tick', () => {
    dist_1.default.log('woaahhhh');
});
const human1 = exports.game.addHumanShip({
    name: `human1`,
    id: `123`,
    planet: `Origin`,
    faction: `green`,
    loadout: `human_default`,
    crewMembers: [
        { id: 'cm1', name: 'bonzo', skills: [], stamina: 0.5 },
        {
            id: 'cm2',
            name: 'bubbs',
            skills: [{ level: 2, xp: 200, skill: 'stamina' }],
            stamina: 0.5,
        },
    ],
});
const ai1 = exports.game.addAIShip({
    name: `ai1`,
    loadout: `ai_default`,
    planet: `Hera`,
});
// game.identify()
// c.log(game.ships)
// c.log(ai1)
// c.log(human1)
//# sourceMappingURL=index.js.map