"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const math_1 = __importDefault(require("./math"));
const data = {
    boostMaxStamina: {
        displayName: `Max Stamina Boost`,
        id: `boostMaxStamina`,
        buyable: {
            rarity: 6,
            basePrice: { credits: 8000 },
            scaledCrewCosmeticCurrency: {
                fromLevel: 2,
                amount: 150,
            },
            baseIntensity: 4,
            wholeNumbersOnly: true,
        },
        description: (data, verbose = false) => `${(data.intensity || 1) >= 0 ? `Boost` : `Reduce`} maximum stamina by ${math_1.default.r2(data.intensity || 0)}`,
    },
    cargoSpace: {
        displayName: `Cargo Space`,
        id: `cargoSpace`,
        buyable: {
            rarity: 1.5,
            basePrice: { credits: 2000 },
            scaledCrewCosmeticCurrency: {
                fromLevel: 2,
                amount: 50,
            },
            baseIntensity: 10,
            wholeNumbersOnly: true,
        },
        description: (data, verbose = false) => `${(data.intensity || 1) >= 0 ? `Boost` : `Reduce`} personal cargo capacity by ${math_1.default.r2(data.intensity || 0)} tons` +
            (verbose
                ? ` (if your ship's chassis can support it)`
                : ``),
    },
    boostCockpitChargeSpeed: {
        displayName: `Dorsal Fins`,
        id: `boostCockpitChargeSpeed`,
        description: (data) => `${(data.intensity || 1) >= 0 ? `Boost` : `Reduce`} engine charge speed by ${math_1.default.r2((data.intensity || 0) * 100)}%`,
    },
    boostBrake: {
        displayName: `Grappling Claws`,
        id: `boostBrake`,
        description: (data) => `${(data.intensity || 1) >= 0 ? `Boost` : `Reduce`} brake power by ${math_1.default.r2((data.intensity || 0) * 100)}%`,
    },
    boostBroadcastRange: {
        displayName: `Echolocation`,
        id: `boostBroadcastRange`,
        description: (data) => `${(data.intensity || 1) >= 0 ? `Boost` : `Reduce`} personal broadcast range by ${math_1.default.r2((data.intensity || 0) * 100)}%`,
    },
    boostDropAmounts: {
        displayName: `Nutrient Fitration`,
        id: `boostDropAmounts`,
        description: (data) => `${(data.intensity || 1) >= 0 ? `Boost` : `Reduce`} your share of drop amounts by ${math_1.default.r2((data.intensity || 0) * 100)}%`,
    },
    boostMineSpeed: {
        displayName: `Sharp Pincers`,
        id: `boostMineSpeed`,
        description: (data) => `${(data.intensity || 1) >= 0 ? `Boost` : `Reduce`} mine speed by ${math_1.default.r2((data.intensity || 0) * 100)}%`,
    },
    boostRepairSpeed: {
        displayName: `Tool Belt`,
        id: `boostRepairSpeed`,
        description: (data) => `${(data.intensity || 1) >= 0 ? `Boost` : `Reduce`} repair speed by ${math_1.default.r2((data.intensity || 0) * 100)}%`,
    },
    reduceStaminaDrain: {
        displayName: `Endurance`,
        id: `reduceStaminaDrain`,
        description: (data) => `${(data.intensity || 1) >= 0 ? `Reduce` : `Boost`} stamina drain by ${math_1.default.r2((data.intensity || 0) * 100)}%`,
    },
    boostStaminaRegeneration: {
        displayName: `REM Booster`,
        id: `boostStaminaRegeneration`,
        description: (data) => `${(data.intensity || 1) >= 0 ? `Boost` : `Reduce`} stamina regeneration by ${math_1.default.r2((data.intensity || 0) * 100)}%`,
    },
    boostThrust: {
        displayName: `Hydrodynamics`,
        id: `boostThrust`,
        description: (data) => `${(data.intensity || 1) >= 0 ? `Boost` : `Reduce`} thrust by ${math_1.default.r2((data.intensity || 0) * 100)}%`,
    },
    boostWeaponChargeSpeed: {
        displayName: `Sharpened Points`,
        id: `boostWeaponChargeSpeed`,
        description: (data) => `${(data.intensity || 1) >= 0 ? `Boost` : `Reduce`} weapon charge speed by ${math_1.default.r2((data.intensity || 0) * 100)}%`,
    },
    boostXpGain: {
        displayName: `Developed Cerebrum`,
        id: `boostXpGain`,
        description: (data) => `${(data.intensity || 1) >= 0 ? `Boost` : `Reduce`} xp gain by ${math_1.default.r2((data.intensity || 0) * 100)}%`,
    },
    lessDamageOnEquipmentUse: {
        displayName: `Nimble Appendages`,
        id: `lessDamageOnEquipmentUse`,
        description: (data) => `${(data.intensity || 1) >= 0 ? `Reduce` : `Boost`} item damage on use by ${math_1.default.r2((data.intensity || 0) * 100)}%`,
    },
    generalImprovementPerCrewMemberInSameRoom: {
        displayName: `Squad Training`,
        id: `generalImprovementPerCrewMemberInSameRoom`,
        description: (data) => `${(data.intensity || 1) >= 0 ? `Increased` : `Reduced`} performance in any room by ${math_1.default.r2((data.intensity || 0) * 100)}% per other crew member with you`,
    },
    generalImprovementWhenAlone: {
        displayName: `Solo Training`,
        id: `generalImprovementWhenAlone`,
        description: (data) => `${math_1.default.r2((data.intensity || 0) * 100)}% ${(data.intensity || 1) >= 0 ? `improved` : `reduced`} performance when alone in a room`,
    },
};
exports.default = data;
//# sourceMappingURL=crewPassives.js.map