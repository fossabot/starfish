"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Weapon = void 0;
const dist_1 = __importDefault(require("../../../../../common/dist"));
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
        this.cooldownRemaining = Math.min(data.cooldownRemaining ||
            props?.cooldownRemaining ||
            data.baseCooldown, data.baseCooldown);
    }
    use() {
        this.cooldownRemaining = this.baseCooldown;
        if (this.ship.ai)
            return 0;
        if (this.ship.tutorial?.currentStep.disableRepair)
            return 0;
        let repairLoss = dist_1.default.getBaseDurabilityLossPerTick(this.maxHp, this.reliability) * 150;
        this.repair -= repairLoss;
        if (this.repair < 0)
            this.repair = 0;
        this.lastUse = Date.now();
        repairLoss += super.use();
        return repairLoss;
    }
}
exports.Weapon = Weapon;
//# sourceMappingURL=Weapon.js.map