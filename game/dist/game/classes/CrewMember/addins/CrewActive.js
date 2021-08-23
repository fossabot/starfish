"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrewActive = void 0;
const activeDefaults = {
    baseCooldown: 10000,
};
class CrewActive {
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
            if (this.cooldownRemaining <= 0)
                this.ready = true;
            this.crewMember.toUpdate.actives =
                this.crewMember.actives;
        }
    }
}
exports.CrewActive = CrewActive;
//# sourceMappingURL=CrewActive.js.map