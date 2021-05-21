"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cargo_1 = require("./cargo");
const planets = [];
planets.push({
    name: `Origin`,
    color: `hsl(50, 80%, 60%)`,
    location: [0, 0],
    vendor: {
        cargo: [
            {
                cargoData: cargo_1.food,
                buyMultiplier: 1,
                sellMultiplier: 1,
            },
            {
                cargoData: cargo_1.metals,
                buyMultiplier: 1,
                sellMultiplier: 1,
            },
            {
                cargoData: cargo_1.textiles,
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
    vendor: {
        cargo: [
            {
                cargoData: cargo_1.food,
                buyMultiplier: 1.2,
                sellMultiplier: 0.8,
            },
            {
                cargoData: cargo_1.metals,
                buyMultiplier: 0.8,
                sellMultiplier: 1.2,
            },
            {
                cargoData: cargo_1.textiles,
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
    vendor: {
        cargo: [
            {
                cargoData: cargo_1.textiles,
                buyMultiplier: 0.8,
                sellMultiplier: 1.1,
            },
        ],
    },
});
exports.default = planets;
//# sourceMappingURL=planets.js.map