"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scanner = void 0;
const dist_1 = __importDefault(require("../../../../../common/dist"));
const Item_1 = require("./Item");
class Scanner extends Item_1.Item {
    // todo scan more/less properties of a ship
    constructor(data, ship, props) {
        super(data, ship, props);
        this.id = data.id;
        this.sightRange = data.sightRange;
        this.shipScanRange = data.shipScanRange;
    }
    use() {
        if (this.ship.ai)
            return 0;
        let repairLoss = dist_1.default.getBaseDurabilityLossPerTick(this.maxHp) * -0.97;
        this.repair -= repairLoss;
        repairLoss += super.use();
        return repairLoss;
    }
}
exports.Scanner = Scanner;
//# sourceMappingURL=Scanner.js.map