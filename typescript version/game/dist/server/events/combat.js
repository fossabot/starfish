"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dist_1 = __importDefault(require("../../../../common/dist"));
const __1 = require("../..");
function default_1(socket) {
    socket.on(`ship:attack`, (data, callback) => {
        const foundShip = __1.game.ships.find((s) => s.id === data.id);
        const enemyShip = __1.game.ships.find((s) => s.id === data.enemyId);
        const weapon = foundShip.weapons.find((w) => w.id === data.weaponId);
        if (!foundShip || !enemyShip) {
            dist_1.default.log(`Call to attack nonexistant ship`);
            callback({
                error: `No ship found! ${data.id} ${data.enemyId}`,
            });
        }
        else if (!(`attack` in foundShip) ||
            !(`attack` in enemyShip)) {
            dist_1.default.log(`Call to attack pacifist ship`);
            callback({
                error: `Ship not combat ready! ${data.id} ${data.enemyId}`,
            });
        }
        else if (!weapon) {
            dist_1.default.log(`Call to attack without valid weapon id`);
            callback({
                error: `No weapon! ${data.weaponId}`,
            });
        }
        else {
            const res = foundShip.attack(enemyShip, weapon);
            callback({
                data: res,
            });
        }
    });
}
exports.default = default_1;
//# sourceMappingURL=combat.js.map