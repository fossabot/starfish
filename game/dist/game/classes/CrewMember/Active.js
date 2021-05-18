"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Active = void 0;
const activeDefaults = {
    baseCooldown: 10000,
};
class Active {
    constructor({ id }, crewMember) {
        this.ready = false;
        this.crewMember = crewMember;
        this.id = id;
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
exports.Active = Active;
//# sourceMappingURL=Active.js.map