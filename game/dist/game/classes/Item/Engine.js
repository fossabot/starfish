"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Engine = void 0;
const dist_1 = __importDefault(require("../../../../../common/dist"));
const Item_1 = require("./Item");
class Engine extends Item_1.Item {
    constructor(data, ship, props) {
        super(data, ship, props);
        this.id = data.id;
        this.thrustAmplification = data.thrustAmplification;
    }
    use(usePercent = 1) {
        if (this.ship.tutorial?.currentStep.disableRepair)
            return 0;
        let repairLoss = dist_1.default.getBaseDurabilityLossPerTick(this.maxHp, this.reliability) *
            usePercent *
            400;
        this.repair -= repairLoss;
        this._stub = null; // invalidate stub
        return repairLoss;
    }
}
exports.Engine = Engine;
//# sourceMappingURL=Engine.js.map