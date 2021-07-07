"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = __importDefault(require("./globals"));
const math_1 = __importDefault(require("./math"));
const text_1 = __importDefault(require("./text"));
const misc_1 = __importDefault(require("./misc"));
const log_1 = __importDefault(require("./log"));
const game_1 = __importDefault(require("./game"));
const physics_1 = __importDefault(require("./physics"));
const discord_1 = __importDefault(require("./discord"));
const Profiler_1 = require("./Profiler");
const species_1 = __importDefault(require("./species"));
exports.default = {
    ...globals_1.default,
    ...math_1.default,
    ...text_1.default,
    ...misc_1.default,
    ...log_1.default,
    ...game_1.default,
    ...physics_1.default,
    ...discord_1.default,
    species: species_1.default,
    Profiler: Profiler_1.Profiler,
};
//# sourceMappingURL=index.js.map