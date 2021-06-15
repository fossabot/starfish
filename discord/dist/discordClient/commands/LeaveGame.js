"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaveGameCommand = void 0;
const dist_1 = __importDefault(require("../../../../common/dist"));
const ioInterface_1 = __importDefault(require("../../ioInterface"));
class LeaveGameCommand {
    constructor() {
        this.commandNames = [`leavegame`];
    }
    getHelpMessage(commandPrefix) {
        return `Use \`${commandPrefix}${this.commandNames[0]}\` to remove your server from the game.`;
    }
    async run(context) {
        if (!context.guild)
            return;
        // remove ship
        const res = await ioInterface_1.default.ship.destroy(context.guild.id);
        dist_1.default.log(res);
        if (res)
            context.initialMessage.channel.send(res);
    }
    hasPermissionToRun(commandContext) {
        if (commandContext.dm)
            return `This command can only be invoked in a server.`;
        if (!commandContext.isCaptain &&
            !commandContext.isServerAdmin)
            return `Only the captain or a server admin may run this command.`;
        if (!commandContext.ship)
            return `Your server doesn't have a ship yet! Run \`${commandContext.commandPrefix}start\` to get started.`;
        return true;
    }
}
exports.LeaveGameCommand = LeaveGameCommand;
//# sourceMappingURL=LeaveGame.js.map