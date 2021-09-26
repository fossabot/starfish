"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Zone = void 0;
const dist_1 = __importDefault(require("../../../../common/dist"));
const Stubbable_1 = require("./Stubbable");
const zones_1 = require("../presets/zones");
class Zone extends Stubbable_1.Stubbable {
    // ? should zones expire after a certain time?
    constructor({ location, radius, id, color, name, effects, }, game) {
        super();
        this.type = `zone`;
        this.game = game;
        this.location = location;
        this.radius = radius;
        this.name = name;
        this.color = color;
        this.id = id || `zone${Math.random()}`.substring(2);
        this.effects = effects;
    }
    affectShip(ship) {
        if (ship.planet)
            return;
        for (let effect of this.effects) {
            if (Math.random() / dist_1.default.gameSpeedMultiplier >
                effect.procChancePerTick)
                return;
            const proximityMod = effect.basedOnProximity
                ? (dist_1.default.distance(this.location, ship.location) /
                    this.radius) *
                    2 // if based on proximity, doubles at center
                : 1; // otherwise always 1
            const intensity = effect.intensity *
                proximityMod *
                dist_1.default.randomBetween(0.5, 1.5);
            // dot
            if (effect.type === `damage over time`) {
                if (!ship.attackable || ship.planet)
                    return;
                let miss = false;
                if (effect.dodgeable) {
                    const enemyAgility = ship.chassis.agility;
                    const hitRoll = Math.random();
                    if (hitRoll < 0.1)
                        miss = true;
                    // random passive miss chance
                    else
                        miss = hitRoll < proximityMod / enemyAgility / 2;
                }
                if (miss)
                    return; // * misses being announced was annoying and just noise
                ship.takeDamage(this, {
                    damage: miss ? 0 : intensity,
                    miss,
                });
            }
            // repair
            else if (effect.type === `repair over time`) {
                const repairableItems = ship.items.filter((i) => i.repair <= 0.9995);
                const amountToRepair = (effect.intensity /
                    100 /
                    repairableItems.length) *
                    proximityMod;
                repairableItems.forEach((ri) => {
                    ri.applyRepair(amountToRepair);
                });
            }
            // stamina regen
            else if (effect.type === `stamina regeneration`) {
                ship.crewMembers.forEach((cm) => {
                    if (cm.stamina >= cm.maxStamina)
                        return;
                    cm.stamina +=
                        (dist_1.default.getStaminaGainPerTickForSingleCrewMember(this.game.settings.baseStaminaUse) *
                            intensity) /
                            (dist_1.default.deltaTime / dist_1.default.tickInterval);
                    if (cm.stamina > cm.maxStamina)
                        cm.stamina = cm.maxStamina;
                    cm.toUpdate.stamina = cm.stamina;
                });
            }
            // accelerate
            else if (effect.type === `accelerate`) {
                const accelerateMultiplier = 1 + effect.intensity * proximityMod * 0.0004;
                ship.velocity[0] *= accelerateMultiplier;
                ship.velocity[1] *= accelerateMultiplier;
                ship.toUpdate.velocity = ship.velocity;
                ship.toUpdate.speed = dist_1.default.vectorToMagnitude(ship.velocity);
            }
            // decelerate
            else if (effect.type === `decelerate`) {
                const decelerateMultiplier = 1 - effect.intensity * proximityMod * 0.001;
                ship.velocity[0] *= decelerateMultiplier;
                ship.velocity[1] *= decelerateMultiplier;
                ship.toUpdate.velocity = ship.velocity;
                ship.toUpdate.speed = dist_1.default.vectorToMagnitude(ship.velocity);
            }
            // wormhole
            else if (effect.type === `wormhole`) {
                ship.location = dist_1.default.randomInsideCircle(this.game.gameSoftRadius);
                ship.logEntry([
                    `Your ship has been instantly warped to another part of the universe! The wormhole closed behind you.`,
                ], `high`);
                this.moveToRandomLocation();
                dist_1.default.log(`Moved wormhole to ${this.location}`);
                // this.game.removeZone(this)
            }
        }
    }
    moveToRandomLocation() {
        this.location = (0, zones_1.getValidZoneLocation)(this.game, this.radius);
    }
    toVisibleStub() {
        return this.stubify();
    }
    toLogStub() {
        return {
            type: `zone`,
            id: this.id,
        };
    }
}
exports.Zone = Zone;
//# sourceMappingURL=Zone.js.map