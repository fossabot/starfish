"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepairChannelsCommand = void 0;
const resolveOrCreateChannel_1 = __importDefault(require("../actions/resolveOrCreateChannel"));
class RepairChannelsCommand {
    commandNames = [`repairchannels`, `repair`, `rc`, `rch`];
    getHelpMessage(commandPrefix) {
        return `Use \`${commandPrefix}${this.commandNames[0]}\` to repair the game's Discord channels (should they become unlinked).`;
    }
    async run(context) {
        if (!context.guild)
            return;
        await (0, resolveOrCreateChannel_1.default)({
            type: `alert`,
            guild: context.guild,
        });
        await (0, resolveOrCreateChannel_1.default)({
            type: `chat`,
            guild: context.guild,
        });
        await (0, resolveOrCreateChannel_1.default)({
            type: `broadcast`,
            guild: context.guild,
        });
        context.sendToGuild(`Channels repaired.`);
    }
    hasPermissionToRun(commandContext) {
        if (commandContext.dm)
            return `This command can only be invoked in a server.`;
        if (!commandContext.ship)
            return `Your server doesn't have a ship yet! Use \`${commandContext.commandPrefix}start\` to start your server off in the game.`;
        if (!commandContext.isCaptain &&
            !commandContext.isServerAdmin)
            return `Only the captain or a server admin may run this command.`;
        return true;
    }
}
exports.RepairChannelsCommand = RepairChannelsCommand;
//# sourceMappingURL=RepairChannels.js.map