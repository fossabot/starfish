"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
import discordBotId from '/run/secrets/bot_id'
// const discordBotId = `723017262369472603`;
const discordBotPermissionsString = `335670352`;
const frontendUrl = `http://localhost:4300`;
const discordBotInviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${discordBotId}&permissions=${discordBotPermissionsString}&scope=bot`;
exports.default = {
    discordBotId,
    discordBotPermissionsString,
    frontendUrl,
    discordBotInviteUrl,
};
//# sourceMappingURL=discord.js.map