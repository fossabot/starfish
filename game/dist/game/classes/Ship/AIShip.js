"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIShip = void 0;
const dist_1 = __importDefault(require("../../../../../common/dist"));
const CombatShip_1 = require("./CombatShip");
const itemData = __importStar(require("../../presets/items"));
class AIShip extends CombatShip_1.CombatShip {
    constructor(data, game) {
        super(data, game);
        this.human = false;
        this.level = 1;
        this.visible = {
            ships: [],
            planets: [],
            caches: [],
            attackRemnants: [],
        };
        this.keyAngle = Math.random() * 365;
        this.obeysGravity = false;
        if (data.id)
            this.id = data.id;
        else
            this.id = `${Math.random()}`.substring(2);
        if (data.onlyVisibleToShipId)
            this.onlyVisibleToShipId = data.onlyVisibleToShipId;
        this.planet = false;
        this.ai = true;
        this.human = false;
        if (data.level)
            this.level = data.level;
        if (this.items.length === 0)
            this.addLevelAppropriateItems();
        if (data.spawnPoint?.length === 2)
            this.spawnPoint = [...data.spawnPoint];
        else
            this.spawnPoint = [...this.location];
        this.targetLocation = [...this.location];
    }
    tick() {
        super.tick();
        if (this.dead)
            return;
        // ----- move -----
        this.move();
        this.visible = this.game.scanCircle(this.location, this.radii.sight, this.id, [`ship`]);
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
            const distance = dist_1.default.distance(randomEnemy.location, this.location);
            const randomWeapon = dist_1.default.randomFromArray(weapons.filter((w) => w.range >= distance));
            if (randomWeapon)
                this.attack(randomEnemy, randomWeapon);
        }
    }
    cumulativeSkillIn(l, s) {
        return this.level;
    }
    addLevelAppropriateItems() {
        dist_1.default.log(`Adding items to level ${this.level} ai...`);
        let itemBudget = this.level * dist_1.default.aiDifficultyMultiplier;
        const validChassis = Object.values(itemData.chassis)
            .filter((i) => i.rarity <= itemBudget / 3)
            .sort((a, b) => b.rarity - a.rarity);
        const chassisToBuy = validChassis[0] || itemData.chassis.starter1;
        this.chassis = chassisToBuy;
        itemBudget -= chassisToBuy.rarity;
        dist_1.default.log(`adding chassis ${chassisToBuy.displayName} with remaining budget of ${itemBudget}`);
        let canAddMoreItems = true;
        const isInBudget = (i) => i.rarity <= itemBudget;
        while (canAddMoreItems) {
            const typeToAdd = this.weapons.length === 0
                ? `weapon`
                : this.engines.length === 0
                    ? `engine`
                    : dist_1.default.randomFromArray([`engine`, `weapon`]);
            const itemPool = itemData[typeToAdd];
            const validItems = Object.values(itemPool).filter(isInBudget);
            if (!validItems.length) {
                canAddMoreItems = false;
                continue;
            }
            const itemToAdd = dist_1.default.randomFromArray(validItems);
            this.addItem(itemToAdd);
            itemBudget -= itemToAdd.rarity;
            dist_1.default.log(`adding item ${itemToAdd.displayName} with remaining budget of ${itemBudget}`);
            if (this.chassis.slots <= this.items.length)
                canAddMoreItems = false;
        }
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
            dist_1.default.ARRIVAL_THRESHOLD / 2 &&
            Math.abs(this.location[1] - this.targetLocation[1]) <
                dist_1.default.ARRIVAL_THRESHOLD / 2)) {
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
        if (Math.random() < 0.015) {
            const distance = (Math.random() * this.level) / 2;
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
            const chosenAngle = Math.random() > 1
                ? dist_1.default.randomFromArray(possibleAngles)
                : possibleAngles.reduce((lowest, a) => dist_1.default.angleDifference(angleToHome, a) <
                    dist_1.default.angleDifference(angleToHome, lowest)
                    ? a
                    : lowest, possibleAngles[0]);
            const unitVector = dist_1.default.degreesToUnitVector(chosenAngle);
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
        const amount = Math.round(Math.random() * this.level * 50);
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