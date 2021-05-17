"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cumulativeSkillIn = exports.membersIn = void 0;
function membersIn(location) {
    return this.crewMembers.filter((cm) => cm.stamina > 0 && cm.location === location);
}
exports.membersIn = membersIn;
function cumulativeSkillIn(l, s) {
    return this.membersIn(l).reduce((total, m) => {
        return (total +
            (m.skills.find((skill) => skill.skill === s)?.level ||
                0));
    }, 0);
}
exports.cumulativeSkillIn = cumulativeSkillIn;
//# sourceMappingURL=crew.js.map