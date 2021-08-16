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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
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
const cargo_1 = require("../../presets/cargo");
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
            zones: [],
        };
        this.keyAngle = Math.random() * 365;
        this.obeysGravity = false;
        if (data.id)
            this.id = data.id;
        else
            this.id = `ai${Math.random()}`.substring(2);
        if (data.onlyVisibleToShipId)
            this.onlyVisibleToShipId = data.onlyVisibleToShipId;
        this.planet = false;
        this.ai = true;
        this.human = false;
        if (data.headerBackground)
            this.headerBackground = data.headerBackground;
        if (data.level)
            this.level = data.level;
        if (this.items.length === 0)
            this.addLevelAppropriateItems();
        if (this.items.length === 0)
            setTimeout(() => this.die(undefined, false), 1000);
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
        if (this.onlyVisibleToShipId) {
            const onlyVisibleShip = this.game.humanShips.find((s) => s.id === this.onlyVisibleToShipId);
            if (onlyVisibleShip)
                this.visible.ships.push(onlyVisibleShip);
        }
        // recharge weapons
        this.weapons.forEach((w) => (w.cooldownRemaining -=
            dist_1.default.getWeaponCooldownReductionPerTick(this.level)));
        // ----- zone effects -----
        this.applyZoneTickEffects();
        // attack enemy in range
        const weapons = this.availableWeapons();
        if (!weapons.length)
            return;
        const enemies = this.getEnemiesInAttackRange().filter((e) => !this.onlyVisibleToShipId ||
            e.id === this.onlyVisibleToShipId);
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
        // c.log(`Adding items to level ${this.level} ai...`)
        let itemBudget = this.level * dist_1.default.aiDifficultyMultiplier;
        const validChassis = Object.values(itemData.chassis)
            .filter((i) => i.rarity <= itemBudget / 3)
            .sort((a, b) => b.rarity - a.rarity);
        const chassisToBuy = validChassis[0] || itemData.chassis.starter1;
        this.chassis = chassisToBuy;
        itemBudget -= chassisToBuy.rarity;
        // c.log(
        //   `adding chassis ${chassisToBuy.displayName} with remaining budget of ${itemBudget}`,
        // )
        const isInBudget = (i) => i.rarity <= itemBudget;
        const isBuyable = (i) => i.buyable !== false;
        while (true) {
            const typeToAdd = this.weapons.length === 0
                ? `weapon`
                : this.engines.length === 0
                    ? `engine`
                    : dist_1.default.randomFromArray([`engine`, `weapon`]);
            const itemPool = itemData[typeToAdd];
            const validItems = Object.values(itemPool)
                .filter(isInBudget)
                .filter(isBuyable);
            if (!validItems.length)
                break;
            const itemToAdd = dist_1.default.randomFromArray(validItems);
            this.addItem(itemToAdd);
            itemBudget -= itemToAdd.rarity;
            // c.log(
            //   `adding item ${itemToAdd.displayName} with remaining budget of ${itemBudget}`,
            // )
            if (this.slots <= this.items.length)
                break;
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
        const hasArrived = Math.abs(this.location[0] - this.targetLocation[0]) <
            dist_1.default.arrivalThreshold / 2 &&
            Math.abs(this.location[1] - this.targetLocation[1]) <
                dist_1.default.arrivalThreshold / 2;
        if (!hasArrived) {
            const unitVectorToTarget = dist_1.default.degreesToUnitVector(dist_1.default.angleFromAToB(this.location, this.targetLocation));
            const thrustMagnitude = dist_1.default.lerp(0.00001, 0.0001, this.level / 100) *
                engineThrustMultiplier *
                dist_1.default.gameSpeedMultiplier;
            this.location[0] +=
                unitVectorToTarget[0] *
                    thrustMagnitude *
                    (dist_1.default.deltaTime / dist_1.default.tickInterval);
            this.location[1] +=
                unitVectorToTarget[1] *
                    thrustMagnitude *
                    (dist_1.default.deltaTime / dist_1.default.tickInterval);
        }
        // ----- set new target location -----
        if (Math.random() < 0.000005 * dist_1.default.tickInterval) {
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
            // ----- add previousLocation because it will be turning -----
            this.previousLocations.push([...this.location]);
            while (this.previousLocations.length >
                AIShip.maxPreviousLocations / 2)
                this.previousLocations.shift();
        }
    }
    die(attacker, silently) {
        super.die(attacker);
        if (!silently) {
            let itemRarity = this.level / 3;
            if (attacker) {
                // apply "rarity boost" passive
                const rarityBoostPassive = (attacker.passives?.filter((p) => p.id === `boostDropRarity`) || []).reduce((total, p) => total + (p.intensity || 0), 0);
                itemRarity *= 1 + rarityBoostPassive;
                dist_1.default.log(`ai drop rarity boosted by passive:`, rarityBoostPassive);
            }
            const cacheContents = [];
            while (cacheContents.length === 0) {
                // always a chance for credits
                if (Math.random() > 0.6) {
                    let amount = Math.ceil(Math.random() * itemRarity * 100) *
                        100;
                    cacheContents.push({ type: `credits`, amount });
                }
                const upperLimit = itemRarity;
                const lowerLimit = itemRarity * 0.5 - 0.5;
                for (let ca of Object.values(cargo_1.data)) {
                    // c.log(ca.type, ca.rarity, upperLimit, lowerLimit)
                    if (ca.rarity <= upperLimit &&
                        ca.rarity >= lowerLimit &&
                        Math.random() > 0.7) {
                        const amount = dist_1.default.r2(Math.random() * this.level * 3 + this.level);
                        cacheContents.push({ type: ca.type, amount });
                    }
                }
                itemRarity -= 0.1;
            }
            // c.log(cacheContents)
            this.game.addCache({
                contents: cacheContents,
                location: this.location,
                message: `Remains of ${this.name}`,
                onlyVisibleToShipId: this.onlyVisibleToShipId,
            });
        }
        this.game.removeShip(this);
    }
}
exports.AIShip = AIShip;
//# sourceMappingURL=AIShip.js.map