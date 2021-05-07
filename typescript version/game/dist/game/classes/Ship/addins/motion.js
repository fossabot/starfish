"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyTickOfGravity = exports.stop = exports.move = void 0;
const dist_1 = __importDefault(require("../../../../../../common/dist"));
const Ship_1 = require("../Ship");
function move(toLocation) {
    const previousLocation = [
        ...this.location,
    ];
    if (toLocation) {
        this.location = toLocation;
    }
    else {
        if (!this.canMove)
            return;
        if (this.atTargetLocation)
            return;
        const membersInCockpit = this.membersIn('cockpit');
        if (!membersInCockpit.length)
            return;
        // ----- calculate new location -----
        const unitVectorToTarget = dist_1.default.degreesToUnitVector(dist_1.default.angleFromAToB(this.location, this.targetLocation));
        const thrustMagnitude = 0.00001 * membersInCockpit.length; // todo
        this.location[0] +=
            unitVectorToTarget[0] *
                thrustMagnitude *
                (dist_1.default.deltaTime / 1000);
        this.location[1] +=
            unitVectorToTarget[1] *
                thrustMagnitude *
                (dist_1.default.deltaTime / 1000);
    }
    this.toUpdate.location = this.location;
    // ----- add previousLocations -----
    const newAngle = dist_1.default.angleFromAToB(this.location, previousLocation);
    if (Math.abs(newAngle - this.lastMoveAngle) > 8) {
        this.previousLocations.push(previousLocation);
        while (this.previousLocations.length >
            Ship_1.Ship.maxPreviousLocations)
            this.previousLocations.shift();
        this.toUpdate.previousLocations = this.previousLocations;
    }
    this.lastMoveAngle = newAngle;
}
exports.move = move;
function stop() {
    this.velocity = [0, 0];
}
exports.stop = stop;
// export function thrust(
//   this: Ship,
//   angle: number,
//   force: number,
// ): ThrustResult {
//   c.log(`thrusting`, angle, force)
//   return {
//     angle,
//     velocity: c.vectorToMagnitude(this.velocity),
//     message: `hiiii`,
//   }
// }
function applyTickOfGravity() {
    if (!this.canMove)
        return;
    // todo
    // c.log(`gravity`)
}
exports.applyTickOfGravity = applyTickOfGravity;
//# sourceMappingURL=motion.js.map