"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIShip = void 0;
const dist_1 = __importDefault(require("../../../../../common/dist"));
const CombatShip_1 = require("./CombatShip");
class AIShip extends CombatShip_1.CombatShip {
    constructor(data, game) {
        super(data, game);
        this.obeysGravity = false;
        this.human = false;
        if (data.id)
            this.id = data.id;
        else
            this.id = `${Math.random()}`.substring(2);
        this.faction =
            game.factions.find((f) => f.ai === true) || false;
    }
    tick() {
        super.tick();
        // attack human in range
        const weapons = this.availableWeapons;
        if (!weapons)
            return;
        const enemies = this.enemiesInAttackRange;
        if (enemies.length) {
            const randomEnemy = dist_1.default.randomFromArray(enemies);
            const randomWeapon = dist_1.default.randomFromArray(weapons);
            dist_1.default.log(weapons.length, !!randomWeapon);
            this.attack(randomEnemy, randomWeapon);
        }
    }
}
exports.AIShip = AIShip;
//# sourceMappingURL=AIShip.js.map