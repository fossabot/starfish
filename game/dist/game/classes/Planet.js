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
exports.Planet = void 0;
const dist_1 = __importDefault(require("../../../../common/dist"));
const cargo_1 = require("../presets/cargo");
const crewPassives_1 = require("../presets/crewPassives");
const crewActives_1 = require("../presets/crewActives");
const chassis_1 = require("../presets/items/chassis");
const itemData = __importStar(require("../presets/items/"));
class Planet {
    constructor({ name, color, location, vendor, factionId, homeworld, creatures, repairCostMultiplier, radius, }, game) {
        this.mass = 5.974e30;
        this.buyFluctuator = 1;
        this.sellFluctuator = 1;
        this.game = game;
        this.name = name;
        this.color = color;
        this.location = location;
        this.radius = radius;
        this.creatures = creatures || [];
        this.repairCostMultiplier = repairCostMultiplier || 0;
        this.homeworld = game.factions.find((f) => f.id === homeworld?.id);
        this.faction =
            this.homeworld ||
                game.factions.find((f) => f.id === factionId);
        this.vendor = {
            cargo: vendor.cargo?.map((cargo) => {
                return {
                    sellMultiplier: cargo.sellMultiplier,
                    buyMultiplier: cargo.buyMultiplier,
                    cargoType: cargo.cargoType,
                    cargoData: cargo_1.data[cargo.cargoType],
                };
            }),
            passives: vendor.passives?.map((passive) => {
                return {
                    buyMultiplier: passive.buyMultiplier,
                    passiveType: passive.passiveType,
                    passiveData: crewPassives_1.data[passive.passiveType],
                };
            }),
            chassis: vendor.chassis?.map((chassis) => {
                return {
                    buyMultiplier: chassis.buyMultiplier,
                    sellMultiplier: chassis.sellMultiplier,
                    chassisType: chassis.chassisType,
                    chassisData: chassis_1.chassis[chassis.chassisType],
                };
            }),
            actives: vendor.actives?.map((active) => {
                return {
                    buyMultiplier: active.buyMultiplier,
                    activeType: active.activeType,
                    activeData: crewActives_1.data[active.activeType],
                };
            }),
            items: vendor.items
                ?.map((item) => {
                return {
                    buyMultiplier: item.buyMultiplier,
                    sellMultiplier: item.sellMultiplier,
                    itemType: item.itemType,
                    itemId: item.itemId,
                    itemData: itemData[item.itemType][item.itemId],
                };
            })
                .filter((i) => i.itemData),
        };
        this.mass =
            ((5.974e30 * this.radius) / 36000) *
                (1 + Math.random() * 0.1);
        this.updateFluctuators();
        setInterval(this.updateFluctuators, 1000 * 60 * 60); // every hour
    }
    identify() {
        dist_1.default.log(`Planet: ${this.name} (${this.color}) at ${this.location}`);
    }
    shipsAt() {
        return this.game.humanShips.filter((s) => s.planet === this);
    }
    updateFluctuators() {
        const intensity = Planet.fluctuatorIntensity;
        const mod = (this.name || ``)
            .split(``)
            .reduce((t, c) => t + c.charCodeAt(0), 0);
        this.buyFluctuator =
            (((new Date().getDate() * 13 +
                mod +
                (new Date().getMonth() * 7 + mod)) %
                100) /
                100) *
                intensity +
                (1 - intensity / 2);
        this.sellFluctuator =
            (((new Date().getDate() * 13 +
                15 +
                mod +
                (new Date().getMonth() * 9 + 3 + mod)) %
                100) /
                100) *
                intensity +
                (1 - intensity / 2);
    }
}
exports.Planet = Planet;
Planet.fluctuatorIntensity = 0.2;
//# sourceMappingURL=Planet.js.map