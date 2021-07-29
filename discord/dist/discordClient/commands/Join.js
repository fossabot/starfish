"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JoinCommand = void 0;
const crew_1 = require("../../ioInterface/crew");
const resolveOrCreateRole_1 = __importDefault(require("../actions/resolveOrCreateRole"));
class JoinCommand {
    commandNames = [`join`, `add`, `j`];
    getHelpMessage(commandPrefix) {
        return `Use \`${commandPrefix}${this.commandNames[0]}\` to join your server's ship.`;
    }
    async run(context) {
        if (!context.ship || !context.guild)
            return;
        const addedCrewMember = await crew_1.add(context.ship.id, {
            name: context.nickname,
            id: context.initialMessage.author.id,
        });
        // add crew member
        if (!addedCrewMember ||
            typeof addedCrewMember === `string`) {
            await context.initialMessage.channel.send(addedCrewMember ||
                `Failed to add you as a member of the crew.`);
            return;
        }
        const crewRole = await resolveOrCreateRole_1.default({
            type: `crew`,
            guild: context.guild,
        });
        if (!crewRole) {
            await context.initialMessage.channel.send(`Failed to add you to the \`Crew\` server role.`);
        }
        else {
            context.guildMember?.roles
                .add(crewRole)
                .catch(() => { });
        }
        if (context.ship.crewMembers?.length === 1)
            await context.sendToGuild(`Use this channel to chat with your crewmates.`, `chat`);
    }
    hasPermissionToRun(commandContext) {
        if (!commandContext.ship)
            return `Your server doesn't have a ship yet! Use \`${commandContext.commandPrefix}start\` to start your server off in the game.`;
        return true;
    }
}
exports.JoinCommand = JoinCommand;
//# sourceMappingURL=Join.js.map