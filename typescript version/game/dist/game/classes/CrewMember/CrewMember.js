"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrewMember = void 0;
const dist_1 = __importDefault(require("../../../../../common/dist"));
class CrewMember {
    constructor(data, ship) {
        this.id = data.id;
        this.ship = ship;
        this.name = data.name;
        this.location = data.location || `bunk`;
        this.skills = data.skills;
        this.stamina = data.stamina || this.maxStamina;
    }
    rename(newName) {
        this.name = newName;
    }
    goTo(location) {
        this.location = location;
    }
    tick() {
        if (this.location === `bunk`) {
            this.stamina +=
                (dist_1.default.deltaTime / 1000 / 60 / 60) *
                    this.staminaRefillPerHour;
            if (this.stamina > this.maxStamina)
                this.stamina = this.maxStamina;
            return;
        }
        if (this.tired)
            return;
        this.stamina -=
            CrewMember.passiveStaminaLossPerSecond *
                (dist_1.default.deltaTime / 1000);
        if (this.tired) {
            this.stamina = 0;
            return;
        }
        if (this.location === `cockpit`) {
            dist_1.default.log(`cockpit`);
        }
        else if (this.location === `repair`) {
            dist_1.default.log(`repair`);
        }
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