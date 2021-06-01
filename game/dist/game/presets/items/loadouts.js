"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const loadouts = {
    humanDefault: {
        chassis: `starter`,
        items: [
            { type: `weapon`, id: `cannon` },
            { type: `engine`, id: `starter` },
            { type: `scanner`, id: `starter` },
            { type: `communicator`, id: `starter` },
            // { type: `armor`, id: `starter` },
        ],
    },
    aiDefault: {
        chassis: `starter`,
        items: [
            { type: `weapon`, id: `cannon` },
            { type: `engine`, id: `starter` },
            { type: `scanner`, id: `starter` },
        ],
    },
};
exports.default = loadouts;
//
//
// weapon: [`cannon`],
//     engine: [`starter`],
//     scanner: [`starter`],
//     communicator: [`starter`],
//     armor: [`starter`],
// },
//
// aiDefault: {
//     chassis: `starter`,
//     weapon: [`cannon`],
//     engine: [`starter`],
//     scanner: [`starter`],
// },
//
//# sourceMappingURL=loadouts.js.map