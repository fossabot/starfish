"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyTickOfGravity = exports.stop = exports.isAt = exports.move = void 0;
const dist_1 = __importDefault(require("../../../../../../common/dist"));
const io_1 = require("../../../../server/io");
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
        const membersInCockpit = this.membersIn('cockpit');
        if (!membersInCockpit.length)
            return;
        // ----- calculate new location based on target of each member in cockpit -----
        for (let member of membersInCockpit) {
            if (!member.targetLocation)
                continue;
            // already there, so stop
            if (Math.abs(this.location[0] - member.targetLocation[0]) < 0.000001 &&
                Math.abs(this.location[1] - member.targetLocation[1]) < 0.000001)
                continue;
            const unitVectorToTarget = dist_1.default.degreesToUnitVector(dist_1.default.angleFromAToB(this.location, member.targetLocation));
            const thrustMagnitude = 0.00001 *
                (member.skills.find((s) => s.skill === 'piloting')
                    ?.level || 1);
            this.location[0] +=
                unitVectorToTarget[0] *
                    thrustMagnitude *
                    (dist_1.default.deltaTime / 1000);
            this.location[1] +=
                unitVectorToTarget[1] *
                    thrustMagnitude *
                    (dist_1.default.deltaTime / 1000);
        }
    }
    this.toUpdate.location = this.location;
    // ----- update planet -----
    const previousPlanet = this.planet;
    this.planet =
        this.game.planets.find((p) => this.isAt(p.location)) ||
            false;
    if (previousPlanet !== this.planet)
        this.toUpdate.planet = this.planet
            ? io_1.stubify(this.planet)
            : false;
    // ----- add previousLocation -----
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
function isAt(coords) {
    return (Math.abs(coords[0] - this.location[0]) < 0.00001 &&
        Math.abs(coords[1] - this.location[1]) < 0.00001);
}
exports.isAt = isAt;
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