"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Planet = void 0;
const dist_1 = __importDefault(require("../../../../common/dist"));
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
                        cargoId: cargo.cargoId,
                    };
                }),
                passives: vendor.passives?.map((passive) => {
                    return {
                        buyMultiplier: passive.buyMultiplier,
                        passiveId: passive.passiveId,
                    };
                }),
                chassis: vendor.chassis?.map((chassis) => {
                    return {
                        buyMultiplier: chassis.buyMultiplier,
                        sellMultiplier: chassis.sellMultiplier,
                        chassisId: chassis.chassisId,
                    };
                }),
                actives: vendor.actives?.map((active) => {
                    return {
                        buyMultiplier: active.buyMultiplier,
                        activeId: active.activeId,
                    };
                }),
                items: vendor.items
                    ?.map((item) => {
                    return {
                        buyMultiplier: item.buyMultiplier,
                        sellMultiplier: item.sellMultiplier,
                        itemType: item.itemType,
                        itemId: item.itemId,
                    };
                })
                    .filter((i) => i.itemId in dist_1.default.items[i.itemType]),
            };
        this.mass = (5.974e30 * this.radius) / 36000;
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
//
//
//
// RIGHT NOW
// planets semirandomly select which items, cargo, chassis, and passives (cargo space only atm) they sell/buy.
// --
// planet has a "level" based on how far from the origin it is
// it uses that level to define a min and max rarity of what it will sell
// then it loops through all cargo, items, etc and finds the elements within that range, then randomly chooses to add or not add it to its sell pool
//
// UPSIDES
// planets are very randomized, and all generally different
// DOWNSIDES
// planets lack thematic consistency — there's no "scanner" planet, no cargo trading hub, etc
// higher level planets are only ever far away from the origin
// planets lack personality
//
//
// FUTURE
// we likely want min rarity to not exist, so that low level cargo like salt doesn't become entirely useless
// planets need to stay unique in their offerings, but also need to be able to "gain" something on level up
//
//
// APPROACH
// planets spawn with a RANDOMIZED level, not based on distance from origin (but with a slight bias toward the center being lower)
// planet levels/progress are visible to players
// ships can donate to a planet to help it level up
// when a planet spawns, it "levels up" on the backend up to its current level
// planets can have "leanings" towards different types of things to sell — item type, cargo, etc
// planets can also have "never" leanings, meaning they will never sell that type of thing
// there could also be autogenerated story background text for planets that's based on those leanings
// the NUMBER of things sold by a planet is influenced by its level
// the rarity of the thing that gets added to the sell pool on level up is (soft) relative to the planet's level
//
//
//
//
//
//
//
//# sourceMappingURL=Planet.js.map