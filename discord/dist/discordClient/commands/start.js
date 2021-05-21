"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StartCommand = void 0;
const ship_1 = require("../../ioInterface/ship");
const crew_1 = require("../../ioInterface/crew");
class StartCommand {
    constructor() {
        this.commandNames = [`s`, `start`, `spawn`, `begin`, `init`];
    }
    getHelpMessage(commandPrefix) {
        this.commandNames = [];
        return `Use ${commandPrefix}start to start your server off in the game.`;
    }
    async run({ initialMessage, }) {
        // add ship
        const createdShip = await ship_1.create({
            id: initialMessage.guild.id,
            name: initialMessage.guild.name,
            faction: { color: `green` },
        });
        if (!createdShip) {
            await initialMessage.channel.send(`Failed to start your server in the game.`);
            return;
        }
        await initialMessage.channel.send(`Started your server in the game.`);
        const addedCrewMember = await crew_1.add(createdShip.id, {
            name: initialMessage.author.username,
            id: initialMessage.author.id,
        });
        // add crew member
        if (!addedCrewMember) {
            await initialMessage.channel.send(`Failed to add you as a member of the crew.`);
            return;
        }
        await initialMessage.channel.send(`Added you to the crew.`);
    }
    hasPermissionToRun(commandContext) {
        if (commandContext.ship)
            return `Your server already has a ship! It's called ${commandContext.ship.name}.`;
        return true;
    }
}
exports.StartCommand = StartCommand;
//# sourceMappingURL=Start.js.map