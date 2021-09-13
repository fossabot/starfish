"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoCommand = void 0;
const ioInterface_1 = __importDefault(require("../../ioInterface"));
class GoCommand {
    commandNames = [`go`, `room`, `move`, `moveto`];
    getHelpMessage(commandPrefix, availableRooms) {
        return `Use \`${commandPrefix}${this.commandNames[0]} <room name>\` to move to a room in the ship.${availableRooms
            ? `\nAvailable rooms: ${availableRooms.join(`, `)}.`
            : ``}`;
    }
    async run(context) {
        if (!context.ship || !context.crewMember)
            return;
        if (!context.args.length) {
            context.reply(this.getHelpMessage(context.commandPrefix, Object.keys(context.ship.rooms)));
            return;
        }
        let roomToGoTo = context.args[0].replace(/[<>]/g, ``);
        if (!context.ship.rooms[roomToGoTo]) {
            context.reply(this.getHelpMessage(context.commandPrefix, Object.keys(context.ship.rooms)));
            return;
        }
        ioInterface_1.default.crew.move(context.ship.id, context.crewMember.id, roomToGoTo);
        context.reply(`Moved you to: ${roomToGoTo}.`);
    }
    hasPermissionToRun(commandContext) {
        if (!commandContext.ship)
            return `Your server doesn't have a ship yet! Use \`${commandContext.commandPrefix}start\` to start your server off in the game.`;
        if (!commandContext.crewMember)
            return `Only crew members can run this command. Join the ship first!`;
        return true;
    }
}
exports.GoCommand = GoCommand;
//# sourceMappingURL=Go.js.map