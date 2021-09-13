"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StartCommand = void 0;
const dist_1 = __importDefault(require("../../../../common/dist"));
const ioInterface_1 = __importDefault(require("../../ioInterface"));
const waitForSingleButtonChoice_1 = __importDefault(require("../actions/waitForSingleButtonChoice"));
const checkPermissions_1 = __importDefault(require("../actions/checkPermissions"));
class StartCommand {
    commandNames = [`start`, `s`, `spawn`, `begin`, `init`];
    getHelpMessage(commandPrefix) {
        return `Use \`${commandPrefix}${this.commandNames[0]}\` to start your server off in the game.`;
    }
    async run(context) {
        if (!context.guild)
            return;
        const sentMessages = [];
        const permissionsOk = await (0, checkPermissions_1.default)({
            requiredPermissions: [`MANAGE_CHANNELS`],
            guild: context.guild,
        });
        dist_1.default.log(permissionsOk);
        const { result: permissionResult, sentMessage: pm } = await (0, waitForSingleButtonChoice_1.default)({
            context,
            content: `Welcome to **${dist_1.default.gameName}**!
This is a game about exploring the universe in a ship crewed by your server's members, going on adventures and overcoming challenges.
    
This bot will create several channels for game communication and a role for crew members. Is that okay with you?`,
            allowedUserId: context.initialMessage.author.id,
            buttons: [
                {
                    label: `Okay!`,
                    style: `PRIMARY`,
                    customId: `permissionToAddChannelsYes`,
                },
                {
                    label: `Nope.`,
                    style: `SECONDARY`,
                    customId: `permissionToAddChannelsNo`,
                },
            ],
        });
        pm.delete().catch((e) => { });
        if (!permissionResult ||
            permissionResult === `permissionToAddChannelsNo`) {
            await context.initialMessage.channel.send(`Ah, okay. This game might not be for you, then.`);
            return;
        }
        // // create role
        // const crewRole = await resolveOrCreateRole({
        //   type: `crew`,
        //   guild: context.guild,
        // })
        // if (!crewRole) {
        //   await context.initialMessage.channel.send(
        //     `I don't seem to be able to create roles in this server. Please add that permission to the bot!`,
        //   )
        //   return
        // }
        // context.guildMember?.roles.add(crewRole).catch(async (e) => {
        //   c.log(e)
        //   await context.initialMessage.channel.send(
        //     `I don't seem to be able to assign roles in this server. Please add that permission to the bot!`,
        //   )
        // })
        const speciesButtonData = [];
        for (let s of dist_1.default.shuffleArray(Object.entries(dist_1.default.species).filter((e) => {
            return e[1].factionId !== `red`;
        })))
            speciesButtonData.push({
                label: s[1].icon + dist_1.default.capitalize(s[1].id),
                style: `SECONDARY`,
                customId: s[1].id,
            });
        const { result: speciesResult, sentMessage: sm } = await (0, waitForSingleButtonChoice_1.default)({
            context,
            content: `Excellent! Choose your ship's species to get started.`,
            allowedUserId: context.initialMessage.author.id,
            buttons: speciesButtonData,
        });
        sentMessages.push(sm);
        // clean up messages
        try {
            for (let m of sentMessages)
                if (m.deletable)
                    m.delete().catch(dist_1.default.log);
        }
        catch (e) { }
        if (!speciesResult) {
            await context.initialMessage.channel.send(`You didn't pick a species, try again!`);
            return;
        }
        // add ship
        const createdShip = await ioInterface_1.default.ship.create({
            id: context.guild.id,
            name: context.guild.name,
            species: { id: speciesResult },
        });
        if (!createdShip) {
            await context.initialMessage.channel.send(`Failed to start your server in the game.`);
            return;
        }
        // add crew member
        const addedCrewMember = await ioInterface_1.default.crew.add(createdShip.id, {
            name: context.nickname,
            id: context.initialMessage.author.id,
        });
        if (!addedCrewMember) {
            await context.initialMessage.channel.send(`Failed to add you as a member of the crew.`);
        }
    }
    hasPermissionToRun(commandContext) {
        if (commandContext.dm)
            return `This command can only be invoked in a server.`;
        if (!commandContext.isCaptain &&
            !commandContext.isServerAdmin)
            return `Only the captain or a server admin may run this command.`;
        if (commandContext.ship)
            return `Your server already has a ship! It's called ${commandContext.ship.name}.`;
        return true;
    }
}
exports.StartCommand = StartCommand;
//# sourceMappingURL=Start.js.map