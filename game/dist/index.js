"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.game = void 0;
const Game_1 = require("./game/Game");
require("./server/io");
const db = __importStar(require("./db"));
db.init({});
exports.game = new Game_1.Game();
// ----- debug -----
// const human1 = game.addHumanShip({
//   name: `human1`,
//   id: `123`,
//   faction: `green`,
//   loadout: `human_default`,
//   crewMembers: [
//     { id: 'cm1', name: 'bonzo', skills: [], stamina: 0.5 },
//     {
//       id: 'cm2',
//       name: 'bubbs',
//       skills: [{ level: 2, xp: 200, skill: 'stamina' }],
//       stamina: 0.5,
//     },
//   ],
// })
const ai1 = exports.game.addAIShip({
    name: `ai1`,
    loadout: `ai_default`,
    location: [-0.5, 0.2],
});
//# sourceMappingURL=index.js.map