"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameChannelManager = void 0;
const dist_1 = __importDefault(require("../../../../common/dist"));
const __1 = require("..");
const resolveOrCreateChannel_1 = __importDefault(require("../helpers/resolveOrCreateChannel"));
const ioInterface_1 = __importDefault(require("../../ioInterface"));
const channelData = {
    alert: {
        name: `🚀Alerts`,
        topic: `Automated ship alerts. Go to ${process.env.FRONTEND_URL} to take action!`,
    },
    chat: {
        name: `🛠Main Deck`,
        topic: `For full-crew discussions.`,
    },
    broadcast: {
        name: `📣Comms Bay`,
        topic: `Area chatter and received broadcasts come here. Send messages here to broadcast them within your interaction range.`,
    },
};
class GameChannelManager {
    constructor(references, guild) {
        this.listeners = [];
        this.guild = guild;
        this.channels = {
            alert: null,
            chat: null,
            broadcast: null,
        };
        references.forEach(async (ref) => {
            this.resolve(ref);
        });
    }
    async post(message) { }
    async resolve({ id, type }) {
        if (id) {
            this.channels[type] = await __1.client.channels.fetch(id);
            dist_1.default.log(`found`, this.channels[type]);
        }
        if (this.channels[type])
            return;
        this.channels[type] = await resolveOrCreateChannel_1.default({
            guild: this.guild,
            ...channelData[type],
        });
        if (!this.channels[type]) {
            dist_1.default.log(`red`, `Failed to create ${type} channel in ${this.guild.name}.`);
            return null;
        }
        if (this.channels[type]?.id !== id) {
            ioInterface_1.default.ship.channelUpdate(this.guild.id, type, this.channels[type]?.id);
        }
    }
    registerListener(listener) { }
}
exports.GameChannelManager = GameChannelManager;
//# sourceMappingURL=ChannelManager.js.map