"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const species_1 = __importDefault(require("./species"));
const factions = {
    green: {
        name: `Green Grapplers`,
        id: `green`,
        color: `hsl(140, 70%, 55%)`,
        homeworld: `Origin`,
        species: [
            species_1.default.octopi,
            species_1.default.squids,
            species_1.default.crabs,
            species_1.default.lobsters,
        ],
    },
    blue: {
        name: `Blue Breathers`,
        id: `blue`,
        color: `hsl(190, 75%, 40%)`,
        homeworld: `Neptune`,
        species: [
            species_1.default.seals,
            species_1.default[`sea turtles`],
            species_1.default.dolphins,
            species_1.default.whales,
        ],
    },
    purple: {
        name: `Purple Pescos`,
        id: `purple`,
        color: `hsl(290, 40%, 50%)`,
        homeworld: `Osiris`,
        species: [
            species_1.default.angelfish,
            species_1.default.blowfish,
            species_1.default.tuna,
            species_1.default.shrimp,
        ],
    },
    red: {
        name: `Bloody Birds`,
        id: `red`,
        color: `hsl(0, 60%, 50%)`,
        ai: true,
        species: [
            species_1.default.seagulls,
            species_1.default.flamingos,
            species_1.default.eagles,
            species_1.default.chickens,
        ],
    },
};
// proper fish 🐟🐠🐡
// air breathers 🦭🐢🦈🐋
// bottom feeders 🦞🦀(🦪)
// wigglers 🐙🦑🦐
// green grapplers 🐙🦑🦞🦀
// blue breathers 🦭🐢🦈🐋
// purple pescos 🐟🐠🐡🦐
// annnd red robos lmao
// salt-water
// freshwater
// air-breathers
exports.default = factions;
//# sourceMappingURL=factions.js.map