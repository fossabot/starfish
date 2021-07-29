"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeCaptainCommand = void 0;
const ioInterface_1 = __importDefault(require("../../ioInterface"));
class ChangeCaptainCommand {
    commandNames = [`changecaptain`, `captain`, `cc`];
    getHelpMessage(commandPrefix) {
        return `Use \`${commandPrefix}${this.commandNames[0]} <@newcaptain>\` to change the ship's captain.`;
    }
    async run(context) {
        if (!context.ship)
            return;
        let typedId = context.args[0];
        if (!typedId) {
            await context.initialMessage.channel.send(`Use this command in the format \`${context.commandPrefix}${this.commandNames[0]} <@newcaptain>\`.`);
            return;
        }
        typedId = typedId.replace(/[<>@!]*/g, ``);
        const crewMember = context.ship.crewMembers?.find((cm) => cm.id === typedId);
        if (!crewMember) {
            await context.initialMessage.channel.send(`No ship crew member found for that server member. Are you sure they've joined the crew?`);
            return;
        }
        const res = await ioInterface_1.default.ship.setCaptain(context.ship.id, crewMember.id);
        if (res) {
            await context.initialMessage.channel.send(res);
            return;
        }
        await context.initialMessage.channel.send(`${crewMember.name} has been promoted to captain!`);
    }
    hasPermissionToRun(commandContext) {
        if (!commandContext.ship)
            return `Your server doesn't have a ship yet! Run \`${commandContext.commandPrefix}start\` to get started.`;
        if (!commandContext.isCaptain &&
            !commandContext.isServerAdmin)
            return `Only the captain or a server admin can run this command.`;
        return true;
    }
}
exports.ChangeCaptainCommand = ChangeCaptainCommand;
//# sourceMappingURL=ChangeCaptain.js.map