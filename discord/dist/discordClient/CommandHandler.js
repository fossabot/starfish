"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandHandler = void 0;
const dist_1 = __importDefault(require("../../../common/dist"));
const discord_js_1 = require("discord.js");
const CommandContext_1 = require("./models/CommandContext");
const ioInterface_1 = __importStar(require("../ioInterface"));
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
const ThrustInCurrentDirection_1 = require("./commands/ThrustInCurrentDirection");
const Brake_1 = require("./commands/Brake");
const Status_1 = require("./commands/Status");
const Repair_1 = require("./commands/Repair");
const Bunk_1 = require("./commands/Bunk");
const Weapons_1 = require("./commands/Weapons");
const Cockpit_1 = require("./commands/Cockpit");
const Buy_1 = require("./commands/Buy");
const Sell_1 = require("./commands/Sell");
class CommandHandler {
    commands;
    prefix;
    constructor(prefix) {
        const commandClasses = [
            Start_1.StartCommand,
            Join_1.JoinCommand,
            Invite_1.InviteCommand,
            Link_1.LinkCommand,
            Status_1.StatusCommand,
            Broadcast_1.BroadcastCommand,
            Go_1.GoCommand,
            ThrustInCurrentDirection_1.ThrustInCurrentDirectionCommand,
            Brake_1.BrakeCommand,
            Buy_1.BuyCommand,
            Sell_1.SellCommand,
            Repair_1.RepairCommand,
            Bunk_1.BunkCommand,
            Weapons_1.WeaponsCommand,
            Cockpit_1.CockpitCommand,
            Respawn_1.RespawnCommand,
            ShipName_1.ChangeShipNameCommand,
            AlertLevel_1.AlertLevelCommand,
            ChangeCaptain_1.ChangeCaptainCommand,
            KickMember_1.KickMemberCommand,
            RepairChannels_1.RepairChannelsCommand,
            LeaveGame_1.LeaveGameCommand,
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
            return;
        }
        // make sure we're connected to the io server
        if (!ioInterface_1.io.connected) {
            await commandContext.reply({
                embeds: [
                    new discord_js_1.MessageEmbed({
                        description: `It looks like the game server is down at the moment. Please check the [support server](${dist_1.default.supportServerLink}) for more details.`,
                    }),
                ],
            });
            return;
        }
        commandContext.matchedCommands = matchedCommands;
        // get ship data to determine which commands a user should be able to run.
        const ship = await ioInterface_1.default.ship.get(message.guild?.id || ``, message.author.id);
        commandContext.ship = ship;
        const crewMember = ship?.crewMembers?.find((cm) => cm.id === message.author.id) || null;
        commandContext.isCaptain =
            Boolean(crewMember) &&
                crewMember?.id === ship?.captain;
        commandContext.crewMember = crewMember;
        // side effects!
        this.sideEffects(commandContext);
        for (let matchedCommand of matchedCommands) {
            // check runnability and get error message if relevant
            let runnable;
            if (commandContext.dm && !matchedCommand.allowDm)
                runnable = `The \`${matchedCommand.commandNames[0]}\` can only be invoked in a server.`;
            // ship required and no ship
            if (!commandContext.ship &&
                matchedCommand.requiresShip)
                runnable = `Your server doesn't have a ship yet! Use \`${commandContext.commandPrefix}start\` to start your server off in the game.`;
            // crewMember required and no crewMember
            else if (!commandContext.crewMember &&
                matchedCommand.requiresCrewMember)
                runnable = `Only crew members can run the \`${commandContext.commandPrefix}${matchedCommand.commandNames[0]}\` command. Use \`${commandContext.commandPrefix}join\` to join the ship first.`;
            // planet-only command and no planet
            else if (!commandContext.ship?.planet &&
                matchedCommand.requiresPlanet)
                runnable = `Your ship must be on a planet to use the \`${commandContext.commandPrefix}${matchedCommand.commandNames[0]}\` command.`;
            // captain-only command and not captain or admin
            else if (matchedCommand.requiresCaptain &&
                !commandContext.isCaptain &&
                !commandContext.isServerAdmin &&
                !commandContext.isGameAdmin)
                runnable = `Only captain ${commandContext.ship.crewMembers?.find((cm) => cm.id === commandContext.ship?.captain)?.name} or a server admin can run the \`${commandContext.commandPrefix}${matchedCommand.commandNames[0]}\` command.`;
            // anything else command-specific
            else if (!matchedCommand.hasPermissionToRun)
                runnable = true;
            else
                runnable =
                    matchedCommand.hasPermissionToRun(commandContext);
            if (runnable !== true) {
                if (runnable.length)
                    await commandContext.reply(runnable);
                continue;
            }
            dist_1.default.log(`gray`, `${message.content} (${commandContext.nickname} on ${commandContext.ship?.name ||
                commandContext.guild?.name ||
                `PM`})`);
            // run command
            await matchedCommand
                .run(commandContext)
                .then(() => { })
                .catch((reason) => {
                dist_1.default.log(`red`, `Failed to run command ${commandContext.commandName}: ${reason}`);
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
        if (context.guild?.me?.nickname !== `${dist_1.default.gameName}`)
            context.guild?.me?.setNickname(`${dist_1.default.gameName}`);
        // ----- update guild name/icon if necessary -----
        if (context.ship && context.guild) {
            if (dist_1.default
                .sanitize(context.guild.name)
                .result.substring(0, dist_1.default.maxNameLength) !==
                context.ship.guildName ||
                context.guild.iconURL({ size: 128 }) !==
                    context.ship.guildIcon)
                ioInterface_1.default.ship.setGuildData(context.ship.id, {
                    guildName: dist_1.default
                        .sanitize(context.guild.name)
                        .result.substring(0, dist_1.default.maxNameLength) ||
                        `guild`,
                    guildIcon: context.guild.iconURL({ size: 128 }) ||
                        undefined,
                });
        }
        // ----- check for crew member still in guild, and update name if necessary -----
        if (context.crewMember) {
            const guildMember = context.guild?.members.cache.find((m) => m.user.id === context.crewMember?.id);
            if (guildMember &&
                context.ship &&
                context.nickname !== context.crewMember.name) {
                dist_1.default.log(`gray`, `Auto-renaming crew member with different name:`, context.crewMember.name, `to`, context.nickname);
                ioInterface_1.default.crew.rename(context.ship.id, context.crewMember.id, context.nickname);
            }
        }
    }
}
exports.CommandHandler = CommandHandler;
//# sourceMappingURL=CommandHandler.js.map