"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = __importDefault(require("./globals"));
const math_1 = __importDefault(require("./math"));
const text_1 = __importDefault(require("./text"));
const log_1 = __importDefault(require("./log"));
exports.default = { ...globals_1.default, ...math_1.default, ...text_1.default, log: log_1.default };
//# sourceMappingURL=index.js.map