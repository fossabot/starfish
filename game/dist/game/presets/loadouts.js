"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const items_1 = require("./items");
const loadouts = {};
function addLoadout(name, weaponIds, engineIds) {
    const w = weaponIds
        .map((id) => items_1.weapons[id])
        .filter((w) => w);
    const e = engineIds
        .map((id) => items_1.engines[id])
        .filter((e) => e);
    loadouts[name] = { name, weapons: w, engines: e };
}
// ----- declare preset loadouts -----
addLoadout(`human_default`, [`cannon`], [`starter`]);
addLoadout(`ai_default`, [`cannon`], [`starter`]);
exports.default = loadouts;
//# sourceMappingURL=loadouts.js.map