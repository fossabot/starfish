"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dist_1 = __importDefault(require("../../../../common/dist"));
const factions = {
    green: {
        name: `Green Grapplers`,
        id: `green`,
        color: `hsl(140, 70%, 55%)`,
        homeworld: `Origin`,
        species: [
            dist_1.default.species.octopi,
            dist_1.default.species.squids,
            dist_1.default.species.crabs,
            dist_1.default.species.lobsters,
        ],
    },
    blue: {
        name: `Blue Breathers`,
        id: `blue`,
        color: `hsl(190, 75%, 40%)`,
        homeworld: `Neptune`,
        species: [
            dist_1.default.species.seals,
            dist_1.default.species[`sea turtles`],
            dist_1.default.species.dolphins,
            dist_1.default.species.whales,
        ],
    },
    purple: {
        name: `Purple Pescos`,
        id: `purple`,
        color: `hsl(290, 40%, 50%)`,
        homeworld: `Osiris`,
        species: [
            dist_1.default.species.angelfish,
            dist_1.default.species.blowfish,
            dist_1.default.species.tuna,
            dist_1.default.species.shrimp,
        ],
    },
    red: {
        name: `Bloody Birds`,
        id: `red`,
        color: `hsl(0, 60%, 50%)`,
        ai: true,
        species: [
            dist_1.default.species.seagulls,
            dist_1.default.species.flamingos,
            dist_1.default.species.eagles,
            dist_1.default.species.chickens,
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