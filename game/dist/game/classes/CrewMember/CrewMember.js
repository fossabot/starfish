"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrewMember = void 0;
const dist_1 = __importDefault(require("../../../../../common/dist"));
const io_1 = require("../../../server/io");
class CrewMember {
    constructor(data, ship) {
        this.targetLocation = null;
        this.id = data.id;
        this.ship = ship;
        this.name = data.name;
        this.location = data.location || `bunk`;
        this.stamina = data.stamina || this.maxStamina;
        this.lastActive = Date.now();
        this.inventory = data.inventory || [];
        this.credits = data.credits || 10;
        this.skills = data.skills || [
            { skill: 'stamina', level: 1, xp: 0 },
            { skill: 'piloting', level: 1, xp: 0 },
            { skill: 'munitions', level: 1, xp: 0 },
            { skill: 'mechanics', level: 1, xp: 0 },
            { skill: 'linguistics', level: 1, xp: 0 },
        ];
    }
    rename(newName) {
        this.name = newName;
    }
    goTo(location) {
        if (this.location === 'cockpit')
            this.targetLocation = null;
        this.location = location;
        this.lastActive = Date.now();
    }
    tick() {
        // ----- test notify listeners -----
        io_1.io.to(`ship:${this.ship.id}`).emit('crew:tired', io_1.stubify(this));
        // ----- bunk -----
        if (this.location === `bunk`) {
            this.stamina +=
                (dist_1.default.deltaTime / 1000 / 60 / 60) *
                    this.staminaRefillPerHour;
            if (this.stamina > this.maxStamina)
                this.stamina = this.maxStamina;
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
            this.goTo('bunk');
            // ----- notify listeners -----
            io_1.io.to(`ship:${this.ship.id}`).emit('crew:tired', io_1.stubify(this));
            return;
        }
        // ----- cockpit -----
        if (this.location === `cockpit`) {
            if (this.ship.canMove &&
                this.targetLocation &&
                !this.ship.isAt(this.targetLocation))
                this.addXp('piloting');
        }
        // ----- repair -----
        else if (this.location === `repair`) {
            this.addXp('mechanics');
        }
        // ----- weapons -----
        else if (this.location === `weapons`) {
            this.addXp('munitions');
        }
    }
    addXp(skill, xp) {
        if (!xp)
            xp = dist_1.default.deltaTime / 1000;
        const skillElement = this.skills.find((s) => s.skill === skill);
        if (!skillElement)
            this.skills.push({ skill, level: 1, xp });
        else
            skillElement.xp += xp;
    }
    get tired() {
        return this.stamina <= 0;
    }
    get maxStamina() {
        return (this.skills?.find((s) => s.skill === `stamina`)
            ?.level || 1);
    }
    get staminaRefillPerHour() {
        return 0.3;
    }
}
exports.CrewMember = CrewMember;
CrewMember.passiveStaminaLossPerSecond = 0.0001;
//# sourceMappingURL=CrewMember.js.map