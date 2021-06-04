"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StartCommand = void 0;
const ioInterface_1 = __importDefault(require("../../ioInterface/"));
const resolveOrCreateRole_1 = __importDefault(require("../actions/resolveOrCreateRole"));
class StartCommand {
    constructor() {
        this.commandNames = [`start`, `s`, `spawn`, `begin`, `init`];
    }
    getHelpMessage(commandPrefix) {
        return `Use \`${commandPrefix}${this.commandNames[0]}\` to start your server off in the game.`;
    }
    async run(context) {
        if (!context.guild)
            return;
        // add ship
        const createdShip = await ioInterface_1.default.ship.create({
            id: context.guild.id,
            name: context.guild.name,
            species: { id: `angelfish` },
        });
        if (!createdShip) {
            await context.initialMessage.channel.send(`Failed to start your server in the game.`);
            return;
        }
        const addedCrewMember = await ioInterface_1.default.crew.add(createdShip.id, {
            name: context.nickname,
            id: context.initialMessage.author.id,
        });
        const crewRole = await resolveOrCreateRole_1.default({
            type: `crew`,
            guild: context.guild,
        });
        if (!crewRole) {
            await context.initialMessage.channel.send(`Failed to add you to the \`Crew\` server role.`);
        }
        else {
            context.guildMember?.roles.add(crewRole);
        }
        // add crew member
        if (!addedCrewMember) {
            await context.initialMessage.channel.send(`Failed to add you as a member of the crew.`);
            return;
        }
        await context.sendToGuild(`Welcome to the game! Game alerts will be sent to this channel.`);
        await context.sendToGuild(`${context.initialMessage.author.username} has joined the crew.`);
        await context.sendToGuild(`Use this channel to chat with your crewmates.`, `chat`);
        await context.sendToGuild(`Use this channel to broadcast to the local area.`, `broadcast`);
    }
    hasPermissionToRun(commandContext) {
        if (commandContext.dm)
            return `This command can only be invoked in a server.`;
        if (!commandContext.isCaptain &&
            !commandContext.isServerAdmin)
            return `Only the captain or a server admin may run this command.`;
        if (commandContext.ship)
            return `Your server already has a ship! It's called ${commandContext.ship.name}.`;
        return true;
    }
}
exports.StartCommand = StartCommand;
//# sourceMappingURL=Start.js.map