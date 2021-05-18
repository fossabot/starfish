"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Item = void 0;
class Item {
    constructor({ type, id, displayName, description, repair, maxHp, hp, }, ship) {
        this.repair = 1;
        this.type = type;
        this.id = id;
        this.displayName = displayName;
        this.description = description;
        this.repair = repair ?? 1;
        this.ship = ship;
        this.maxHp = maxHp;
        if (hp !== undefined)
            this.hp = hp;
    }
    get hp() {
        return this.repair * this.maxHp;
    }
    set hp(newHp) {
        this.repair = newHp / this.maxHp;
    }
    use() {
        this.repair -= 0.00005;
        if (this.repair < 0)
            this.repair = 0;
    }
}
exports.Item = Item;
//# sourceMappingURL=Item.js.map