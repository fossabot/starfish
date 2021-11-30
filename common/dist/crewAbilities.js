"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.crewActives = void 0;
exports.crewActives = {
    instantStamina: {
        id: `instantStamina`,
        description: `Gain 50 stamina instantly.`,
        cooldown: 10000,
        effects: [
            {
                prop: `stamina`,
                add: 0.5,
            },
        ],
    },
    cargoSweep: {
        id: `cargoSweep`,
        cooldown: 10000,
        description: `Sweep the immediate area to look for floating cargo (chance to find cargo).`,
    },
};
//# sourceMappingURL=crewAbilities.js.map