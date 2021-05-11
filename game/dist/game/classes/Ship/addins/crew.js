"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.membersIn = void 0;
function membersIn(location) {
    return this.crewMembers.filter((cm) => cm.stamina > 0 && cm.location === location);
}
exports.membersIn = membersIn;
//# sourceMappingURL=crew.js.map