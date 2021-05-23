"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
async function checkPermissions({ requiredPermissions, channel, guild, guildId, }) {
    if (!__1.client || !__1.client.readyAt)
        return { error: `Client not ready` };
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
    if (channel && channel.type !== `text`)
        return { error: `Wrong channel type: ${channel.type}` };
    const useBasePermissions = !channel;
    // -------------- get permissions
    let permissionsToCheck;
    const botRole = (await guild.roles.fetch()).cache
        .array()
        .find((role) => role.name === __1.client.user?.username);
    permissionsToCheck = botRole?.permissions;
    if (!useBasePermissions && channel && guild.me) {
        permissionsToCheck = channel.permissionsFor(guild.me);
    }
    if (!permissionsToCheck)
        return { error: `Failed to find bot permissions` };
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
        usedBasePermissions: useBasePermissions,
    };
}
exports.default = checkPermissions;
//# sourceMappingURL=checkPermissions.js.map