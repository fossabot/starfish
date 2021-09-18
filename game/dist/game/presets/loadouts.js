"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const loadouts = {
    tutorial1: {
        chassis: `starter1`,
        items: [
            { type: `engine`, id: `tutorial1` },
            { type: `scanner`, id: `tutorial1` },
        ],
    },
    tutorial2: {
        chassis: `starter1`,
        items: [
            { type: `engine`, id: `tutorial1` },
            { type: `weapon`, id: `tutorial1` },
            { type: `scanner`, id: `tutorial1` },
        ],
    },
    aiTutorial1: {
        chassis: `starter1`,
        items: [{ type: `weapon`, id: `tiny1` }],
    },
    humanDefault: {
        chassis: `starter1`,
        items: [
            { type: `weapon`, id: `cannon1` },
            { type: `engine`, id: `starter1` },
            { type: `scanner`, id: `starter1` },
            // { type: `scanner`, id: `starter2` },
            { type: `communicator`, id: `starter1` },
            // { type: `armor`, id: `starter` },
        ],
    },
};
exports.default = loadouts;
//# sourceMappingURL=loadouts.js.map