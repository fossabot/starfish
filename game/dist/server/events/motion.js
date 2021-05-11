"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dist_1 = __importDefault(require("../../../../common/dist"));
const __1 = require("../..");
function default_1(socket) {
    socket.on('ship:targetLocation', (id, targetLocation) => {
        if (!Array.isArray(targetLocation) ||
            targetLocation.length !== 2 ||
            targetLocation.find((l) => isNaN(parseInt(l))))
            return dist_1.default.log('Invalid call to set targetLocation:', id, targetLocation);
        const foundShip = __1.game.ships.find((s) => s.id === id);
        if (foundShip)
            foundShip.targetLocation = targetLocation;
        dist_1.default.log('Set', id, 'targetLocation to', targetLocation);
    });
}
exports.default = default_1;
//# sourceMappingURL=motion.js.map