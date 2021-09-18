"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrewPassive = void 0;
class CrewPassive {
    constructor({ displayName, id, level, factor }, crewMember) {
        this.level = 1;
        this.displayName = displayName;
        this.crewMember = crewMember;
        this.id = id;
        if (level)
            this.level = level;
        this.factor = factor;
    }
    get changeAmount() {
        return this.level * this.factor;
    }
}
exports.CrewPassive = CrewPassive;
//# sourceMappingURL=CrewPassive.js.map