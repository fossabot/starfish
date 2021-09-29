"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const math_1 = __importDefault(require("./math"));
const data = {
    cargoSpace: {
        displayName: `Cargo Space`,
        id: `cargoSpace`,
        buyable: {
            rarity: 1,
            basePrice: 1000,
        },
        description: (data) => `Boost personal cargo capacity by ${math_1.default.r2(data.intensity || 0)} tons, assuming that your ship's chassis can support the weight.`,
    },
    boostCockpitChargeSpeed: {
        displayName: `Dorsal Fins`,
        id: `boostCockpitChargeSpeed`,
        description: (data) => `Boost engine charge speed by ${math_1.default.r2((data.intensity || 0) * 100)}%`,
    },
    boostBrake: {
        displayName: `Grappling Claws`,
        id: `boostBrake`,
        description: (data) => `Boost brake power by ${math_1.default.r2((data.intensity || 0) * 100)}%`,
    },
    boostBroadcastRange: {
        displayName: `Echolocation`,
        id: `boostBroadcastRange`,
        description: (data) => `Boost personal broadcast range by ${math_1.default.r2((data.intensity || 0) * 100)}%`,
    },
    boostDropAmounts: {
        displayName: `Nutrient Fitration`,
        id: `boostDropAmounts`,
        description: (data) => `Boost your share of drop amounts by ${math_1.default.r2((data.intensity || 0) * 100)}%`,
    },
    boostMineSpeed: {
        displayName: `Sharp Pincers`,
        id: `boostMineSpeed`,
        description: (data) => `Boost mine speed by ${math_1.default.r2((data.intensity || 0) * 100)}%`,
    },
    boostRepairSpeed: {
        displayName: `Nesting Instinct`,
        id: `boostRepairSpeed`,
        description: (data) => `Boost repair speed by ${math_1.default.r2((data.intensity || 0) * 100)}%`,
    },
    boostStaminaRegeneration: {
        displayName: `Sleep-Swimmer`,
        id: `boostStaminaRegeneration`,
        description: (data) => `Boost stamina regeneration by ${math_1.default.r2((data.intensity || 0) * 100)}%`,
    },
    boostThrust: {
        displayName: `Hydrodynamic`,
        id: `boostThrust`,
        description: (data) => `Boost thrust by ${math_1.default.r2((data.intensity || 0) * 100)}%`,
    },
    boostWeaponChargeSpeed: {
        displayName: `Sharpened Claws`,
        id: `boostWeaponChargeSpeed`,
        description: (data) => `Boost weapon charge speed by ${math_1.default.r2((data.intensity || 0) * 100)}%`,
    },
    boostXpGain: {
        displayName: `Developed Cerebrum`,
        id: `boostXpGain`,
        description: (data) => `Boost xp gain by ${math_1.default.r2((data.intensity || 0) * 100)}%`,
    },
    lessDamageOnEquipmentUse: {
        displayName: `Nimble Appendages`,
        id: `lessDamageOnEquipmentUse`,
        description: (data) => `Reduce item damage on use by ${math_1.default.r2((data.intensity || 0) * 100)}%`,
    },
    generalImprovementPerCrewMemberInSameRoom: {
        displayName: `School Mentality`,
        id: `generalImprovementPerCrewMemberInSameRoom`,
        description: (data) => `Improved performance in any room by ${math_1.default.r2((data.intensity || 0) * 100)}% per other crew member with you`,
    },
    generalImprovementWhenAlone: {
        displayName: `Lone Hunter`,
        id: `generalImprovementWhenAlone`,
        description: (data) => `${math_1.default.r2((data.intensity || 0) * 100)}% improved performance when alone in a room`,
    },
};
exports.default = data;
//# sourceMappingURL=crewPassives.js.map