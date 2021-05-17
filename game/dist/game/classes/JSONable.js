"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSONable = void 0;
const dist_1 = __importDefault(require("../../../../common/dist"));
class JSONable {
    toJSON() {
        const jsonObj = Object.assign({}, this);
        const proto = Object.getPrototypeOf(this);
        const getKeyValue = (key) => (obj) => obj[key];
        for (const key of Object.getOwnPropertyNames(proto)) {
            const desc = Object.getOwnPropertyDescriptor(proto, key);
            dist_1.default.log(desc);
            const hasGetter = desc && typeof desc.get === 'function';
            if (hasGetter) {
                dist_1.default.log(key);
                const _key = key;
                jsonObj[_key] = getKeyValue(key)(this);
            }
        }
        return jsonObj;
    }
}
exports.JSONable = JSONable;
//# sourceMappingURL=JSONable.js.map