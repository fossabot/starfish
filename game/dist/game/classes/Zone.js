"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Zone = void 0;
const dist_1 = __importDefault(require("../../../../common/dist"));
const Stubbable_1 = require("./Stubbable");
class Zone extends Stubbable_1.Stubbable {
    constructor({ location, radius, id, color, name, effects, }, game) {
        super();
        this.game = game;
        this.location = location;
        this.radius = radius;
        this.name = name;
        this.color = color;
        this.id = id || `${Math.random()}`.substring(2);
        this.effects = effects;
    }
    affectShip(ship) {
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
                    dist_1.default.log({ hitRoll, enemyAgility, proximityMod });
                }
                // c.log({ miss, intensity })
                ship.takeDamage(this, {
                    damage: miss ? 0 : intensity,
                    miss,
                });
            }
            // repair
            else if (effect.type === `repair over time`) {
                const repairableItems = ship.items.filter((i) => i.repair <= 0.9995);
                const amountToRepair = (effect.intensity / repairableItems.length) *
                    proximityMod;
                repairableItems.forEach((ri) => {
                    ri.applyRepair(amountToRepair);
                });
            }
            // accelerate
            else if (effect.type === `accelerate`) {
                const accelerateMultiplier = 1 + effect.intensity * proximityMod * 0.01;
                ship.velocity[0] *= accelerateMultiplier;
                ship.velocity[1] *= accelerateMultiplier;
            }
            // decelerate
            else if (effect.type === `decelerate`) {
                const decelerateMultiplier = 1 - effect.intensity * proximityMod * 0.01;
                ship.velocity[0] *= decelerateMultiplier;
                ship.velocity[1] *= decelerateMultiplier;
            }
        }
    }
}
exports.Zone = Zone;
//# sourceMappingURL=Zone.js.map