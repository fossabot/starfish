"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JoinCommand = void 0;
const crew_1 = require("../../ioInterface/crew");
class JoinCommand {
    constructor() {
        this.commandNames = [`j`, `join`, `add`];
    }
    getHelpMessage(commandPrefix) {
        this.commandNames = [];
        return `Use ${commandPrefix}join to join your server's ship.`;
    }
    async run(context) {
        if (!context.ship)
            return;
        const addedCrewMember = await crew_1.add(context.ship.id, {
            name: context.initialMessage.author.username,
            id: context.initialMessage.author.id,
        });
        // add crew member
        if (!addedCrewMember ||
            typeof addedCrewMember === `string`) {
            await context.initialMessage.channel.send(addedCrewMember ||
                `Failed to add you as a member of the crew.`);
            return;
        }
        await context.initialMessage.channel.send(`Added you to the crew.`);
    }
    hasPermissionToRun(commandContext) {
        if (!commandContext.ship)
            return `Your server doesn't have a ship yet! Use \`${commandContext.commandPrefix}start\` to start your server off in the game.`;
        return true;
    }
}
exports.JoinCommand = JoinCommand;
//# sourceMappingURL=Join.js.map