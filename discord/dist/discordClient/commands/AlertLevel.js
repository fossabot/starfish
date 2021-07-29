"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertLevelCommand = void 0;
const ioInterface_1 = __importDefault(require("../../ioInterface"));
class AlertLevelCommand {
    commandNames = [`alertlevel`, `al`];
    getHelpMessage(commandPrefix) {
        return `Use \`${commandPrefix}${this.commandNames[0]} <1, 2, 3, 4, or 5>\` to set the severity of alerts that will appear in the \`alerts\` channel.`;
    }
    async run(context) {
        if (!context.ship)
            return;
        if (!context.args.length) {
            context.reply(this.getHelpMessage(context.commandPrefix));
            return;
        }
        let selectedNumber = parseInt(context.args[0].replace(/[<>]/g, ``));
        if (isNaN(selectedNumber))
            selectedNumber = 4;
        selectedNumber--;
        const selectedLevel = [
            `low`,
            `medium`,
            `high`,
            `critical`,
            `off`,
        ][selectedNumber];
        if (!selectedLevel)
            return;
        const newLevel = await ioInterface_1.default.ship.alertLevel(context.ship.id, selectedLevel);
        if (newLevel.error)
            return;
        if (newLevel.data === `off`)
            context.sendToGuild(`Alerts have been turned off.`);
        else
            context.sendToGuild(`You will receive alerts for anything of priority ${newLevel.data} and above.`);
    }
    hasPermissionToRun(commandContext) {
        if (!commandContext.ship)
            return `Your server doesn't have a ship yet! Use \`${commandContext.commandPrefix}start\` to start your server off in the game.`;
        if (!commandContext.isCaptain &&
            !commandContext.isServerAdmin)
            return `Only the captain or a server admin can run this command.`;
        return true;
    }
}
exports.AlertLevelCommand = AlertLevelCommand;
//# sourceMappingURL=AlertLevel.js.map