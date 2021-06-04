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
const passives = __importStar(require("../../presets/crewPassives"));
const CrewPassive_1 = require("./addins/CrewPassive");
class CrewMember {
    constructor(data, ship) {
        this.name = `crew member`;
        this.targetLocation = null;
        this.tactic = `defensive`;
        this.attackFactions = [];
        this.attackTarget = null;
        this.itemTarget = null;
        this.repairPriority = `most damaged`;
        this.actives = [];
        this.passives = [];
        this.upgrades = [];
        this.stats = [];
        this.maxCargoWeight = CrewMember.baseMaxCargoWeight;
        this.cockpitAction = roomActions.cockpit;
        this.repairAction = roomActions.repair;
        this.weaponsAction = roomActions.weapons;
        this.bunkAction = roomActions.bunk;
        this.id = data.id;
        this.ship = ship;
        this.rename(data.name);
        this.location = data.location || `bunk`;
        this.stamina = data.stamina || this.maxStamina;
        this.lastActive = Date.now();
        this.inventory = data.inventory || [];
        this.credits = data.credits || 10;
        this.skills = data.skills || [
            { skill: `piloting`, level: 1, xp: 0 },
            { skill: `munitions`, level: 1, xp: 0 },
            { skill: `mechanics`, level: 1, xp: 0 },
            { skill: `linguistics`, level: 1, xp: 0 },
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
        if (data.targetLocation)
            this.targetLocation = data.targetLocation;
        if (data.attackFactions)
            this.attackFactions = data.attackFactions;
        if (data.repairPriority)
            this.repairPriority = data.repairPriority;
        if (data.stats)
            this.stats = data.stats;
    }
    rename(newName) {
        this.name = dist_1.default
            .sanitize(newName)
            .result.substring(0, dist_1.default.maxNameLength);
        if (this.name.replace(/\s/g, ``).length === 0)
            this.name = `crew member`;
    }
    goTo(location) {
        if (!(location in this.ship.rooms))
            return false;
        this.location = location;
        this.lastActive = Date.now();
        return true;
    }
    tick() {
        // ----- reset attack target if out of vision range -----
        if (this.attackTarget &&
            !this.ship.visible.ships.find((s) => s.id === this.attackTarget?.id))
            this.attackTarget = null;
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
        this.stamina -=
            dist_1.default.baseStaminaUse / (dist_1.default.deltaTime / dist_1.default.TICK_INTERVAL);
        if (this.tired) {
            this.stamina = 0;
            this.goTo(`bunk`);
            return;
        }
        // ----- cockpit -----
        if (this.location === `cockpit`)
            this.cockpitAction();
        // ----- repair -----
        else if (this.location === `repair`)
            this.repairAction();
        // ----- weapons -----
        else if (this.location === `weapons`)
            this.weaponsAction();
    }
    addXp(skill, xp) {
        if (!xp)
            xp = dist_1.default.baseXpGain / (dist_1.default.deltaTime / dist_1.default.TICK_INTERVAL);
        let skillElement = this.skills.find((s) => s.skill === skill);
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
    }
    addCargo(type, amount) {
        const canHold = this.maxCargoWeight - this.heldWeight;
        const existingStock = this.inventory.find((cargo) => cargo.type === type);
        if (existingStock)
            existingStock.amount += Math.min(canHold, amount);
        else
            this.inventory.push({
                type,
                amount: Math.min(canHold, amount),
            });
        return Math.max(0, amount - canHold);
    }
    get heldWeight() {
        return this.inventory.reduce((total, i) => total + i.amount, 0);
    }
    recalculateMaxCargoWeight() {
        const cargoSpacePassiveBoost = this.passives.find((p) => p.type === `cargoSpace`)
            ?.changeAmount || 0;
        this.maxCargoWeight =
            CrewMember.baseMaxCargoWeight + cargoSpacePassiveBoost;
    }
    addPassive(data) {
        if (!data.type)
            return;
        const existing = this.passives.find((p) => p.type === data.type);
        if (existing) {
            existing.level++;
        }
        else {
            const fullPassiveData = {
                ...passives[data.type],
                level: data.level || 1,
            };
            this.passives.push(new CrewPassive_1.CrewPassive(fullPassiveData, this));
        }
        // reset all variables that might have changed because of this
        this.recalculateAll();
    }
    recalculateAll() {
        this.recalculateMaxCargoWeight();
    }
    addStat(statname, amount) {
        const existing = this.stats.find((s) => s.stat === statname);
        if (!existing)
            this.stats.push({
                stat: statname,
                amount,
            });
        else
            existing.amount += amount;
    }
    get tired() {
        return this.stamina <= 0;
    }
    get maxStamina() {
        return 1;
    }
    get piloting() {
        return this.skills.find((s) => s.skill === `piloting`);
    }
    get linguistics() {
        return this.skills.find((s) => s.skill === `linguistics`);
    }
    get munitions() {
        return this.skills.find((s) => s.skill === `munitions`);
    }
    get mechanics() {
        return this.skills.find((s) => s.skill === `mechanics`);
    }
}
exports.CrewMember = CrewMember;
CrewMember.levelXPNumbers = dist_1.default.levels;
CrewMember.baseMaxCargoWeight = 10;
//# sourceMappingURL=CrewMember.js.map