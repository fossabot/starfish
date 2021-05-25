"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandHandler = void 0;
const dist_1 = __importDefault(require("../../../common/dist"));
const discord_js_1 = require("discord.js");
const CommandContext_1 = require("./models/CommandContext");
const reactor_1 = require("./reactions/reactor");
const ioInterface_1 = __importDefault(require("../ioInterface"));
const Start_1 = require("./commands/Start");
const Invite_1 = require("./commands/Invite");
const Link_1 = require("./commands/Link");
const Join_1 = require("./commands/Join");
const Respawn_1 = require("./commands/Respawn");
const RepairChannels_1 = require("./commands/RepairChannels");
const Broadcast_1 = require("./commands/Broadcast");
class CommandHandler {
    constructor(prefix) {
        const commandClasses = [
            Start_1.StartCommand,
            Invite_1.InviteCommand,
            Link_1.LinkCommand,
            Join_1.JoinCommand,
            Respawn_1.RespawnCommand,
            RepairChannels_1.RepairChannelsCommand,
            Broadcast_1.BroadcastCommand,
        ];
        this.commands = commandClasses.map((CommandClass) => new CommandClass());
        // this.commands.push(new HelpCommand(this.commands))
        this.prefix = prefix;
    }
    async handleMessage(message) {
        // ----- handle command -----
        if (message.author.bot ||
            !this.couldBeCommand(message)) {
            return;
        }
        // ignore DMs for now
        if (message.channel.type === `dm` || !message.guild) {
            return;
        }
        this.sideEffects(message);
        // initialize command context
        const commandContext = new CommandContext_1.CommandContext(message, this.prefix);
        // find matched commands
        const matchedCommands = this.commands.filter((command) => {
            if (command.commandNames.includes(commandContext.commandName))
                return true;
            if (command.ignorePrefixMatchTest &&
                command.ignorePrefixMatchTest(message))
                return true;
            return false;
        });
        // handle prefix but no valid command case
        if (!matchedCommands.length) {
            await message.reply(`I don't recognize that command. Try ${this.prefix}help.`);
            await reactor_1.reactor.failure(message);
            return;
        }
        // get ship data to determine which commands a user should be able to run.
        const ship = await ioInterface_1.default.ship.get(message.guild?.id || ``);
        commandContext.ship = ship;
        const crewMember = ship?.crewMembers.find((cm) => cm.id === message.author.id) || null;
        commandContext.crewMember = crewMember;
        for (let matchedCommand of matchedCommands) {
            // check run permissions and get error message if relevant
            const permissionRes = matchedCommand.hasPermissionToRun(commandContext);
            if (permissionRes !== true) {
                await message.channel.send(permissionRes);
                await reactor_1.reactor.failure(message);
                continue;
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
    }
    couldBeCommand(message) {
        if (message.content.startsWith(this.prefix))
            return true;
        if (message.channel instanceof discord_js_1.TextChannel &&
            message.channel.name.indexOf(`📣`) !== -1)
            return true;
        return false;
    }
    sideEffects(message) {
        // ----- set nickname -----
        if (message.guild?.me?.nickname !== `${dist_1.default.GAME_NAME}`)
            message.guild?.me?.setNickname(`${dist_1.default.GAME_NAME}`);
    }
}
exports.CommandHandler = CommandHandler;
//# sourceMappingURL=CommandHandler.js.map