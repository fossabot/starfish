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
        this.human = false;
        this.level = 1;
        this.keyAngle = Math.random() * 365;
        this.obeysGravity = false;
        if (data.id)
            this.id = data.id;
        else
            this.id = `${Math.random()}`.substring(2);
        this.ai = true;
        this.human = false;
        if (data.spawnPoint?.length === 2)
            this.spawnPoint = data.spawnPoint;
        else
            this.spawnPoint = this.location;
        this.targetLocation = this.location;
        this.faction =
            game.factions.find((f) => f.ai === true) || false;
    }
    tick() {
        super.tick();
        // recharge weapons
        this.weapons.forEach((w) => (w.cooldownRemaining -= dist_1.default.deltaTime * this.level));
        // attack human in range
        const weapons = this.availableWeapons();
        if (!weapons.length)
            return;
        const enemies = this.getEnemiesInAttackRange();
        if (enemies.length) {
            const randomEnemy = dist_1.default.randomFromArray(enemies);
            const randomWeapon = dist_1.default.randomFromArray(weapons);
            this.attack(randomEnemy, randomWeapon);
        }
    }
    cumulativeSkillIn(l, s) {
        return this.level;
    }
    // ----- move -----
    move(toLocation) {
        super.move(toLocation);
        if (toLocation)
            return;
        if (!this.canMove)
            return;
        const startingLocation = [
            ...this.location,
        ];
        const engineThrustMultiplier = this.engines
            .filter((e) => e.repair > 0)
            .reduce((total, e) => total + e.thrustAmplification * e.repair, 0);
        if (Math.random() < 0.1) {
            const pointToAdd = dist_1.default.randomInsideCircle(this.level / 10);
            this.targetLocation = [
                this.spawnPoint[0] + pointToAdd[0],
                this.spawnPoint[1] + pointToAdd[1],
            ];
        }
        if (Math.abs(this.location[0] - this.targetLocation[0]) <
            dist_1.default.arrivalThreshold / 2 &&
            Math.abs(this.location[1] - this.targetLocation[1]) <
                dist_1.default.arrivalThreshold / 2)
            return;
        const unitVectorToTarget = dist_1.default.degreesToUnitVector(dist_1.default.angleFromAToB(this.location, this.targetLocation));
        const thrustMagnitude = dist_1.default.getThrustMagnitudeForSingleCrewMember(this.level, engineThrustMultiplier);
        this.location[0] +=
            unitVectorToTarget[0] *
                thrustMagnitude *
                (dist_1.default.deltaTime / 1000);
        this.location[1] +=
            unitVectorToTarget[1] *
                thrustMagnitude *
                (dist_1.default.deltaTime / 1000);
        // ----- add previousLocation -----
        this.addPreviousLocation(startingLocation);
    }
}
exports.AIShip = AIShip;
//# sourceMappingURL=AIShip.js.map