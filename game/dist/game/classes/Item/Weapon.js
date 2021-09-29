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
        this.critChance = 0;
        this.lastUse = 0;
        this.rooms = [`weapons`];
        this.id = data.id;
        this.range = data.range;
        this.damage = data.damage;
        this.baseCooldown = data.baseCooldown;
        this.lastUse = data.lastUse || 0;
        if (data.critChance !== undefined)
            this.critChance = data.critChance;
        this.cooldownRemaining =
            data.cooldownRemaining ||
                props?.cooldownRemaining ||
                0;
        if (this.cooldownRemaining > this.baseCooldown)
            this.cooldownRemaining = this.baseCooldown;
    }
    get effectiveRange() {
        return this.range * this.repair;
    }
    use(usePercent = 1, users) {
        this.cooldownRemaining = this.baseCooldown;
        if (this.ship.ai)
            return 0;
        if (this.ship.tutorial?.currentStep.disableRepair)
            return 0;
        const avgLevel = (users?.reduce((acc, user) => acc +
            (user.skills.find((s) => s.skill === `munitions`)
                ?.level || 1), 0) || 1) / (users?.length || 1);
        let repairLoss = dist_1.default.getBaseDurabilityLossPerTick(this.maxHp, this.reliability, avgLevel) * 200;
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