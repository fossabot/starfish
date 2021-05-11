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
        this.id = data.id;
        this.ship = ship;
        this.name = data.name;
        this.location = data.location || `bunk`;
        this.skills = data.skills || [];
        this.stamina = data.stamina || this.maxStamina;
        this.lastActive = Date.now();
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
            // ----- notify listeners -----
            io_1.io.to(`ship:${this.ship.id}`).emit('crew:tired', io_1.stubify(this));
            return;
        }
        // ----- cockpit -----
        if (this.location === `cockpit`) {
            // c.log(`cockpit`)
        }
        // ----- repair -----
        else if (this.location === `repair`) {
            dist_1.default.log(`repair`);
        }
        // ----- weapons -----
        else if (this.location === `weapons`) {
            dist_1.default.log(`weapons`);
        }
    }
    get tired() {
        return this.stamina <= 0;
    }
    get maxStamina() {
        return (this.skills.find((s) => s.skill === `stamina`)
            ?.level || 1);
    }
    get staminaRefillPerHour() {
        return 0.3;
    }
}
exports.CrewMember = CrewMember;
CrewMember.passiveStaminaLossPerSecond = 0.0001;
//# sourceMappingURL=CrewMember.js.map