"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Planet = void 0;
const common_1 = __importDefault(require("../../common"));
class Planet {
    constructor({ name, color, location }, game) {
        this.game = game;
        this.name = name;
        this.color = color;
        this.location = location;
    }
    identify() {
        common_1.default.log(`Planet: ${this.name} (${this.color}) at ${this.location}`);
    }
}
exports.Planet = Planet;
//# sourceMappingURL=Planet.js.map