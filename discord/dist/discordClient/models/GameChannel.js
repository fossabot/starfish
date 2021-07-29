"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameChannel = void 0;
const dist_1 = __importDefault(require("../../../../common/dist"));
class GameChannel {
    guild;
    channel;
    listeners = [];
    constructor(guild, channel) {
        this.guild = guild;
        this.channel = channel;
    }
    async send(message) {
        return await this.channel.send(message).catch(dist_1.default.log);
    }
    registerListener(listener) { }
}
exports.GameChannel = GameChannel;
//# sourceMappingURL=GameChannel.js.map