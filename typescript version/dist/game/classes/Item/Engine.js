"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Engine = void 0;
const Item_1 = require("./Item");
class Engine extends Item_1.Item {
    constructor(data, ship) {
        super(data, ship);
        this.thrustAmplification = data.thrustAmplification;
    }
}
exports.Engine = Engine;
//# sourceMappingURL=Engine.js.map