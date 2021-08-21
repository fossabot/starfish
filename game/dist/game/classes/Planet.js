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
exports.Planet = void 0;
const dist_1 = __importDefault(require("../../../../common/dist"));
const cargo_1 = require("../presets/cargo");
const crewPassives_1 = require("../presets/crewPassives");
const crewActives_1 = require("../presets/crewActives");
const chassis_1 = require("../presets/items/chassis");
const itemData = __importStar(require("../presets/items/"));
const Stubbable_1 = require("./Stubbable");
const db_1 = require("../../db");
class Planet extends Stubbable_1.Stubbable {
    constructor({ name, color, location, vendor, homeworld, creatures, repairCostMultiplier, radius, allegiances, }, game) {
        super();
        this.type = `planet`;
        this.allegiances = [];
        this.mass = 0;
        this.priceFluctuator = 1;
        this.toUpdate = {};
        this.game = game;
        this.name = name;
        this.color = color;
        this.location = location;
        this.radius = radius;
        this.creatures = creatures || [];
        this.repairCostMultiplier = repairCostMultiplier || 0;
        this.homeworld = game.factions.find((f) => f.id === homeworld?.id);
        this.faction = this.homeworld;
        if (allegiances) {
            for (let a of allegiances) {
                const foundFaction = this.game.factions.find((f) => f.id === a.faction.id);
                if (foundFaction)
                    this.allegiances.push({
                        faction: foundFaction,
                        level: a.level,
                    });
            }
            this.toUpdate.allegiances = this.allegiances;
        }
        if (vendor)
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
        this.mass = (5.974e30 * this.radius) / 36000;
        // * (1 + Math.random() * 0.1) // todo this shouldn't be randomized on startup
        this.updateFluctuator();
        setInterval(() => this.updateFluctuator(), 1000 * 60 * 60); // every hour
        setInterval(() => this.decrementAllegiances(), 1000 * 60 * 60); // every hour
        if (this.faction)
            this.incrementAllegiance(this.faction, 100);
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
        this._stub = null;
        const initialStub = {
            ...this.stubify([
                `cargoData`,
                `activeData`,
                `passiveData`,
                `itemData`,
                `chassisData`,
            ]),
        };
        this._stub = null;
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
        this.toUpdate.allegiances = this.allegiances;
        this.updateFrontendForShipsAt();
        db_1.db.planet.addOrUpdateInDb(this);
    }
    decrementAllegiances() {
        this.allegiances.forEach((a) => {
            if (this.faction?.id !== a.faction.id)
                a.level *= 0.99;
        });
        this.toUpdate.allegiances = this.allegiances;
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
        this.toUpdate.priceFluctuator = this.priceFluctuator;
        this.updateFrontendForShipsAt();
    }
    toLogStub() {
        const s = this.stubify();
        return {
            ...s,
            type: `planet`,
            vendor: undefined,
        };
    }
}
exports.Planet = Planet;
Planet.fluctuatorIntensity = 0.8;
//# sourceMappingURL=Planet.js.map