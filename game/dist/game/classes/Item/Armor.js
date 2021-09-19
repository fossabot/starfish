"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Armor = void 0;
const Item_1 = require("./Item");
class Armor extends Item_1.Item {
    constructor(data, ship, props) {
        super(data, ship, props);
        this.id = data.id;
        this.damageReduction = data.damageReduction;
    }
    blockDamage(totalDamage) {
        const startHp = this.hp;
        const amountMitigated = totalDamage * this.damageReduction * this.repair;
        let remainingDamage = totalDamage - amountMitigated;
        const damageTaken = Math.min(this.hp, remainingDamage);
        this.hp -= damageTaken;
        if (this.hp < 0.00001)
            this.hp = 0;
        remainingDamage -= damageTaken;
        // c.log(
        //   `Armor blocked ${amountMitigated} and took ${damageTaken} damage, leaving it with ${this.hp} hp.`,
        // )
        return {
            taken: damageTaken,
            mitigated: amountMitigated,
            remaining: remainingDamage,
            destroyed: this.hp === 0 && startHp > this.hp,
        };
    }
}
exports.Armor = Armor;
//# sourceMappingURL=Armor.js.map