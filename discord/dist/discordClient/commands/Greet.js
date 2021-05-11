"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GreetCommand = void 0;
class GreetCommand {
    constructor() {
        this.commandNames = ['greet', 'hello'];
    }
    getHelpMessage(commandPrefix) {
        this.commandNames = [];
        return `Use ${commandPrefix}greet to get a greeting.`;
    }
    async run({ receivedDiscordMessage, }) {
        await receivedDiscordMessage.channel.send('hello, world!');
    }
    hasPermissionToRun(parsedUserCommand) {
        return true;
    }
}
exports.GreetCommand = GreetCommand;
//# sourceMappingURL=greet.js.map