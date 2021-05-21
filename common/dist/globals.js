"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const levels = [];
let previous = 0;
for (let i = 0; i < 100; i++) {
    levels.push(previous + 400 * i * (i / 2));
}
exports.default = {
    GAME_NAME: `SpaceCrab`,
    TICK_INTERVAL: 1000,
    deltaTime: 1000,
    arrivalThreshold: 0.001,
    levels,
};
//# sourceMappingURL=globals.js.map