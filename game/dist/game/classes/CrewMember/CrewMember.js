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
const io_1 = __importDefault(require("../../../server/io"));
const roomActions = __importStar(require("./addins/rooms"));
const Active_1 = require("./Active");
class CrewMember {
    constructor(data, ship) {
        this.targetLocation = null;
        this.tactic = `defensive`;
        this.attackFactions = [];
        this.attackTarget = null;
        this.repairPriority = `most damaged`;
        this.actives = [];
        this.upgrades = [];
        this.maxCargoWeight = 10;
        this.stats = [];
        this.cockpitAction = roomActions.cockpit;
        this.repairAction = roomActions.repair;
        this.weaponsAction = roomActions.weapons;
        this.bunkAction = roomActions.bunk;
        this.id = data.id;
        this.ship = ship;
        this.name = data.name;
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
        if (data.actives)
            for (let a of data.actives)
                this.actives.push(new Active_1.Active(a, this));
        if (data.tactic)
            this.tactic = data.tactic;
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
        this.name = newName;
    }
    goTo(location) {
        this.location = location;
        this.lastActive = Date.now();
    }
    tick() {
        // ----- test notify listeners -----
        // todo
        io_1.default.to(`ship:${this.ship.id}`).emit(`crew:tired`, dist_1.default.stubify(this));
        // ----- reset attack target if out of vision range -----
        if (this.attackTarget &&
            !this.ship.visible.ships.includes(this.attackTarget))
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
            CrewMember.passiveStaminaLossPerSecond *
                dist_1.default.gameSpeedMultiplier *
                (dist_1.default.deltaTime / dist_1.default.TICK_INTERVAL);
        if (this.tired) {
            this.stamina = 0;
            this.goTo(`bunk`);
            // ----- notify listeners -----
            io_1.default.to(`ship:${this.ship.id}`).emit(`crew:tired`, dist_1.default.stubify(this));
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
            xp =
                (dist_1.default.deltaTime / dist_1.default.TICK_INTERVAL) *
                    dist_1.default.gameSpeedMultiplier;
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
        const existingStock = this.inventory.find((cargo) => cargo.type === type);
        if (existingStock)
            existingStock.amount += amount;
        else
            this.inventory.push({ type, amount });
    }
    get heldWeight() {
        return this.inventory.reduce((total, i) => total + i.amount, 0);
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
CrewMember.passiveStaminaLossPerSecond = 0.0001;
CrewMember.levelXPNumbers = dist_1.default.levels;
//# sourceMappingURL=CrewMember.js.map