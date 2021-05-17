"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyTickOfGravity = exports.stop = exports.isAt = exports.move = void 0;
const dist_1 = __importDefault(require("../../../../../../common/dist"));
const io_1 = require("../../../../server/io");
const Ship_1 = require("../Ship");
const arrivalThreshold = 0.001;
function move(toLocation) {
    const previousLocation = [
        ...this.location,
    ];
    const startingLocation = [...this.location];
    const membersInCockpit = this.membersIn(`cockpit`);
    if (!this.canMove || !membersInCockpit.length) {
        this.speed = 0;
        this.velocity = [0, 0];
        this.toUpdate.speed = this.speed;
        this.toUpdate.velocity = this.velocity;
        return;
    }
    // ----- calculate new location based on target of each member in cockpit -----
    for (let member of membersInCockpit) {
        if (!member.targetLocation)
            continue;
        // already there, so stop
        if (Math.abs(this.location[0] - member.targetLocation[0]) < arrivalThreshold &&
            Math.abs(this.location[1] - member.targetLocation[1]) < arrivalThreshold)
            continue;
        this.engines.forEach((e) => e.use());
        const unitVectorToTarget = dist_1.default.degreesToUnitVector(dist_1.default.angleFromAToB(this.location, member.targetLocation));
        const skill = member.skills.find((s) => s.skill === `piloting`)
            ?.level || 1;
        const thrustMagnitude = dist_1.default.lerp(0.00001, 0.0001, skill / 100);
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
    this.velocity = [
        this.location[0] - startingLocation[0],
        this.location[1] - startingLocation[1],
    ];
    this.toUpdate.velocity = this.velocity;
    this.speed = dist_1.default.vectorToMagnitude(this.velocity);
    this.toUpdate.speed =
        this.speed * (dist_1.default.deltaTime / dist_1.default.TICK_INTERVAL);
    this.direction = dist_1.default.vectorToDegrees(this.velocity);
    this.toUpdate.direction = this.direction;
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
        const lastPrevLoc = this.previousLocations[this.previousLocations.length - 1];
        if (!lastPrevLoc ||
            dist_1.default.distance(this.location, lastPrevLoc) > 0.0001) {
            this.previousLocations.push(previousLocation);
            while (this.previousLocations.length >
                Ship_1.Ship.maxPreviousLocations)
                this.previousLocations.shift();
            this.toUpdate.previousLocations =
                this.previousLocations;
        }
    }
    this.lastMoveAngle = newAngle;
}
exports.move = move;
function isAt(coords) {
    return (Math.abs(coords[0] - this.location[0]) <
        arrivalThreshold &&
        Math.abs(coords[1] - this.location[1]) <
            arrivalThreshold);
}
exports.isAt = isAt;
function stop() {
    this.velocity = [0, 0];
}
exports.stop = stop;
function applyTickOfGravity() {
    // if (!this.canMove) return
    // todo
}
exports.applyTickOfGravity = applyTickOfGravity;
//# sourceMappingURL=motion.js.map