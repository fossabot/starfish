"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const levels = [];
let previous = 0;
for (let i = 0; i < 100; i++) {
    levels.push(previous + 400 * i * (i / 2));
}
exports.default = {
    GAME_NAME: `Starfish`,
    GAME_DESCRIPTION: `Exactly what it sounds like.`,
    TICK_INTERVAL: 1000,
    M_PER_KM: 1000,
    KM_PER_AU: 149597900,
    GRAVITY_RANGE: 1,
    GRAVITATIONAL_CONSTANT: 6.6743 * 10 ** -11,
    LIGHTSPEED: 72.1935409205,
    deltaTime: 1000,
    ARRIVAL_THRESHOLD: 0.001,
    levels,
};
//# sourceMappingURL=globals.js.map