"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InviteCommand = void 0;
const dist_1 = __importDefault(require("../../../../common/dist"));
class InviteCommand {
    constructor() {
        this.commandNames = [`invite`];
    }
    getHelpMessage(commandPrefix) {
        this.commandNames = [];
        return `Use ${commandPrefix}invite to get a game bot invite link.`;
    }
    async run({ initialMessage, }) {
        await initialMessage.channel.send(`Add ${dist_1.default.GAME_NAME} to your server!\nhttps://discord.com/api/oauth2/authorize?client_id=${process.env.BOT_ID}&permissions=268561472&scope=bot`);
    }
    hasPermissionToRun() {
        return true;
    }
}
exports.InviteCommand = InviteCommand;
//# sourceMappingURL=Invite.js.map