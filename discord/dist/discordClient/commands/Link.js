"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkCommand = void 0;
class LinkCommand {
    constructor() {
        this.commandNames = [`link`, `url`];
    }
    getHelpMessage(commandPrefix) {
        this.commandNames = [];
        return `Use ${commandPrefix}link to get a link to your ship's console.`;
    }
    async run({ initialMessage, }) {
        await initialMessage.channel.send(`Your ship's console:\n${process.env.FRONTEND_URL}/s`);
    }
    hasPermissionToRun(commandContext) {
        if (!commandContext.ship)
            return `Your server doesn't have a ship yet! Run \`${commandContext.commandPrefix}start\` to get started.`;
        return true;
    }
}
exports.LinkCommand = LinkCommand;
//# sourceMappingURL=Link.js.map