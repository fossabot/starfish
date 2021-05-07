"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyTickOfGravity = exports.stop = exports.move = void 0;
const io_1 = require("../../../../server/io");
function move(toLocation) {
    if (toLocation) {
        this.location = toLocation;
    }
    else {
        if (!this.canMove ||
            (this.velocity[0] === 0 && this.velocity[1] === 0))
            return;
        this.location[0] += this.velocity[0];
        this.location[1] += this.velocity[1];
    }
    // ----- notify listeners -----
    io_1.io.to(`ship:${this.id}`).emit('ship:update', {
        id: this.id,
        updates: { location: this.location },
    });
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
//# sourceMappingURL=movement.js.map