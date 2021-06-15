"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Item = void 0;
const dist_1 = __importDefault(require("../../../../../common/dist"));
const Stubbable_1 = require("../Stubbable");
class Item extends Stubbable_1.Stubbable {
    constructor({ type, id, displayName, description, mass, repair, maxHp, hp, repairDifficulty, reliability, }, ship, props) {
        super();
        this.mass = 1000;
        this.repairDifficulty = 1;
        this.reliability = 1; // higher loses less repair over time
        this.repair = 1;
        this.announceWhenRepaired = false;
        this.announceWhenBroken = true;
        this.type = type;
        this.id = id;
        this.displayName = displayName;
        this.description = description;
        this.mass = mass;
        if (reliability)
            this.reliability = reliability;
        if (repairDifficulty)
            this.repairDifficulty = repairDifficulty;
        this.repair = repair ?? props?.repair ?? 1;
        this.ship = ship;
        this.maxHp = maxHp;
        if (hp !== undefined)
            this.hp = hp;
        if (props?.hp !== undefined)
            this.hp = props?.hp;
    }
    get hp() {
        return this.repair * this.maxHp;
    }
    set hp(newHp) {
        this.repair = newHp / this.maxHp;
    }
    use(usePercent = 1) {
        if (this.ship.ai)
            return 0;
        if (this.ship.tutorial?.currentStep.disableRepair)
            return 0;
        const durabilityLost = dist_1.default.getBaseDurabilityLossPerTick(this.maxHp, this.reliability) * usePercent;
        this.repair -= durabilityLost;
        if (this.repair < 0)
            this.repair = 0;
        this.ship.toUpdate._hp = this.ship.hp;
        this._stub = null; // invalidate stub
        return durabilityLost;
    }
}
exports.Item = Item;
//# sourceMappingURL=Item.js.map