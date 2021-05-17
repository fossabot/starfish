"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandHandler = void 0;
const dist_1 = __importDefault(require("../../../../../common/dist"));
const CommandContext_1 = require("./CommandContext");
const reactor_1 = require("../../reactions/reactor");
const ship_1 = require("../../../ioInterface/ship");
const Start_1 = require("../Start");
const Invite_1 = require("../Invite");
const Link_1 = require("../Link");
const Join_1 = require("../Join");
const Respawn_1 = require("../Respawn");
class CommandHandler {
    constructor(prefix) {
        const commandClasses = [
            Start_1.StartCommand,
            Invite_1.InviteCommand,
            Link_1.LinkCommand,
            Join_1.JoinCommand,
            Respawn_1.RespawnCommand,
        ];
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
        if (message.channel.type === `dm`) {
            return;
        }
        // initialize command context
        const commandContext = new CommandContext_1.CommandContext(message, this.prefix);
        // find matched command
        const matchedCommand = this.commands.find((command) => command.commandNames.includes(commandContext.commandName));
        // handle prefix but no valid command case
        if (!matchedCommand) {
            await message.reply(`I don't recognize that command. Try ${this.prefix}help.`);
            await reactor_1.reactor.failure(message);
            return;
        }
        // get ship data to determine which commands a user should be able to run.
        const ship = await ship_1.get(message.guild?.id || ``);
        commandContext.ship = ship;
        const crewMember = ship?.crewMembers.find((cm) => cm.id === message.author.id) || null;
        commandContext.crewMember = crewMember;
        // check run permissions and get error message if relevant
        const permissionRes = matchedCommand.hasPermissionToRun(commandContext);
        if (permissionRes !== true) {
            await message.channel.send(permissionRes);
            await reactor_1.reactor.failure(message);
            return;
        }
        dist_1.default.log(`gray`, message.content);
        // run command
        await matchedCommand
            .run(commandContext)
            .then(() => {
            reactor_1.reactor.success(message);
        })
            .catch((reason) => {
            dist_1.default.log(`red`, `Failed to run command ${commandContext.commandName}: ${reason}`);
            reactor_1.reactor.failure(message);
        });
    }
    couldBeCommand(message) {
        return message.content.startsWith(this.prefix);
    }
}
exports.CommandHandler = CommandHandler;
//# sourceMappingURL=CommandHandler.js.map