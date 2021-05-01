"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Weapon = void 0;
const Item_1 = require("./Item");
class Weapon extends Item_1.Item {
    constructor(data, ship) {
        super(data, ship);
        this.lastUse = 0;
        this.range = data.range;
        this.cooldownInMs = data.cooldownInMs;
    }
}
exports.Weapon = Weapon;
//# sourceMappingURL=Weapon.js.map