"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Item = void 0;
const dist_1 = __importDefault(require("../../../../../common/dist"));
class Item {
    constructor({ type, id, displayName, description, repair, maxHp, hp, }, ship, props) {
        this.repair = 1;
        this.announceWhenRepaired = false;
        this.announceWhenBroken = true;
        this.type = type;
        this.id = id;
        this.displayName = displayName;
        this.description = description;
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
    use() {
        if (this.ship.ai)
            return 0;
        const durabilityLost = dist_1.default.getBaseDurabilityLossPerTick(this.maxHp);
        this.repair -= durabilityLost;
        if (this.repair < 0)
            this.repair = 0;
        this.ship.toUpdate._hp = this.ship.hp;
        return durabilityLost;
    }
}
exports.Item = Item;
//# sourceMappingURL=Item.js.map