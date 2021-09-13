"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StartCommand = void 0;
const dist_1 = __importDefault(require("../../../../common/dist"));
const ioInterface_1 = __importDefault(require("../../ioInterface"));
const discord_buttons_1 = require("discord-buttons");
class StartCommand {
    constructor() {
        this.commandNames = [`start`, `s`, `spawn`, `begin`, `init`];
    }
    getHelpMessage(commandPrefix) {
        return `Use \`${commandPrefix}${this.commandNames[0]}\` to start your server off in the game.`;
    }
    async run(context) {
        if (!context.guild)
            return;
        const sentMessages = [];
        const permissionToAddChannelsRow = new discord_buttons_1.MessageActionRow();
        permissionToAddChannelsRow.addComponent(new discord_buttons_1.MessageButton()
            .setLabel(`Okay!`)
            .setStyle(1)
            .setID(`permissionToAddChannelsYes`));
        permissionToAddChannelsRow.addComponent(new discord_buttons_1.MessageButton()
            .setLabel(`Nope.`)
            .setStyle(2)
            .setID(`permissionToAddChannelsNo`));
        const pm = await context.initialMessage.channel.send(`Welcome to **${dist_1.default.gameName}**!
This is a game about exploring the universe in a ship crewed by your server's members, going on adventures and overcoming challenges.

This bot will create several channels for game communication and a role for crew members. Is that okay with you?`, {
            // @ts-ignore
            components: [permissionToAddChannelsRow],
        });
        if (pm && Array.isArray(pm))
            sentMessages.push(...pm);
        else if (pm)
            sentMessages.push(pm);
        const permissionResult = await new Promise((resolve) => {
            let done = false;
            const filter = (button) => button.clicker.user.id ===
                context.initialMessage.author.id;
            // @ts-ignore
            const collector = pm.createButtonCollector(filter, {
                time: 5 * 60 * 1000,
            });
            collector.on?.(`collect`, (b) => {
                done = true;
                b.defer();
                resolve(b.id);
            });
            collector.on?.(`end`, () => {
                if (done)
                    return;
                resolve(null);
            });
        });
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
        const speciesRows = [];
        for (let s of dist_1.default.shuffleArray(Object.entries(dist_1.default.species).filter((e) => {
            return e[1].factionId !== `red`;
        }))) {
            if (!speciesRows.length ||
                speciesRows[speciesRows.length - 1].components
                    .length >= 4)
                speciesRows.push(new discord_buttons_1.MessageActionRow());
            let row = speciesRows[speciesRows.length - 1];
            row.addComponent(new discord_buttons_1.MessageButton()
                .setLabel(s[1].icon + dist_1.default.capitalize(s[1].id))
                .setStyle(2)
                .setID(s[1].id));
        }
        const sm = await context.initialMessage.channel.send(`Excellent! Choose your ship's species to get started.`, {
            // @ts-ignore
            components: speciesRows,
        });
        if (sm && Array.isArray(sm))
            sentMessages.push(...sm);
        else if (sm)
            sentMessages.push(sm);
        const speciesKey = await new Promise((resolve) => {
            let done = false;
            const filter = (button) => button.clicker.user.id ===
                context.initialMessage.author.id;
            // @ts-ignore
            const collector = sm.createButtonCollector(filter, {
                time: 5 * 60 * 1000,
            });
            collector.on?.(`collect`, (b) => {
                done = true;
                b.defer();
                resolve(b.id);
            });
            collector.on?.(`end`, () => {
                if (done)
                    return;
                resolve(null);
            });
        });
        // clean up messages
        try {
            for (let m of sentMessages)
                if (m.deletable)
                    m.delete().catch(dist_1.default.log);
        }
        catch (e) { }
        if (!speciesKey) {
            await context.initialMessage.channel.send(`You didn't pick a species, try again!`);
            return;
        }
        // add ship
        const createdShip = await ioInterface_1.default.ship.create({
            id: context.guild.id,
            name: context.guild.name,
            species: { id: speciesKey },
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