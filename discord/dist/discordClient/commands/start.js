"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StartCommand = void 0;
const ioInterface_1 = __importDefault(require("../../ioInterface/"));
class StartCommand {
    constructor() {
        this.commandNames = [`s`, `start`, `spawn`, `begin`, `init`];
    }
    getHelpMessage(commandPrefix) {
        this.commandNames = [];
        return `Use ${commandPrefix}start to start your server off in the game.`;
    }
    async run(context) {
        if (!context.initialMessage.guild)
            return;
        // add ship
        const createdShip = await ioInterface_1.default.ship.create({
            id: context.initialMessage.guild.id,
            name: context.initialMessage.guild.name,
            faction: { color: `green` },
        });
        if (!createdShip) {
            await context.initialMessage.channel.send(`Failed to start your server in the game.`);
            return;
        }
        const addedCrewMember = await ioInterface_1.default.crew.add(createdShip.id, {
            name: context.initialMessage.author.username,
            id: context.initialMessage.author.id,
        });
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
        if (commandContext.ship)
            return `Your server already has a ship! It's called ${commandContext.ship.name}.`;
        return true;
    }
}
exports.StartCommand = StartCommand;
//# sourceMappingURL=Start.js.map