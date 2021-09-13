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
const dist_1 = __importDefault(require("../../../../common/dist"));
const Discord = __importStar(require("discord.js"));
const __1 = require("..");
async function checkPermissions({ requiredPermissions, channel, guild, guildId, }) {
    if (!__1.client || !__1.client.readyAt)
        return { error: `Client not ready` };
    if (channel instanceof Discord.DMChannel)
        return { ok: true };
    // -------------- get Discord guild and channel objects
    if (channel)
        guild = channel.guild;
    if (!guild && guildId)
        guild = await __1.client.guilds.fetch(guildId);
    if (!guild)
        return { error: `No guild found` };
    // if (channel || channelId) {
    //   // re-fetch so that we have overwrites
    //   channel = ((await guild.channels.fetch()) || []).find(
    //     (c) => c.id === channel?.id || channelId,
    //   )
    //   if (!channel)
    //     return { error: `No channel found by id ${channelId}` }
    //   if (channel.type !== `text`)
    //     return { error: `Wrong channel type: ${channel.type}` }
    // }
    const useBasePermissions = !channel;
    // -------------- get permissions
    let permissionsToCheck;
    const allRoles = await guild.roles.fetch().catch((e) => {
        dist_1.default.log(`Error getting bot permissions:`, e);
    });
    const botRole = allRoles
        ? [...allRoles.values()].find((role) => role.name === __1.client.user?.username)
        : null;
    permissionsToCheck = botRole?.permissions;
    if (!useBasePermissions && channel && guild.me) {
        permissionsToCheck = channel.permissionsFor(guild.me);
    }
    if (!permissionsToCheck) {
        dist_1.default.log({
            error: `Failed to find any permissions to check!`,
            botRole,
            channel,
            me: guild.me,
        });
        return {
            error: `Failed to find any permissions to check!`,
        };
    }
    // c.log(permissionsToCheck.toArray())
    // -------------- check permissions
    const missingPermissions = [];
    for (let p of requiredPermissions)
        if (!permissionsToCheck.has(p))
            missingPermissions.push(p);
    // -------------- ok
    if (!missingPermissions.length)
        return { ok: true };
    // -------------- not ok
    return {
        error: `Missing ${useBasePermissions ? `overall ` : ``}bot permissions \`${missingPermissions.join(`\`, \``)}\`${useBasePermissions
            ? ``
            : ` in channel \`${channel?.name}\``}`,
        missingPermissions,
        usedChannelSpecificPermissions: !useBasePermissions,
    };
}
exports.default = checkPermissions;
//# sourceMappingURL=checkPermissions.js.map