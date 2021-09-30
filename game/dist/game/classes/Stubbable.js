"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stubbable = void 0;
const dist_1 = __importDefault(require("../../../../common/dist"));
class Stubbable {
    constructor() {
        this._stub = null;
    }
    stubify(disallowedPropNames = [], allowRecursionDepth = 8) {
        if (!this._stub)
            this._stub = dist_1.default.stubify(this, disallowedPropNames, allowRecursionDepth);
        return this._stub;
    }
}
exports.Stubbable = Stubbable;
//# sourceMappingURL=Stubbable.js.map