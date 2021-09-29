"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Communicator = void 0;
const dist_1 = __importDefault(require("../../../../../common/dist"));
const Item_1 = require("./Item");
class Communicator extends Item_1.Item {
    constructor(data, ship, props) {
        super(data, ship, props);
        this.lastUse = 0;
        this.id = data.id;
        this.range = data.range;
        this.antiGarble = data.antiGarble;
    }
    use(usePercent = 1, user) {
        if (this.ship.ai)
            return 0;
        if (this.ship.tutorial?.currentStep.disableRepair)
            return 0;
        const skillLevel = user?.skills.find((s) => s.skill === `piloting`)
            ?.level || 1;
        let repairLoss = Math.min(1 / this.maxHp / 2, dist_1.default.getBaseDurabilityLossPerTick(this.maxHp, this.reliability, skillLevel) * 70);
        this.repair -= repairLoss;
        if (this.repair < 0)
            this.repair = 0;
        this.lastUse = Date.now();
        repairLoss += super.use();
        return repairLoss;
    }
}
exports.Communicator = Communicator;
//# sourceMappingURL=Communicator.js.map