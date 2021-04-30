"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyTickOfGravity = exports.thrust = exports.stop = exports.move = void 0;
const common_1 = __importDefault(require("../../../../common"));
function move(toLocation) {
    if (toLocation) {
        this.location = toLocation;
        return;
    }
    this.location[0] += this.velocity[0];
    this.location[1] += this.velocity[1];
}
exports.move = move;
function stop() {
    this.velocity = [0, 0];
}
exports.stop = stop;
function thrust(angle, force) {
    common_1.default.log(`thrusting`, angle, force);
    return {
        angle,
        velocity: this.velocity,
    };
}
exports.thrust = thrust;
function applyTickOfGravity() {
    // c.log(`gravity`)
}
exports.applyTickOfGravity = applyTickOfGravity;
//# sourceMappingURL=movement.js.map