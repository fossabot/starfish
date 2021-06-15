"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dist_1 = __importDefault(require("../../../../common/dist"));
async function default_1(guild) {
    dist_1.default.log(`green`, `Guild ${guild.name} has added the bot.`);
}
exports.default = default_1;
//# sourceMappingURL=addedToGuild.js.map