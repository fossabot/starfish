"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameGuild = void 0;
const dist_1 = __importDefault(require("../../../../common/dist"));
const GameChannel_1 = require("./GameChannel");
class GameGuild {
    constructor({ guild, channelReferences, }) {
        this.channels = {};
        this.guild = guild;
        this.channelReferences = channelReferences;
        dist_1.default.log(`Loaded ${channelReferences.length} channel references for ${guild.name}.`);
    }
    async send(message, channelType) {
        dist_1.default.log(`messaging`, channelType, Boolean(this.channels[channelType]), this.channels[channelType]?.type);
        // ----- auto-create channel if it doesn't exist -----
        if (!this.channels[channelType]) {
            let ref = this.channelReferences.find((r) => r.type === channelType);
            if (!ref) {
                ref = { type: channelType };
                this.channelReferences.push(ref);
            }
            this.channels[channelType] = new GameChannel_1.GameChannel(this.guild, ref);
            ref.id = this.channels[channelType]?.channel?.id;
        }
        // send
        if (this.channels[channelType])
            await this.channels[channelType]?.send(message);
        else
            dist_1.default.log(`red`, `Failed to send message in ${channelType} channel for guild ${this.guild.name}.`);
    }
}
exports.GameGuild = GameGuild;
//# sourceMappingURL=GameGuild.js.map