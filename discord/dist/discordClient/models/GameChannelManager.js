"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameChannelManager = void 0;
const dist_1 = __importDefault(require("../../../../common/dist"));
const GameChannel_1 = require("./GameChannel");
class GameChannelManager {
    constructor(guild, references = []) {
        this.channels = {};
        this.guild = guild;
        this.references = references;
        dist_1.default.log(`Loaded ${references.length} channel references for ${guild.name}.`);
    }
    send(message, channelType) {
        // ----- auto-create channel if it doesn't exist -----
        if (!this.channels[channelType]) {
            let ref = this.references.find((r) => r.type === `alert`);
            if (!ref) {
                ref = { type: channelType };
                this.references.push(ref);
            }
            this.channels[channelType] = new GameChannel_1.GameChannel(this.guild, ref);
            ref.id = this.channels[channelType]?.channel?.id;
        }
        // send
        if (this.channels[channelType])
            this.channels[channelType]?.send(message);
        else
            dist_1.default.log(`red`, `Failed to send message in ${channelType} channel for guild ${this.guild.name}.`);
        dist_1.default.log(this);
    }
}
exports.GameChannelManager = GameChannelManager;
//# sourceMappingURL=GameChannelManager.js.map