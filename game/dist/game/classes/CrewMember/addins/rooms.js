"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bunk = exports.weapons = exports.repair = exports.cockpit = void 0;
const dist_1 = __importDefault(require("../../../../../../common/dist"));
function cockpit() {
    if (this.ship.canMove &&
        this.targetLocation &&
        !this.ship.isAt(this.targetLocation))
        this.addXp(`piloting`);
    // * actual movement handled by Ship class
}
exports.cockpit = cockpit;
function repair() {
    const repairableItems = this.ship.items.filter((i) => i.repair < 1);
    if (repairableItems.length) {
        const amountToRepair = ((this.mechanics?.level || 1) * dist_1.default.deltaTime) /
            repairableItems.length /
            1000 /
            10000;
        dist_1.default.log(amountToRepair);
        repairableItems.forEach((ri) => {
            ri.repair += amountToRepair;
            if (ri.repair > 1)
                ri.repair = 1;
        });
        this.addXp(`mechanics`);
    }
}
exports.repair = repair;
function weapons() {
    // ----- charge weapons -----
    const chargeableWeapons = this.ship.weapons.filter((w) => w.cooldownRemaining > 0);
    if (chargeableWeapons.length) {
        const amountToReduceCooldowns = ((this.munitions?.level || 1) * dist_1.default.deltaTime) /
            chargeableWeapons.length;
        chargeableWeapons.forEach((cw) => {
            cw.cooldownRemaining -= amountToReduceCooldowns;
            if (cw.cooldownRemaining < 0)
                cw.cooldownRemaining = 0;
        });
        this.addXp(`munitions`);
    }
}
exports.weapons = weapons;
function bunk() {
    this.stamina +=
        (dist_1.default.deltaTime / 1000 / 60 / 60) *
            this.staminaRefillPerHour;
    if (this.stamina > this.maxStamina)
        this.stamina = this.maxStamina;
}
exports.bunk = bunk;
//# sourceMappingURL=rooms.js.map