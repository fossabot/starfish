"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrewMember = void 0;
const dist_1 = __importDefault(require("../../../../../common/dist"));
const roomActions = __importStar(require("./addins/rooms"));
const Stubbable_1 = require("../Stubbable");
class CrewMember extends Stubbable_1.Stubbable {
    constructor(data, ship) {
        super();
        this.type = `crewMember`;
        this.name = `crew member`;
        this.maxStamina = 1;
        this.targetLocation = false;
        this.combatTactic = `none`;
        this.attackTargetId = `any`;
        this.targetItemType = `any`;
        this.cockpitCharge = 0;
        this.repairPriority = `most damaged`;
        this.minePriority = `closest`;
        this.passives = [];
        this.permanentPassives = [];
        this.upgrades = [];
        this.stats = [];
        this.tutorialShipId = undefined;
        this.mainShipId = undefined;
        this.toUpdate = {};
        this.cockpitAction = roomActions.cockpit;
        this.repairAction = roomActions.repair;
        this.weaponsAction = roomActions.weapons;
        this.bunkAction = roomActions.bunk;
        this.mineAction = roomActions.mine;
        this.id = data.id;
        this.ship = ship;
        this.rename(data.name);
        if (data.speciesId && dist_1.default.species[data.speciesId])
            this.setSpecies(data.speciesId);
        const hasBunk = ship.rooms.bunk;
        this.location =
            data.location ||
                (hasBunk
                    ? `bunk`
                    : dist_1.default.randomFromArray(Object.keys(ship.rooms))) ||
                `bunk`; // failsafe
        this.stamina = data.stamina || this.maxStamina;
        this.lastActive = data.lastActive || Date.now();
        this.inventory = data.inventory?.filter((i) => i) || [];
        this.cockpitCharge = data.cockpitCharge || 0;
        this.credits = data.credits ?? 200;
        this.skills =
            data.skills && data.skills.length
                ? [...(data.skills.filter((s) => s) || [])]
                : [
                    { skill: `piloting`, level: 1, xp: 0 },
                    { skill: `munitions`, level: 1, xp: 0 },
                    { skill: `mechanics`, level: 1, xp: 0 },
                    { skill: `linguistics`, level: 1, xp: 0 },
                    { skill: `mining`, level: 1, xp: 0 },
                ];
        if (data.tutorialShipId)
            this.tutorialShipId = data.tutorialShipId;
        if (data.mainShipId)
            this.mainShipId = data.mainShipId;
        if (data.permanentPassives) {
            for (let p of data.permanentPassives)
                this.addToPermanentPassive(p);
        }
        if (data.combatTactic)
            this.combatTactic = data.combatTactic;
        if (data.targetItemType)
            this.targetItemType = data.targetItemType;
        if (data.minePriority)
            this.minePriority = data.minePriority;
        if (data.targetLocation)
            this.targetLocation = data.targetLocation;
        if (data.repairPriority)
            this.repairPriority = data.repairPriority;
        if (data.stats)
            this.stats = [...data.stats];
        this.recalculateAll();
        this.toUpdate = this;
    }
    rename(newName) {
        this.active();
        this.name = dist_1.default
            .sanitize(newName)
            .result.substring(0, dist_1.default.maxNameLength);
        if (this.name.replace(/\s/g, ``).length === 0)
            this.name = `crew member`;
        this.toUpdate.name = this.name;
    }
    goTo(location) {
        const previousLocation = this.location;
        if (!(location in this.ship.rooms))
            return false;
        this.location = location;
        this.toUpdate.location = this.location;
        this.active();
        if (this.location !== previousLocation) {
            if (this.location === `weapons` ||
                previousLocation === `weapons`) {
                // don't attack immediately on returning to weapons bay
                this.combatTactic = `none`;
                this.toUpdate.combatTactic = this.combatTactic;
                // recalculate ship combat strategy on joining/leaving weapons bay
                this.ship.recalculateTargetItemType();
                this.ship.recalculateCombatTactic();
            }
        }
        if (this.ship.crewMembers.length > 10 &&
            this.ship.crewMembers.reduce((all, cm) => {
                return Boolean(all && cm.location === `bunk`);
            }, true))
            this.ship.addTagline(`Nap Champions`, `having all 10+ crew members asleep at once`);
        return true;
    }
    tick() {
        this._stub = null; // invalidate stub
        // ----- reset attack target if out of vision range -----
        if (this.attackTargetId &&
            ![`closest`, `any`].includes(this.attackTargetId) &&
            !this.ship.visible.ships.find((s) => s.id === this.attackTargetId)) {
            this.attackTargetId = `any`;
            this.toUpdate.attackTargetId = this.attackTargetId;
        }
        // ----- bunk -----
        if (this.location === `bunk`) {
            this.bunkAction();
            return;
        }
        // ----- stamina check/use -----
        if (this.stamina <= 0)
            return;
        if (!this.ship.tutorial?.currentStep?.disableStamina)
            this.stamina -=
                this.ship.game.settings.baseStaminaUse /
                    (dist_1.default.deltaTime / dist_1.default.tickInterval);
        if (this.stamina <= 0) {
            this.stamina = 0;
            this.goTo(`bunk`);
            this.toUpdate.stamina = this.stamina;
            return;
        }
        this.toUpdate.stamina = this.stamina;
        // ----- cockpit -----
        if (this.location === `cockpit`)
            this.cockpitAction();
        // ----- repair -----
        else if (this.location === `repair`)
            this.repairAction();
        // ----- weapons -----
        else if (this.location === `weapons`)
            this.weaponsAction();
        // ----- mine -----
        else if (this.location === `mine`)
            this.mineAction();
    }
    active() {
        this.lastActive = Date.now();
        this.toUpdate.lastActive = this.lastActive;
    }
    setSpecies(speciesId) {
        // if somehow there already was one, remove its passives
        if (this.speciesId)
            for (let p of dist_1.default.species[this.speciesId].passives)
                this.removePassive(p);
        if (dist_1.default.species[speciesId]) {
            this.speciesId = speciesId;
            this.toUpdate.speciesId = speciesId;
            for (let p of dist_1.default.species[speciesId].passives)
                this.applyPassive(p);
        }
    }
    addXp(skill, xp) {
        this.active();
        const xpBoostMultiplier = (this.ship.passives.find((p) => p.id === `boostXpGain`)?.intensity || 0) + 1;
        if (!xp)
            xp =
                (this.ship.game.settings.baseXpGain /
                    (dist_1.default.deltaTime / dist_1.default.tickInterval)) *
                    xpBoostMultiplier;
        let skillElement = this.skills.find((s) => s?.skill === skill);
        if (!skillElement) {
            const index = this.skills.push({
                skill,
                level: 1,
                xp,
            });
            skillElement = this.skills[index - 1];
        }
        else
            skillElement.xp += xp;
        skillElement.level =
            CrewMember.levelXPNumbers.findIndex((l) => (skillElement?.xp || 0) < l);
        this.toUpdate.skills = this.skills;
    }
    addCargo(id, amount) {
        amount = dist_1.default.r2(amount, 2, true); // round down to 2 decimal places
        const canHold = Math.min(this.ship.chassis.maxCargoSpace, this.maxCargoSpace) - this.heldWeight;
        const existingStock = this.inventory.find((cargo) => cargo.id === id);
        if (existingStock)
            existingStock.amount = dist_1.default.r2(existingStock.amount + Math.min(canHold, amount));
        else
            this.inventory.push({
                id,
                amount: Math.min(canHold, amount),
            });
        this.toUpdate.inventory = this.inventory;
        this.ship.recalculateMass();
        return Math.max(0, amount - canHold);
    }
    removeCargo(id, amount) {
        this.active();
        const existingStock = this.inventory.find((cargo) => cargo.id === id);
        if (existingStock)
            existingStock.amount = dist_1.default.r2(existingStock.amount -
                Math.min(existingStock.amount, amount));
        this.toUpdate.inventory = this.inventory;
        this.ship.recalculateMass();
    }
    get heldWeight() {
        return this.inventory
            .filter((i) => i)
            .reduce((total, i) => total + i.amount, 0);
    }
    get maxCargoSpace() {
        return Math.max(CrewMember.baseMaxCargoSpace, this.getPassiveIntensity(`cargoSpace`));
    }
    // ----- passives -----
    getPassiveIntensity(id) {
        return this.passives
            .filter((p) => p.id === id)
            .reduce((total, p) => (p.intensity || 0) + total, 0);
    }
    addToPermanentPassive(passive) {
        const found = this.permanentPassives.find((p) => p.id === passive.id);
        if (found) {
            if (found.intensity)
                found.intensity += passive.intensity || 0;
            else
                found.intensity = passive.intensity || 0;
        }
        else
            this.permanentPassives.push(passive);
        this.applyPassive(passive);
    }
    applyPassive(p) {
        this.passives.push(p);
        this.toUpdate.passives = this.passives;
        // reset all variables that might have changed because of this
        this.recalculateAll();
    }
    removePassive(p) {
        this.active();
        const foundIndex = this.passives.findIndex((p2) => p2.id === p.id);
        this.passives.splice(foundIndex, 1);
        this.toUpdate.passives = this.passives;
        // reset all variables that might have changed because of this
        this.recalculateAll();
    }
    recalculateAll() { }
    addStat(statname, amount) {
        this.active();
        const existing = this.stats.find((s) => s.stat === statname);
        if (!existing)
            this.stats.push({
                stat: statname,
                amount,
            });
        else
            existing.amount += amount;
        this.toUpdate.stats = this.stats;
    }
    get piloting() {
        return (this.skills.find((s) => s?.skill === `piloting`) || {
            skill: `piloting`,
            level: 1,
            xp: 0,
        });
    }
    get linguistics() {
        return (this.skills.find((s) => s?.skill === `linguistics`) || { skill: `linguistics`, level: 1, xp: 0 });
    }
    get munitions() {
        return (this.skills.find((s) => s?.skill === `munitions`) || {
            skill: `munitions`,
            level: 1,
            xp: 0,
        });
    }
    get mechanics() {
        return (this.skills.find((s) => s?.skill === `mechanics`) || {
            skill: `mechanics`,
            level: 1,
            xp: 0,
        });
    }
    get mining() {
        return (this.skills.find((s) => s?.skill === `mining`) || {
            skill: `mining`,
            level: 1,
            xp: 0,
        });
    }
}
exports.CrewMember = CrewMember;
CrewMember.levelXPNumbers = dist_1.default.levels;
CrewMember.baseMaxCargoSpace = 10;
//# sourceMappingURL=CrewMember.js.map