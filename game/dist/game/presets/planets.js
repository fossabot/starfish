"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cargo_1 = require("./cargo");
const planets = [];
// color: `hsl(50, 80%, 60%)`,
planets.push({
    name: `Cancer`,
    location: [0, 0],
    color: `hsl(50, 80%, 60%)`,
    radius: 86000,
    faction: { color: `green` },
    races: [`crabs`],
    repairCostMultiplier: 1,
    vendor: {
        cargo: [
            {
                cargoData: cargo_1.salt,
                buyMultiplier: 1,
                sellMultiplier: 1,
            },
            {
                cargoData: cargo_1.water,
                buyMultiplier: 1,
                sellMultiplier: 1,
            },
            {
                cargoData: cargo_1.oxygen,
                buyMultiplier: 1,
                sellMultiplier: 1,
            },
        ],
    },
});
planets.push({
    name: `Hera`,
    color: `red`,
    location: [-1, 0],
    radius: 26000,
    races: [`lobsters`],
    repairCostMultiplier: 1.1,
    vendor: {
        cargo: [
            {
                cargoData: cargo_1.salt,
                buyMultiplier: 1.2,
                sellMultiplier: 0.8,
            },
            {
                cargoData: cargo_1.water,
                buyMultiplier: 0.8,
                sellMultiplier: 0.7,
            },
            {
                cargoData: cargo_1.oxygen,
                buyMultiplier: 1.1,
                sellMultiplier: 0.9,
            },
        ],
    },
});
planets.push({
    name: `Osiris`,
    color: `hsl(240, 80%, 90%)`,
    location: [0.2, -0.1],
    radius: 36000,
    races: [`narwhals`, `beluga whales`],
    vendor: {
        cargo: [
            {
                cargoData: cargo_1.oxygen,
                buyMultiplier: 0.8,
                sellMultiplier: 0.4,
            },
        ],
    },
});
exports.default = planets;
//# sourceMappingURL=planets.js.map