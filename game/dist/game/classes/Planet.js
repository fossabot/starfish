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
    constructor({ name, color, location, mass, landingRadiusMultiplier, repairFactor, vendor, homeworld, creatures, radius, allegiances, leanings, xp, level, baseLevel, }, game) {
        super();
        this.type = `planet`;
        this.allegiances = [];
        this.xp = 0;
        this.level = 0;
        this.priceFluctuator = 1;
        this.toUpdate = {};
        this.game = game;
        this.name = name;
        this.color = color;
        this.location = location;
        this.radius = radius;
        this.mass =
            mass ||
                ((5.974e30 * this.radius) / 36000) *
                    Planet.massAdjuster;
        this.landingRadiusMultiplier =
            landingRadiusMultiplier || 1;
        this.repairFactor = repairFactor || 0;
        this.creatures = creatures || [];
        this.homeworld = game.factions.find((f) => f.id === homeworld?.id);
        this.faction = this.homeworld;
        this.level = level;
        this.xp = xp;
        this.leanings = leanings || [];
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
            this.vendor = vendor;
        const levelsToApply = baseLevel - level;
        for (let i = 0; i < levelsToApply; i++) {
            this.levelUp();
        }
        // c.log(this.getAddableToVendor())
        // c.log(
        //   this.repairFactor,
        //   this.landingRadiusMultiplier,
        //   this.level,
        // )
        this.updateFluctuator();
        setInterval(() => this.updateFluctuator(), (1000 * 60 * 60 * 24) / dist_1.default.gameSpeedMultiplier); // every day
        setInterval(() => this.decrementAllegiances(), (1000 * 60 * 60 * 24) / dist_1.default.gameSpeedMultiplier); // every day
        if (this.faction)
            this.incrementAllegiance(this.faction, 100);
    }
    get shipsAt() {
        return this.game.humanShips.filter((s) => s.planet === this);
    }
    async addXp(amount, straightUp = false) {
        if (!amount)
            return;
        if (!straightUp)
            amount /= 100;
        this.xp = Math.round(this.xp + amount);
        const previousLevel = this.level;
        this.level = dist_1.default.levels.findIndex((l) => (this.xp || 0) <= l);
        const levelDifference = this.level - previousLevel;
        // c.log({ amount, previousLevel, levelDifference })
        for (let i = 0; i < levelDifference; i++) {
            await this.levelUp();
        }
        if (!levelDifference) {
            this.updateFrontendForShipsAt();
            await db_1.db.planet.addOrUpdateInDb(this);
        }
    }
    async levelUp() {
        this.level++;
        if (this.xp < dist_1.default.levels[this.level - 1]) {
            // this will only happen when levelling up from 0, randomize a bit so it's not clear if NO one has ever been here before
            this.xp =
                dist_1.default.levels[this.level - 1] +
                    Math.floor(Math.random() * 100);
        }
        const levelUpOptions = [
            { weight: 100 / this.level, value: `addItemToShop` },
            {
                weight: 1.5,
                value: `expandLandingZone`,
            },
            {
                weight: 2.5,
                value: `increaseRepairFactor`,
            },
        ];
        let levelUpEffect = dist_1.default.randomWithWeights(levelUpOptions);
        // homeworlds always have repair factor to some degree
        if (this.level === 1 && this.homeworld)
            levelUpEffect = `increaseRepairFactor`;
        if (levelUpEffect === `expandLandingZone`) {
            this.landingRadiusMultiplier += 1;
        }
        else if (levelUpEffect === `increaseRepairFactor`) {
            this.repairFactor += 1;
        }
        else if (levelUpEffect === `addItemToShop`) {
            if (this.vendor) {
                // add something to vendor
                const addable = this.getAddableToVendor();
                if (!addable.length)
                    return;
                const toAddToVendor = dist_1.default.randomWithWeights(addable.map((a) => ({
                    weight: a.propensity,
                    value: a,
                })));
                if (toAddToVendor.class === `repair`)
                    this.vendor.repairCostMultiplier =
                        getRepairCostMultiplier();
                else {
                    const { buyMultiplier, sellMultiplier } = getBuyAndSellMultipliers();
                    if (toAddToVendor.class === `items`)
                        this.vendor.items.push({
                            buyMultiplier,
                            id: toAddToVendor.id,
                            type: toAddToVendor.type,
                        });
                    if (toAddToVendor.class === `chassis`)
                        this.vendor.chassis.push({
                            buyMultiplier,
                            id: toAddToVendor.id,
                        });
                    if (toAddToVendor.class === `passives`)
                        this.vendor.passives.push({
                            buyMultiplier,
                            id: toAddToVendor.id,
                        });
                    if (toAddToVendor.class === `cargo`)
                        this.vendor.cargo.push({
                            buyMultiplier,
                            sellMultiplier,
                            id: toAddToVendor.id,
                        });
                    // if (toAddToVendor.class === `actives`)
                    //   this.vendor.actives.push({buyMultiplier, sellMultiplier, id: toAddToVendor.id})
                }
            }
        }
        this.updateFrontendForShipsAt();
        await db_1.db.planet.addOrUpdateInDb(this);
    }
    getAddableToVendor() {
        const targetRarity = Math.max(0, this.level - 2) / 3;
        const rarityMultiplier = (rarity) => 1 / (Math.abs(rarity - targetRarity) + 1);
        const addable = [];
        if (!this.leanings.find((p) => p.type === `cargo` && p.never === true)) {
            const propensity = ((this.leanings.find((p) => p.type === `cargo`)
                ?.propensity || 0.5) /
                Object.keys(dist_1.default.cargo).length) *
                3;
            // * multiplied to make cargo slightly more common
            for (let cargo of Object.values(dist_1.default.cargo))
                if (!this.vendor?.cargo.find((ca) => ca.id === cargo.id))
                    addable.push({
                        class: `cargo`,
                        id: cargo.id,
                        propensity: propensity * rarityMultiplier(cargo.rarity),
                    });
        }
        if (!this.leanings.find((l) => l.type === `items` && l.never === true)) {
            const baseItemPropensity = (this.leanings.find((l) => l.type === `items`)
                ?.propensity || 0.5) * 2;
            for (let itemGroup of Object.values(dist_1.default.items)) {
                if (this.leanings.find((p) => p.type === Object.values(itemGroup)[0].type &&
                    p.never === true))
                    continue;
                let propensity = baseItemPropensity *
                    (this.leanings.find((p) => p.type === Object.values(itemGroup)[0].type)?.propensity || 0.2);
                propensity /= Object.keys(itemGroup).length;
                // * lightly encourage specialization
                const alreadySellingOfType = this.vendor?.items.filter((i) => i.type === Object.values(itemGroup)[0].type).length || 0;
                propensity *= 1 + alreadySellingOfType;
                for (let item of Object.values(itemGroup))
                    if (item.buyable !== false &&
                        !this.vendor?.items.find((i) => i.type === item.type && i.id === item.id))
                        addable.push({
                            class: item.type === `chassis`
                                ? `chassis`
                                : `items`,
                            type: item.type,
                            id: item.id,
                            propensity: propensity * rarityMultiplier(item.rarity),
                        });
            }
        }
        if (!this.leanings.find((p) => p.type === `passives` && p.never === true)) {
            const propensity = (this.leanings.find((p) => p.type === `passives`)
                ?.propensity || 0.2) /
                Object.keys(dist_1.default.crewPassives).length;
            for (let crewPassive of Object.values(dist_1.default.crewPassives))
                if (!this.vendor?.passives.find((p) => p.id === crewPassive.id))
                    addable.push({
                        class: `passives`,
                        id: crewPassive.id,
                        propensity: propensity *
                            rarityMultiplier(crewPassive.rarity),
                    });
        }
        // if (
        //   !this.leanings.find(
        //     (p) => p.type === `actives` && p.never === true,
        //   )
        // ) {
        //   const propensity =
        //     (this.leanings.find((p) => p.type === `actives`)
        //       ?.propensity || 0.2) / Object.keys(c.crewActives).length
        //   for (let crewActive of Object.values(c.crewActives))
        //     if (
        //       !this.vendor?.actives.find(
        //         (p) => p.id === crewActive.id,
        //       )
        //     )
        //       addable.push({
        //         class: `actives`,
        //         id: crewActive.id,
        //         propensity:
        //           propensity *
        //           rarityMultiplier(crewActive.rarity),
        //       })
        // }
        if (!this.leanings.find((p) => p.type === `repair` && p.never === true)) {
            const propensity = this.leanings.find((p) => p.type === `repair`)
                ?.propensity || 0.2;
            if (!this.vendor?.repairCostMultiplier)
                addable.push({ class: `repair`, propensity });
        }
        return addable;
    }
    updateFrontendForShipsAt() {
        this._stub = null;
        this.shipsAt.forEach((s) => {
            s.toUpdate.planet = this.stubify();
        });
    }
    getVisibleStub() {
        return this.stubify();
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
            repairFactor: undefined,
            landingRadiusMultiplier: undefined,
        };
    }
}
exports.Planet = Planet;
Planet.fluctuatorIntensity = 0.8;
Planet.massAdjuster = 1;
function getBuyAndSellMultipliers(item = false) {
    const buyMultiplier = dist_1.default.r2(0.8 + Math.random() * 0.4, 3);
    const sellMultiplier = Math.min(buyMultiplier *
        dist_1.default.factionVendorMultiplier *
        dist_1.default.factionVendorMultiplier, dist_1.default.r2(buyMultiplier * (Math.random() * 0.2) + 0.8, 3)) * (item ? 0.4 : 1);
    return { buyMultiplier, sellMultiplier };
}
function getRepairCostMultiplier() {
    const repairCostVariance = 0.5;
    const repairCostMultiplier = dist_1.default.r2(1 +
        Math.random() * repairCostVariance -
        repairCostVariance / 2, 3);
    return repairCostMultiplier;
}
/*
   
RIGHT NOW
planets semirandomly select which items, cargo, chassis, and passives (cargo space only atm) they sell/buy.
--
planet has a "level" based on how far from the origin it is
it uses that level to define a min and max rarity of what it will sell
then it loops through all cargo, items, etc and finds the elements within that range, then randomly chooses to add or not add it to its sell pool

UPSIDES
planets are very randomized, and all generally different
DOWNSIDES
planets lack thematic consistency — there's no "scanner" planet, no cargo trading hub, etc
higher level planets are only ever far away from the origin
planets lack personality


FUTURE
we likely want min rarity to not exist, so that low level cargo like salt doesn't become entirely useless
planets need to stay unique in their offerings, but also need to be able to "gain" something on level up


APPROACH
planets spawn with a RANDOMIZED level, not based on distance from origin (but with a slight bias toward the center being lower)
planet levels/progress are visible to players
ships can donate to a planet to help it level up
when a planet spawns, it "levels up" on the backend up to its current level
planets can have "leanings" towards different types of things to sell — item type, cargo, etc
planets can also have "never" leanings, meaning they will never sell that type of thing
there could also be autogenerated story background text for planets that's based on those leanings
the NUMBER of things sold by a planet is influenced by its level
the rarity of the thing that gets added to the sell pool on level up is (soft) relative to the planet's level
homeworlds have a base higher level, and are more likely to sell cargo


*/
//# sourceMappingURL=Planet.js.map