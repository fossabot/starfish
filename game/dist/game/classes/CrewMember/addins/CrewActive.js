"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrewActive = void 0;
const activeDefaults = {
    baseCooldown: 10000,
};
class CrewActive {
    constructor({ type }, crewMember) {
        this.ready = false;
        this.crewMember = crewMember;
        this.type = type;
        this.baseCooldown = activeDefaults.baseCooldown;
        this.cooldownRemaining = this.baseCooldown;
    }
    tick() {
        if (this.cooldownRemaining > 0) {
            this.cooldownRemaining -= this.crewMember.stamina;
            this.ready = false;
        }
        else
            this.ready = true;
    }
}
exports.CrewActive = CrewActive;
//# sourceMappingURL=CrewActive.js.map