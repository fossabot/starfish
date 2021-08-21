"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discordBotId = process.env.NODE_ENV === `development`
    ? `723017262369472603`
    : `804439178636558396`;
const discordBotPermissionsString = `335670352`;
const frontendUrl = `http://0.0.0.0:4300`;
const discordBotInviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${discordBotId}&permissions=${discordBotPermissionsString}&scope=bot`;
exports.default = {
    discordBotId,
    discordBotPermissionsString,
    frontendUrl,
    discordBotInviteUrl,
};
//# sourceMappingURL=discord.js.map