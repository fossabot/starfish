"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Planet = void 0;
const dist_1 = __importDefault(require("../../../../common/dist"));
class Planet {
    constructor({ name, color, location }, game) {
        this.game = game;
        this.name = name;
        this.color = color;
        this.location = location;
    }
    identify() {
        dist_1.default.log(`Planet: ${this.name} (${this.color}) at ${this.location}`);
    }
}
exports.Planet = Planet;
//# sourceMappingURL=Planet.js.map