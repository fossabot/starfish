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
function repair(repairAmount) {
    let totalRepaired = 0;
    const repairableItems = this.ship.items.filter((i) => i.repair < 1);
    if (!repairableItems.length)
        return totalRepaired;
    const itemsToRepair = [];
    if (this.repairPriority === `engines`) {
        const r = repairableItems.filter((i) => i.type === `engine`);
        itemsToRepair.push(...r);
    }
    else if (this.repairPriority === `weapons`) {
        const r = repairableItems.filter((i) => i.type === `weapon`);
        itemsToRepair.push(...r);
    }
    else if (this.repairPriority === `scanners`) {
        const r = repairableItems.filter((i) => i.type === `scanner`);
        itemsToRepair.push(...r);
    }
    else if (this.repairPriority === `communicators`) {
        const r = repairableItems.filter((i) => i.type === `communicator`);
        itemsToRepair.push(...r);
    }
    if (itemsToRepair.length === 0 ||
        this.repairPriority === `most damaged`)
        itemsToRepair.push(repairableItems.reduce((mostBroken, ri) => ri.repair < mostBroken.repair ? ri : mostBroken, repairableItems[0]));
    const amountToRepair = repairAmount ||
        dist_1.default.getRepairAmountPerTickForSingleCrewMember(this.mechanics?.level || 1) /
            (dist_1.default.deltaTime / dist_1.default.TICK_INTERVAL) /
            itemsToRepair.length;
    // c.log(
    //   this.repairPriority,
    //   amountToRepair,
    //   itemsToRepair.map((i) => i.type),
    // )
    itemsToRepair.forEach((ri) => {
        const previousRepair = ri.repair;
        ri.repair = (ri.hp + amountToRepair) / ri.maxHp;
        if (ri.repair > 1) {
            ri.repair = 1;
            if (ri.announceWhenRepaired)
                this.ship.logEntry(`Your ${ri.displayName} is fully repaired.`, `medium`);
            ri.announceWhenRepaired = false;
        }
        if (ri.repair > 0.1)
            ri.announceWhenBroken = true;
        if (ri.repair < 0.9)
            ri.announceWhenRepaired = true;
        totalRepaired += ri.repair - previousRepair;
    });
    this.addXp(`mechanics`);
    this.ship.updateThingsThatCouldChangeOnItemChange();
    return totalRepaired;
}
exports.repair = repair;
function weapons() {
    // ----- charge weapons -----
    const chargeableWeapons = this.ship.weapons.filter((w) => w.cooldownRemaining > 0);
    if (chargeableWeapons.length) {
        const amountToReduceCooldowns = dist_1.default.getWeaponCooldownReductionPerTick(this.munitions?.level || 1) / chargeableWeapons.length;
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
        dist_1.default.getStaminaGainPerTickForSingleCrewMember() /
            (dist_1.default.deltaTime / dist_1.default.TICK_INTERVAL);
    if (this.stamina > this.maxStamina)
        this.stamina = this.maxStamina;
}
exports.bunk = bunk;
//# sourceMappingURL=rooms.js.map