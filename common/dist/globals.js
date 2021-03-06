"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const levels = [];
for (let i = 0; i < 100; i++) {
    levels.push(400 * i * (i / 2));
}
exports.default = {
    gameName: `Starfish`,
    gameDescription: `A game about exploring the universe in a ship crewed by your Discord server's members.`,
    gameColor: `#FF9F49`,
    tickInterval: 1000,
    mPerKm: 1000,
    kmPerAu: 149597900,
    gravitationalConstant: 6.6743 * 10 ** -11,
    lightspeed: 72.1935409205,
    deltaTime: 1000,
    levels,
};
//# sourceMappingURL=globals.js.map