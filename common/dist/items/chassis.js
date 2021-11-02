"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chassis = void 0;
const gameConstants_1 = __importDefault(require("../gameConstants"));
// todo use autoRepair passive on a chassis
exports.chassis = {
    tiny1: {
        type: `chassis`,
        id: `tiny1`,
        buyable: false,
        displayName: `Dinghy 0.01`,
        description: `It, uh, flies. I guess that much is undeniable.`,
        mass: 10000 * gameConstants_1.default.itemMassMultiplier,
        basePrice: { credits: 0 },
        slots: 2,
        agility: 0.2,
        maxCargoSpace: 1,
        rarity: 0.2,
    },
    starter1: {
        type: `chassis`,
        id: `starter1`,
        displayName: `Fishbowl 01`,
        description: `They say that a goldfish will grow to the size of its container. The goldfish in this bowl are feeling cramped, restrained to shallower waters.`,
        mass: 1000 * gameConstants_1.default.itemMassMultiplier,
        basePrice: { credits: 2 * gameConstants_1.default.itemPriceMultiplier },
        slots: 5,
        agility: 1.0,
        maxCargoSpace: 15,
        rarity: 0.5,
        passives: [{ id: `boostBrake`, intensity: 3 }],
    },
    starter2: {
        type: `chassis`,
        id: `starter2`,
        displayName: `Fishbowl 02`,
        description: `They say that a goldfish will grow to the size of its container. The goldfish in this bowl are feeling cramped, restrained to shallower waters.`,
        mass: 2000 * gameConstants_1.default.itemMassMultiplier,
        basePrice: { credits: 22 * gameConstants_1.default.itemPriceMultiplier },
        slots: 6,
        agility: 1.0,
        maxCargoSpace: 25,
        rarity: 1,
        passives: [{ id: `boostBrake`, intensity: 3 }],
    },
    starter3: {
        type: `chassis`,
        id: `starter3`,
        displayName: `Fishbowl 03`,
        description: `They say that a goldfish will grow to the size of its container. The goldfish in this bowl are feeling cramped, restrained to shallower waters.`,
        mass: 3000 * gameConstants_1.default.itemMassMultiplier,
        basePrice: { credits: 60 * gameConstants_1.default.itemPriceMultiplier },
        slots: 6,
        agility: 1.0,
        maxCargoSpace: 30,
        rarity: 1.5,
        passives: [
            { id: `boostRepairSpeed`, intensity: 0.05 },
            { id: `boostBrake`, intensity: 3 },
        ],
    },
    // fighter
    fighter1: {
        type: `chassis`,
        id: `fighter1`,
        displayName: `Shark Tank v1`,
        description: `Space is your domain, and you are a lone hunter. Make your enemies bleed.`,
        mass: 3000 * gameConstants_1.default.itemMassMultiplier,
        basePrice: { credits: 45 * gameConstants_1.default.itemPriceMultiplier },
        slots: 6,
        agility: 1.2,
        maxCargoSpace: 20,
        rarity: 1,
        passives: [
            { id: `boostBrake`, intensity: 2 },
            {
                id: `boostDamageWhenNoAlliesWithinDistance`,
                intensity: 0.1,
                data: { distance: 0.3 },
            },
            {
                id: `alwaysSeeTrailColors`,
            },
        ],
    },
    fighter2: {
        type: `chassis`,
        id: `fighter2`,
        displayName: `Shark Tank v2`,
        description: `Space is your domain, and you are a lone hunter. Make your enemies bleed. Adds a flat damage boost over the v1 model.`,
        mass: 3000 * gameConstants_1.default.itemMassMultiplier,
        basePrice: { credits: 220 * gameConstants_1.default.itemPriceMultiplier },
        slots: 6,
        agility: 1.3,
        maxCargoSpace: 30,
        rarity: 2,
        passives: [
            { id: `boostBrake`, intensity: 1 },
            { id: `boostDamage`, intensity: 0.05 },
            {
                id: `boostDamageWhenNoAlliesWithinDistance`,
                intensity: 0.2,
                data: { distance: 0.3 },
            },
            {
                id: `alwaysSeeTrailColors`,
            },
        ],
    },
    fighter3: {
        type: `chassis`,
        id: `fighter3`,
        displayName: `Shark Tank v3`,
        description: `Space is your domain, and you are a lone hunter. Make your enemies bleed. Improved damage passives over previous models.`,
        mass: 4000 * gameConstants_1.default.itemMassMultiplier,
        basePrice: { credits: 790 * gameConstants_1.default.itemPriceMultiplier },
        slots: 7,
        agility: 1.35,
        maxCargoSpace: 40,
        rarity: 3,
        passives: [
            { id: `boostDamage`, intensity: 0.1 },
            {
                id: `boostDamageWhenNoAlliesWithinDistance`,
                intensity: 0.25,
                data: { distance: 0.3 },
            },
            {
                id: `alwaysSeeTrailColors`,
            },
        ],
    },
    // hauler
    hauler1: {
        type: `chassis`,
        id: `hauler1`,
        displayName: `Long Hauler 11`,
        description: `Made to serve aquatic life with migratory instincts. A bit cumbersome in a firefight, but allows for superior cargo space compared to other models in its price range.`,
        mass: 4000 * gameConstants_1.default.itemMassMultiplier,
        basePrice: { credits: 20 * gameConstants_1.default.itemPriceMultiplier },
        slots: 6,
        agility: 0.7,
        maxCargoSpace: 60,
        rarity: 4,
    },
    hauler2: {
        type: `chassis`,
        id: `hauler2`,
        displayName: `Long Hauler 12`,
        description: `Made to serve aquatic life with migratory instincts. A bit cumbersome in a firefight, but allows for superior cargo space compared to other models in its price range. Equipped with CV radio extender.`,
        mass: 7600 * gameConstants_1.default.itemMassMultiplier,
        basePrice: { credits: 130 * gameConstants_1.default.itemPriceMultiplier },
        slots: 6,
        agility: 0.75,
        maxCargoSpace: 80,
        rarity: 8,
        passives: [
            {
                id: `boostBroadcastRange`,
                intensity: 0.08,
            },
        ],
    },
    hauler3: {
        type: `chassis`,
        id: `hauler3`,
        displayName: `Long Hauler 13`,
        description: `Made to serve aquatic life with migratory instincts. A bit cumbersome in a firefight, but allows for superior cargo space compared to other models in its price range. Equipped with CV radio extender.`,
        mass: 9600 * gameConstants_1.default.itemMassMultiplier,
        basePrice: { credits: 520 * gameConstants_1.default.itemPriceMultiplier },
        slots: 7,
        agility: 0.75,
        maxCargoSpace: 100,
        rarity: 10,
        passives: [
            {
                id: `boostBroadcastRange`,
                intensity: 0.15,
            },
        ],
    },
    // sailer
    sailer1: {
        type: `chassis`,
        id: `sailer1`,
        displayName: `Swift Sailer mk.1`,
        description: `Exceptionally light and nimble, this craft excels at getting from A to B quickly.`,
        mass: 900 * gameConstants_1.default.itemMassMultiplier,
        basePrice: { credits: 52 * gameConstants_1.default.itemPriceMultiplier },
        slots: 5,
        agility: 1.4,
        maxCargoSpace: 30,
        rarity: 4,
        passives: [
            { id: `boostBrake`, intensity: 2 },
            { id: `boostCockpitChargeSpeed`, intensity: 0.4 },
        ],
    },
    sailer2: {
        type: `chassis`,
        id: `sailer2`,
        displayName: `Swift Sailer mk.2`,
        description: `Exceptionally light and nimble, this craft excels at getting from A to B quickly.`,
        mass: 1100 * gameConstants_1.default.itemMassMultiplier,
        basePrice: { credits: 230 * gameConstants_1.default.itemPriceMultiplier },
        slots: 6,
        agility: 1.45,
        maxCargoSpace: 40,
        rarity: 7,
        passives: [
            { id: `boostBrake`, intensity: 2 },
            { id: `boostCockpitChargeSpeed`, intensity: 0.8 },
        ],
    },
    sailer3: {
        type: `chassis`,
        id: `sailer3`,
        displayName: `Swift Sailer mk.3`,
        description: `Exceptionally light and nimble, this craft excels at getting from A to B quickly.`,
        mass: 1300 * gameConstants_1.default.itemMassMultiplier,
        basePrice: { credits: 620 * gameConstants_1.default.itemPriceMultiplier },
        slots: 6,
        agility: 1.5,
        maxCargoSpace: 50,
        rarity: 10,
        passives: [
            { id: `boostBrake`, intensity: 2 },
            { id: `boostCockpitChargeSpeed`, intensity: 0.12 },
        ],
    },
    // mega
    mega1: {
        type: `chassis`,
        id: `mega1`,
        displayName: `Whale Pod 01`,
        description: `Size over agility, age over beauty.`,
        mass: 30000 * gameConstants_1.default.itemMassMultiplier,
        basePrice: { credits: 710 * gameConstants_1.default.itemPriceMultiplier },
        slots: 15,
        agility: 0.45,
        maxCargoSpace: 300,
        rarity: 12,
        passives: [{ id: `boostBrake`, intensity: -0.2 }],
    },
    mega2: {
        type: `chassis`,
        id: `mega2`,
        displayName: `Whale Pod 02`,
        description: `Size over agility, age over beauty. The second iteration adds EVEN MORE slots and cargo space, at the cost of even more agility.`,
        mass: 40000 * gameConstants_1.default.itemMassMultiplier,
        basePrice: { credits: 1370 * gameConstants_1.default.itemPriceMultiplier },
        slots: 17,
        agility: 0.35,
        maxCargoSpace: 400,
        rarity: 18,
        passives: [
            { id: `boostBrake`, intensity: -0.3 },
            { id: `boostDropAmount`, intensity: 0.03 },
        ],
    },
    mega3: {
        type: `chassis`,
        id: `mega3`,
        displayName: `Whale Pod 03`,
        description: `Size over agility, age over beauty. The third iteration adds EVEN MORE slots and cargo space, at the cost of even more agility.`,
        mass: 50000 * gameConstants_1.default.itemMassMultiplier,
        basePrice: { credits: 3270 * gameConstants_1.default.itemPriceMultiplier },
        slots: 19,
        agility: 0.25,
        maxCargoSpace: 500,
        rarity: 25,
        passives: [
            { id: `boostBrake`, intensity: -0.4 },
            { id: `boostDropAmount`, intensity: 0.05 },
        ],
    },
};
//# sourceMappingURL=chassis.js.map