"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandHandler = void 0;
const start_1 = require("../start");
// import { HelpCommand } from './commands/help'
const CommandContext_1 = require("./CommandContext");
const reactor_1 = require("../../reactions/reactor");
class CommandHandler {
    constructor(prefix) {
        const commandClasses = [start_1.StartCommand];
        this.commands = commandClasses.map((CommandClass) => new CommandClass());
        // this.commands.push(new HelpCommand(this.commands))
        this.prefix = prefix;
    }
    async handleMessage(message) {
        if (message.author.bot ||
            !this.couldBeCommand(message)) {
            return;
        }
        // ignore DMs for now
        if (message.channel.type === 'dm') {
            return;
        }
        const commandContext = new CommandContext_1.CommandContext(message, this.prefix);
        const matchedCommand = this.commands.find((command) => command.commandNames.includes(commandContext.parsedCommandName));
        if (!matchedCommand) {
            await message.reply(`I don't recognize that command. Try ${this.prefix}help.`);
            await reactor_1.reactor.failure(message);
            return;
        }
        // at this point, we need game data to determine which commands a user should be able to run.
        const allowedCommands = this.commands.filter((command) => command.hasPermissionToRun(commandContext));
        if (!allowedCommands.includes(matchedCommand)) {
            await message.reply(`You aren't allowed to use that command. Try ${this.prefix}help.`);
            await reactor_1.reactor.failure(message);
            return;
        }
        await matchedCommand
            .run(commandContext)
            .then(() => {
            reactor_1.reactor.success(message);
        })
            .catch((reason) => {
            reactor_1.reactor.failure(message);
        });
    }
    couldBeCommand(message) {
        return message.content.startsWith(this.prefix);
    }
}
exports.CommandHandler = CommandHandler;
//# sourceMappingURL=CommandHandler.js.map