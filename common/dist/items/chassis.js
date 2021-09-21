"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chassis = void 0;
const game_1 = __importDefault(require("../game"));
exports.chassis = {
    starter1: {
        type: `chassis`,
        id: `starter1`,
        displayName: `Fishbowl 01`,
        description: `They say that a goldfish will grow to the size of its container. The goldfish in this bowl are feeling cramped, restrained to shallower waters.`,
        mass: 5000,
        basePrice: 20 * game_1.default.itemPriceMultiplier,
        slots: 5,
        agility: 1.0,
        maxCargoSpace: 15,
        rarity: 0.5,
    },
    starter2: {
        type: `chassis`,
        id: `starter2`,
        displayName: `Fishbowl 02`,
        description: `They say that a goldfish will grow to the size of its container. The goldfish in this bowl are feeling cramped, restrained to shallower waters.`,
        mass: 5000,
        basePrice: 62 * game_1.default.itemPriceMultiplier,
        slots: 6,
        agility: 1.0,
        maxCargoSpace: 25,
        rarity: 1,
    },
    // hauler
    hauler1: {
        type: `chassis`,
        id: `hauler1`,
        displayName: `Long Hauler 11`,
        description: `Made to serve aquatic life with migratory instincts. A bit cumbersome in a firefight, but allows for superior cargo space compared to other models in its price range.`,
        mass: 8000,
        basePrice: 78 * game_1.default.itemPriceMultiplier,
        slots: 6,
        agility: 0.7,
        maxCargoSpace: 45,
        rarity: 4,
    },
    hauler2: {
        type: `chassis`,
        id: `hauler2`,
        displayName: `Long Hauler 12`,
        description: `Made to serve aquatic life with migratory instincts. A bit cumbersome in a firefight, but allows for superior cargo space compared to other models in its price range.`,
        mass: 9600,
        basePrice: 210 * game_1.default.itemPriceMultiplier,
        slots: 6,
        agility: 0.75,
        maxCargoSpace: 55,
        rarity: 8,
    },
    // sailer
    sailer1: {
        type: `chassis`,
        id: `sailer1`,
        displayName: `Swift Sailer mk.1`,
        description: `Exceptionally light and nimble, this craft excels at getting from A to B quickly.`,
        mass: 2000,
        basePrice: 52 * game_1.default.itemPriceMultiplier,
        slots: 5,
        agility: 1.4,
        maxCargoSpace: 15,
        rarity: 4,
    },
    sailer2: {
        type: `chassis`,
        id: `sailer2`,
        displayName: `Swift Sailer mk.2`,
        description: `Exceptionally light and nimble, this craft excels at getting from A to B quickly.`,
        mass: 2100,
        basePrice: 130 * game_1.default.itemPriceMultiplier,
        slots: 6,
        agility: 1.45,
        maxCargoSpace: 25,
        rarity: 7,
    },
    // mega
    mega1: {
        type: `chassis`,
        id: `mega1`,
        displayName: `Whale Pod 01`,
        description: `Size over agility, age over beauty.`,
        mass: 60000,
        basePrice: 710 * game_1.default.itemPriceMultiplier,
        slots: 15,
        agility: 0.45,
        maxCargoSpace: 300,
        rarity: 12,
    },
    mega2: {
        type: `chassis`,
        id: `mega2`,
        displayName: `Whale Pod 02`,
        description: `Size over agility, age over beauty. The second iteration adds EVEN MORE slots and cargo space, at the cost of even more agility.`,
        mass: 70000,
        basePrice: 970 * game_1.default.itemPriceMultiplier,
        slots: 18,
        agility: 0.35,
        maxCargoSpace: 400,
        rarity: 18,
    },
};
//# sourceMappingURL=chassis.js.map