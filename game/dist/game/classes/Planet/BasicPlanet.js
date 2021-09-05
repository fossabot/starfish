"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasicPlanet = void 0;
const dist_1 = __importDefault(require("../../../../../common/dist"));
const Planet_1 = require("./Planet");
class BasicPlanet extends Planet_1.Planet {
    constructor(data, game) {
        super(data, game);
        this.priceFluctuator = 1;
        this.toUpdate = {};
        this.planetType = `basic`;
        this.repairFactor = data.repairFactor || 0;
        this.homeworld = game.factions.find((f) => f.id === data.homeworld?.id);
        this.faction = this.homeworld;
        this.leanings = data.leanings || [];
        this.allegiances = [];
        if (data.allegiances) {
            for (let a of data.allegiances) {
                const foundFaction = this.game.factions.find((f) => f.id === a.faction.id);
                if (foundFaction)
                    this.allegiances.push({
                        faction: foundFaction,
                        level: a.level,
                    });
            }
            this.toUpdate.allegiances = this.allegiances;
        }
        this.vendor = data.vendor;
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
    async levelUp() {
        super.levelUp();
        const shipPassiveLeaning = this.leanings.find((l) => l.type === `shipPassives`);
        const shipPassiveMultiplier = shipPassiveLeaning?.never
            ? 0
            : shipPassiveLeaning?.propensity || 1;
        const levelUpOptions = [
            { weight: 150 / this.level, value: `addItemToShop` },
            {
                weight: 1.5,
                value: `expandLandingZone`,
            },
            {
                weight: 2.5,
                value: `increaseRepairFactor`,
            },
            {
                weight: 3 * shipPassiveMultiplier,
                value: `boostSightRange`,
            },
            {
                weight: shipPassiveMultiplier * 1.01,
                value: `boostBroadcastRange`,
            },
            {
                weight: shipPassiveMultiplier * 1.01,
                value: `boostRepairSpeed`,
            },
            {
                weight: shipPassiveMultiplier * 1.01,
                value: `boostRestSpeed`,
            },
            {
                weight: shipPassiveMultiplier * 1.01,
                value: `boostCockpitChargeSpeed`,
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
        else if (levelUpEffect === `boostSightRange`) {
            this.addPassive({
                id: `boostSightRange`,
                intensity: 0.1,
            });
        }
        else if (levelUpEffect === `boostBroadcastRange`) {
            this.addPassive({
                id: `boostBroadcastRange`,
                intensity: 0.1,
            });
        }
        else if (levelUpEffect === `boostRepairSpeed`) {
            this.addPassive({
                id: `boostRepairSpeed`,
                intensity: 0.1,
            });
        }
        else if (levelUpEffect === `boostRestSpeed`) {
            this.addPassive({
                id: `boostRestSpeed`,
                intensity: 0.1,
            });
        }
        else if (levelUpEffect === `boostCockpitChargeSpeed`) {
            this.addPassive({
                id: `boostCockpitChargeSpeed`,
                intensity: 0.1,
            });
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
                    if (toAddToVendor.class === `crewPassives`)
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
    }
    addPassive(passive) {
        const existing = this.passives.find((p) => p.id === `boostSightRange`);
        if (existing)
            existing.intensity =
                (existing.intensity || 0) + (passive.intensity || 1);
        else
            this.passives.push({
                ...passive,
                data: {
                    ...passive.data,
                    source: { planetName: this.name },
                },
            });
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
        if (!this.leanings.find((p) => p.type === `crewPassives` && p.never === true)) {
            const propensity = (this.leanings.find((p) => p.type === `crewPassives`)?.propensity || 0.2) /
                Object.keys(dist_1.default.crewPassives).length;
            for (let crewPassive of Object.values(dist_1.default.crewPassives))
                if (!this.vendor?.passives.find((p) => p.id === crewPassive.id))
                    addable.push({
                        class: `crewPassives`,
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
        const intensity = BasicPlanet.priceFluctuatorIntensity;
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
            passives: undefined,
        };
    }
}
exports.BasicPlanet = BasicPlanet;
BasicPlanet.priceFluctuatorIntensity = 0.8;
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
//# sourceMappingURL=BasicPlanet.js.map