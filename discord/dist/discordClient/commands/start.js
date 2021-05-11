"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StartCommand = void 0;
const ship_1 = require("../../ioInterface/ship");
const crew_1 = require("../../ioInterface/crew");
class StartCommand {
    constructor() {
        this.commandNames = ['start', 'spawn', 'begin', 'init'];
    }
    getHelpMessage(commandPrefix) {
        this.commandNames = [];
        return `Use ${commandPrefix}start to start your server off in the game.`;
    }
    async run({ receivedDiscordMessage, }) {
        // add ship
        const createdShip = await ship_1.create({
            id: receivedDiscordMessage.guild.id,
            name: receivedDiscordMessage.guild.name,
            planet: 'Origin',
            faction: 'green',
        });
        if (!createdShip) {
            await receivedDiscordMessage.channel.send('Failed to start your server in the game.');
            return;
        }
        await receivedDiscordMessage.channel.send('Started your server in the game.');
        const addedCrewMember = await crew_1.add(createdShip.id, {
            name: receivedDiscordMessage.author.username,
            id: receivedDiscordMessage.author.id,
        });
        // add crew member
        if (!addedCrewMember) {
            await receivedDiscordMessage.channel.send('Failed to add you as a member of the crew.');
            return;
        }
        await receivedDiscordMessage.channel.send('Added you to the crew.');
    }
    hasPermissionToRun(parsedUserCommand) {
        return true;
    }
}
exports.StartCommand = StartCommand;
//# sourceMappingURL=start.js.map