"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RespawnCommand = void 0;
const ship_1 = require("../../ioInterface/ship");
class RespawnCommand {
    constructor() {
        this.commandNames = [`r`, `respawn`];
        this.targetChannel = `alert`;
    }
    getHelpMessage(commandPrefix) {
        this.commandNames = [];
        return `Use ${commandPrefix}respawn to get your crew a new ship once you've died.`;
    }
    async run({ initialMessage, }) {
        // add ship
        const respawnedShip = await ship_1.respawn(initialMessage.guild.id);
        if (!respawnedShip) {
            await initialMessage.channel.send(`Failed to respawn your server.`);
            return;
        }
        await initialMessage.channel.send(`Respawned your server!`);
    }
    hasPermissionToRun(commandContext) {
        if (!commandContext.ship)
            return `Your server doesn't have a ship yet! Use \`${commandContext.commandPrefix}start\` to start your server off in the game.`;
        if (!commandContext.ship.dead)
            return `Can't respawn because your ship isn't dead!`;
        return true;
    }
}
exports.RespawnCommand = RespawnCommand;
//# sourceMappingURL=Respawn.js.map