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
const io_1 = require("../../../server/io");
const roomActions = __importStar(require("./addins/rooms"));
class CrewMember {
    constructor(data, ship) {
        this.targetLocation = null;
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
    }
    rename(newName) {
        this.name = newName;
    }
    goTo(location) {
        // if (this.location === `cockpit`)
        //   this.targetLocation = null
        this.location = location;
        this.lastActive = Date.now();
    }
    tick() {
        // ----- test notify listeners -----
        io_1.io.to(`ship:${this.ship.id}`).emit(`crew:tired`, io_1.stubify(this));
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
                (dist_1.default.deltaTime / 1000);
        if (this.tired) {
            this.stamina = 0;
            this.goTo(`bunk`);
            // ----- notify listeners -----
            io_1.io.to(`ship:${this.ship.id}`).emit(`crew:tired`, io_1.stubify(this));
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
            xp = dist_1.default.deltaTime / 1000;
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
    get tired() {
        return this.stamina <= 0;
    }
    get maxStamina() {
        return 1;
    }
    get staminaRefillPerHour() {
        return 0.3;
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