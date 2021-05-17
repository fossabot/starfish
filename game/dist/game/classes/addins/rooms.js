"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cockpit = void 0;
function cockpit() {
    if (this.ship.canMove &&
        this.targetLocation &&
        !this.ship.isAt(this.targetLocation))
        this.addXp(`piloting`);
}
exports.cockpit = cockpit;
//# sourceMappingURL=rooms.js.map