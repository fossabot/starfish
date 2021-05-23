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
        this.planet = false;
        this.ai = true;
        this.human = false;
        if (data.level)
            this.level = data.level;
        if (data.spawnPoint?.length === 2)
            this.spawnPoint = data.spawnPoint;
        else
            this.spawnPoint = this.location;
        this.targetLocation = this.location;
        this.faction =
            game.factions.find((f) => f.ai === true) || false;
    }
    tick() {
        if (this.dead)
            return;
        super.tick();
        // ----- move -----
        this.move();
        if (this.obeysGravity)
            this.applyTickOfGravity();
        this.visible = this.game.scanCircle(this.location, this.radii.sight, this.id, `ship`);
        // recharge weapons
        this.weapons.forEach((w) => (w.cooldownRemaining -=
            dist_1.default.getWeaponCooldownReductionPerTick(this.level)));
        // attack enemy in range
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
        if (!(Math.abs(this.location[0] - this.targetLocation[0]) <
            dist_1.default.arrivalThreshold / 2 &&
            Math.abs(this.location[1] - this.targetLocation[1]) <
                dist_1.default.arrivalThreshold / 2)) {
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
        }
        // ----- set new target location -----
        if (Math.random() < 0.01) {
            const distance = (Math.random() * this.level) / 7;
            const currentAngle = dist_1.default.angleFromAToB(this.location, this.targetLocation);
            const possibleAngles = [
                this.keyAngle,
                (this.keyAngle + 90) % 360,
                (this.keyAngle + 180) % 360,
                (this.keyAngle + 270) % 360,
            ].filter((a) => {
                const diff = dist_1.default.angleDifference(a, currentAngle);
                return diff > 1 && diff < 179;
            });
            const angleToHome = dist_1.default.angleFromAToB(this.location, this.spawnPoint);
            const chosenAngle = dist_1.default.coinFlip()
                ? dist_1.default.randomFromArray(possibleAngles)
                : possibleAngles.reduce((lowest, a) => dist_1.default.angleDifference(angleToHome, a) <
                    dist_1.default.angleDifference(angleToHome, lowest)
                    ? a
                    : lowest, possibleAngles[0]);
            const unitVector = dist_1.default.degreesToUnitVector(chosenAngle);
            // c.log(angleToHome, chosenAngle, unitVector)
            this.targetLocation = [
                this.location[0] + unitVector[0] * distance,
                this.location[1] + unitVector[1] * distance,
            ];
        }
        // ----- add previousLocation -----
        this.addPreviousLocation(startingLocation);
    }
    die() {
        super.die();
        const amount = Math.round(Math.random() * this.level * 40);
        const cacheContents = [
            { type: `credits`, amount },
        ];
        this.game.addCache({
            contents: cacheContents,
            location: this.location,
            message: `Remains of ${this.name}`,
        });
        this.game.removeShip(this);
    }
}
exports.AIShip = AIShip;
//# sourceMappingURL=AIShip.js.map