"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Weapon = void 0;
const Item_1 = require("./Item");
class Weapon extends Item_1.Item {
    constructor(data, ship, props) {
        super(data, ship, props);
        this.lastUse = 0;
        this.id = data.id;
        this.range = data.range;
        this.damage = data.damage;
        this.baseCooldown = data.baseCooldown;
        this.lastUse = data.lastUse || 0;
        this.cooldownRemaining =
            data.cooldownRemaining ||
                props?.cooldownRemaining ||
                data.baseCooldown;
    }
    use() {
        this.repair -= 0.01;
        this.lastUse = Date.now();
        this.cooldownRemaining = this.baseCooldown;
        super.use();
    }
}
exports.Weapon = Weapon;
//# sourceMappingURL=Weapon.js.map