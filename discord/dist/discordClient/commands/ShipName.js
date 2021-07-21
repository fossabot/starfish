"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeShipNameCommand = void 0;
const ioInterface_1 = __importDefault(require("../../ioInterface"));
class ChangeShipNameCommand {
    constructor() {
        this.commandNames = [
            `shipname`,
            `changeshipname`,
            `rename`,
            `renameship`,
            `name`,
            `changename`,
            `sn`,
        ];
    }
    getHelpMessage(commandPrefix) {
        return `Use \`${commandPrefix}${this.commandNames[0]} <new name>\` to change the ship's name.`;
    }
    async run(context) {
        if (!context.ship)
            return;
        let typedName = context.rawArgs;
        if (!typedName) {
            await context.initialMessage.channel.send(`Use this command in the format \`${context.commandPrefix}${this.commandNames[0]} <new name>\`.`);
            return;
        }
        typedName = typedName.replace(/(^[\s<]+|[>\s]+$)*/g, ``);
        const res = await ioInterface_1.default.ship.rename(context.ship.id, typedName);
        await context.initialMessage.channel.send(`The ship's name has been changed to **${res}**.`);
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
exports.ChangeShipNameCommand = ChangeShipNameCommand;
//# sourceMappingURL=ShipName.js.map