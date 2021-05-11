"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Item = void 0;
class Item {
    constructor({ id, displayName, description, repair }, ship) {
        this.repair = 1;
        this.id = id;
        this.displayName = displayName;
        this.description = description;
        this.repair = repair ?? 1;
        this.ship = ship;
    }
}
exports.Item = Item;
//# sourceMappingURL=Item.js.map