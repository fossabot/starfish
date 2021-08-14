"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StartCommand = void 0;
const dist_1 = __importDefault(require("../../../../common/dist"));
const ioInterface_1 = __importDefault(require("../../ioInterface"));
const resolveOrCreateRole_1 = __importDefault(require("../actions/resolveOrCreateRole"));
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
        const rows = [];
        for (let s of dist_1.default.shuffleArray(Object.entries(dist_1.default.species).filter((e) => {
            return e[1].factionId !== `red`;
        }))) {
            if (!rows.length ||
                rows[rows.length - 1].components.length >= 4)
                rows.push(new discord_buttons_1.MessageActionRow());
            let row = rows[rows.length - 1];
            row.addComponent(new discord_buttons_1.MessageButton()
                .setLabel(s[1].icon + dist_1.default.capitalize(s[1].id))
                .setStyle(2)
                .setID(s[1].id));
        }
        const sentMessage = await context.initialMessage.channel.send(`Welcome to **${dist_1.default.gameName}**!
This is a game about exploring the universe in a ship crewed by your server's members, going on adventures and overcoming challenges.

Choose your ship's species to get started!`, {
            // @ts-ignore
            components: rows,
        });
        const speciesKey = await new Promise((resolve) => {
            let done = false;
            const filter = (button) => button.clicker.user.id ===
                context.initialMessage.author.id;
            // @ts-ignore
            const collector = sentMessage.createButtonCollector(filter, {
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
        // clean up buttons
        try {
            if (sentMessage.deletable)
                sentMessage.delete().catch(dist_1.default.log);
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
        const addedCrewMember = await ioInterface_1.default.crew.add(createdShip.id, {
            name: context.nickname,
            id: context.initialMessage.author.id,
        });
        const crewRole = await resolveOrCreateRole_1.default({
            type: `crew`,
            guild: context.guild,
        });
        if (!crewRole) {
            await context.initialMessage.channel.send(`Failed to add you to the \`Crew\` server role.`);
        }
        else {
            context.guildMember?.roles
                .add(crewRole)
                .catch(() => { });
        }
        // add crew member
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