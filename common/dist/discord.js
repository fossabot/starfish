"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discordBotId = `804439178636558396`; // dev is `723017262369472603`
const discordBotPermissionsString = `277361060944`; // 335670352 previously (before slash commands)
const frontendUrl = `https://www.starfish.cool/s`;
const discordBotInviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${discordBotId}&permissions=${discordBotPermissionsString}&scope=applications.commands%20bot`;
exports.default = {
    discordBotId,
    discordBotPermissionsString,
    frontendUrl,
    discordBotInviteUrl,
};
//# sourceMappingURL=discord.js.map