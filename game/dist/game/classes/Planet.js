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
const Stubbable_1 = require("./Stubbable");
class Planet extends Stubbable_1.Stubbable {
    constructor({ name, color, location, vendor, homeworld, creatures, repairCostMultiplier, radius, allegiances, }, game) {
        super();
        this.allegiances = [];
        this.mass = 5.974e32;
        this.priceFluctuator = 1;
        this.game = game;
        this.name = name;
        this.color = color;
        this.location = location;
        this.radius = radius;
        this.creatures = creatures || [];
        this.repairCostMultiplier = repairCostMultiplier || 0;
        this.homeworld = game.factions.find((f) => f.id === homeworld?.id);
        this.faction = this.homeworld;
        if (allegiances)
            for (let a of allegiances) {
                const foundFaction = this.game.factions.find((f) => f.id === a.faction.id);
                if (foundFaction)
                    this.allegiances.push({
                        faction: foundFaction,
                        level: a.level,
                    });
            }
        if (this.faction)
            this.incrementAllegiance(this.faction, 100);
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
        this.updateFluctuator();
        setInterval(() => this.updateFluctuator(), 1000 * 60 * 60); // every hour
        setInterval(() => this.decrementAllegiances(), 1000 * 60 * 60); // every hour
    }
    identify() {
        dist_1.default.log(`Planet: ${this.name} (${this.color}) at ${this.location}`);
    }
    get shipsAt() {
        return this.game.humanShips.filter((s) => s.planet === this);
    }
    updateFrontendForShipsAt() {
        this._stub = null;
        this.shipsAt.forEach((s) => {
            s.toUpdate.planet = this.stubify();
        });
    }
    getVisibleStub() {
        const initialStub = this.stubify();
        initialStub.vendor.cargo.forEach((i) => delete i.cargoData);
        initialStub.vendor.actives.forEach((i) => delete i.activeData);
        initialStub.vendor.passives.forEach((i) => delete i.passiveData);
        initialStub.vendor.items.forEach((i) => delete i.itemData);
        initialStub.vendor.chassis.forEach((i) => delete i.chassisData);
        return initialStub;
    }
    incrementAllegiance(faction, amount) {
        const allegianceAmountToIncrement = amount || 1;
        // c.log(`allegiance`, allegianceAmountToIncrement)
        const maxAllegiance = 100;
        const found = this.allegiances.find((a) => a.faction.id === faction.id);
        if (found)
            found.level = Math.min(maxAllegiance, found.level + allegianceAmountToIncrement);
        else
            this.allegiances.push({
                faction,
                level: Math.min(maxAllegiance, allegianceAmountToIncrement),
            });
        this.updateFrontendForShipsAt();
    }
    decrementAllegiances() {
        this.allegiances.forEach((a) => {
            if (this.faction?.id !== a.faction.id)
                a.level *= 0.99;
        });
        this.updateFrontendForShipsAt();
    }
    updateFluctuator() {
        const intensity = Planet.fluctuatorIntensity;
        const mod = (this.name || ``)
            .split(``)
            .reduce((t, c) => t + c.charCodeAt(0), 0);
        this.priceFluctuator =
            (((new Date().getDate() * 13 +
                mod +
                (new Date().getMonth() * 7 + mod)) %
                100) /
                100) *
                intensity +
                (1 - intensity / 2);
        this._stub = null; // invalidate stub
        this.updateFrontendForShipsAt();
    }
}
exports.Planet = Planet;
Planet.fluctuatorIntensity = 0.8;
//# sourceMappingURL=Planet.js.map