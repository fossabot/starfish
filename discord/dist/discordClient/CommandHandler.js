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
const AlertLevel_1 = require("./commands/AlertLevel");
const ChangeCaptain_1 = require("./commands/ChangeCaptain");
const Help_1 = require("./commands/Help");
const KickMember_1 = require("./commands/KickMember");
const LeaveGame_1 = require("./commands/LeaveGame");
const Go_1 = require("./commands/Go");
const ShipName_1 = require("./commands/ShipName");
class CommandHandler {
    commands;
    prefix;
    constructor(prefix) {
        const commandClasses = [
            Start_1.StartCommand,
            LeaveGame_1.LeaveGameCommand,
            Invite_1.InviteCommand,
            Link_1.LinkCommand,
            Join_1.JoinCommand,
            Respawn_1.RespawnCommand,
            RepairChannels_1.RepairChannelsCommand,
            Broadcast_1.BroadcastCommand,
            AlertLevel_1.AlertLevelCommand,
            ChangeCaptain_1.ChangeCaptainCommand,
            KickMember_1.KickMemberCommand,
            Go_1.GoCommand,
            ShipName_1.ChangeShipNameCommand,
        ];
        this.commands = commandClasses.map((CommandClass) => new CommandClass());
        this.commands.push(new Help_1.HelpCommand(this.commands));
        this.prefix = prefix;
    }
    async handleMessage(message) {
        // ----- handle command -----
        if (message.author.bot ||
            !this.couldBeCommand(message)) {
            return;
        }
        // ignore DMs for now
        if (message.channel.type === `DM` || !message.guild) {
            return;
        }
        // initialize command context
        const commandContext = new CommandContext_1.CommandContext(message, this.prefix);
        // find matched commands
        const matchedCommands = this.commands.filter((command) => {
            if (commandContext.correctPrefix &&
                command.commandNames.includes(commandContext.commandName))
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
        commandContext.matchedCommands = matchedCommands;
        // get ship data to determine which commands a user should be able to run.
        const ship = await ioInterface_1.default.ship.get(message.guild?.id || ``);
        commandContext.ship = ship;
        const crewMember = ship?.crewMembers?.find((cm) => cm.id === message.author.id) || null;
        commandContext.isCaptain =
            Boolean(crewMember) &&
                crewMember?.id === ship?.captain;
        commandContext.crewMember = crewMember;
        // side effects!
        this.sideEffects(commandContext);
        for (let matchedCommand of matchedCommands) {
            // check run permissions and get error message if relevant
            const permissionRes = matchedCommand.hasPermissionToRun(commandContext);
            if (permissionRes !== true) {
                if (permissionRes.length) {
                    await message.channel.send(permissionRes);
                    await reactor_1.reactor.failure(message);
                }
                continue;
            }
            dist_1.default.log(`gray`, message.content);
            // run command
            await matchedCommand
                .run(commandContext)
                .then(() => {
                // reactor.success(message)
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
    sideEffects(context) {
        // ----- set nickname -----
        if (context.initialMessage.guild?.me?.nickname !==
            `${dist_1.default.gameName}`)
            context.initialMessage.guild?.me?.setNickname(`${dist_1.default.gameName}`);
        // * removed because it would reset ship names willy-nilly, and they can set it manually
        // // ----- update guild name if necessary -----
        // if (context.ship && context.guild) {
        //   if (
        //     c
        //       .sanitize(context.guild.name)
        //       .result.substring(0, c.maxNameLength) !==
        //     context.ship.name
        //   )
        //     ioInterface.ship.rename(
        //       context.ship.id,
        //       context.guild.name,
        //     )
        // }
        // ----- check for crew member still in guild, and update name if necessary -----
        if (context.crewMember) {
            const guildMember = context.initialMessage.guild?.members.cache.find((m) => m.user.id === context.crewMember?.id);
            if (!guildMember) {
                dist_1.default.log(`NO GUILD MEMBER BY THAT NAME`);
            }
            else if (context.ship &&
                context.nickname !== context.crewMember.name) {
                ioInterface_1.default.crew.rename(context.ship.id, context.crewMember.id, context.nickname);
            }
        }
    }
}
exports.CommandHandler = CommandHandler;
//# sourceMappingURL=CommandHandler.js.map