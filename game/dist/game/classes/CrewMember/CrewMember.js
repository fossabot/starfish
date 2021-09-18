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
const CrewPassive_1 = require("./addins/CrewPassive");
const Stubbable_1 = require("../Stubbable");
class CrewMember extends Stubbable_1.Stubbable {
    constructor(data, ship) {
        super();
        this.type = `crewMember`;
        this.name = `crew member`;
        this.maxStamina = 1;
        this.targetLocation = null;
        this.tactic = `defensive`;
        this.attackFactions = [];
        this.attackTarget = null;
        this.itemTarget = null;
        this.cockpitCharge = 0;
        this.repairPriority = `most damaged`;
        this.minePriority = `closest`;
        this.actives = [];
        this.passives = [];
        this.upgrades = [];
        this.stats = [];
        this.maxCargoSpace = CrewMember.baseMaxCargoSpace;
        this.toUpdate = {};
        this.cockpitAction = roomActions.cockpit;
        this.repairAction = roomActions.repair;
        this.weaponsAction = roomActions.weapons;
        this.bunkAction = roomActions.bunk;
        this.mineAction = roomActions.mine;
        this.id = data.id;
        this.ship = ship;
        this.rename(data.name);
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
        this.skills = data.skills?.filter((s) => s) || [
            { skill: `piloting`, level: 1, xp: 0 },
            { skill: `munitions`, level: 1, xp: 0 },
            { skill: `mechanics`, level: 1, xp: 0 },
            { skill: `linguistics`, level: 1, xp: 0 },
            { skill: `mining`, level: 1, xp: 0 },
        ];
        // if (data.actives)
        //   for (let a of data.actives)
        if (data.passives)
            for (let p of data.passives)
                this.addPassive(p);
        if (data.tactic)
            this.tactic = data.tactic;
        if (data.itemTarget)
            this.itemTarget = data.itemTarget;
        if (data.minePriority)
            this.minePriority = data.minePriority;
        if (data.targetLocation)
            this.targetLocation = data.targetLocation;
        if (data.attackFactions)
            this.attackFactions = data.attackFactions;
        if (data.repairPriority)
            this.repairPriority = data.repairPriority;
        if (data.stats)
            this.stats = data.stats;
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
        if (!(location in this.ship.rooms))
            return false;
        this.location = location;
        this.toUpdate.location = this.location;
        this.active();
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
        if (this.attackTarget &&
            !this.ship.visible.ships.find((s) => s.id === this.attackTarget?.id)) {
            this.attackTarget = null;
            this.toUpdate.attackTarget = this.attackTarget;
        }
        // ----- actives -----
        this.actives.forEach((a) => a.tick());
        // ----- bunk -----
        if (this.location === `bunk`) {
            this.bunkAction();
            return;
        }
        // ----- stamina check/use -----
        if (this.tired)
            return;
        if (!this.ship.tutorial?.currentStep.disableStamina)
            this.stamina -=
                dist_1.default.baseStaminaUse / (dist_1.default.deltaTime / dist_1.default.tickInterval);
        if (this.tired) {
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
    addXp(skill, xp) {
        this.active();
        const xpBoostMultiplier = (this.ship.passives.find((p) => p.id === `boostXpGain`)?.intensity || 0) + 1;
        if (!xp)
            xp =
                (dist_1.default.baseXpGain / (dist_1.default.deltaTime / dist_1.default.tickInterval)) *
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
            CrewMember.levelXPNumbers.findIndex((l) => (skillElement?.xp || 0) <= l);
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
    recalculateMaxCargoSpace() {
        const personalCargoSpacePassiveBoost = this.passives.find((p) => p.id === `cargoSpace`)
            ?.changeAmount || 0;
        const shipwideCargoSpacePassiveBoost = this.ship.passives.find((p) => p.id === `boostCargoSpace`)?.intensity || 0;
        this.maxCargoSpace =
            CrewMember.baseMaxCargoSpace +
                personalCargoSpacePassiveBoost +
                shipwideCargoSpacePassiveBoost;
        this.toUpdate.maxCargoSpace = this.maxCargoSpace;
    }
    addPassive(data) {
        this.active();
        if (!data.id)
            return;
        const existing = this.passives.find((p) => p.id === data.id);
        if (existing) {
            existing.level++;
        }
        else {
            const fullPassiveData = {
                ...dist_1.default.crewPassives[data.id],
                level: data.level || 1,
            };
            this.passives.push(new CrewPassive_1.CrewPassive(fullPassiveData, this));
        }
        this.toUpdate.passives = this.passives;
        // reset all variables that might have changed because of this
        this.recalculateAll();
    }
    recalculateAll() {
        this.recalculateMaxCargoSpace();
    }
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
    get tired() {
        return this.stamina <= 0;
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