"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.game = void 0;
const Game_1 = require("./game/Game");
require("./server/io");
exports.game = new Game_1.Game();
// ----- debug -----
const human1 = exports.game.addHumanShip({
    name: `human1`,
    id: `123`,
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
//# sourceMappingURL=index.js.map