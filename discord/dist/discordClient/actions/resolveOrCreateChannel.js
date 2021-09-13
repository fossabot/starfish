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
const checkPermissions_1 = __importDefault(require("./checkPermissions"));
const GameChannel_1 = require("../models/GameChannel");
const channelData = {
    alert: {
        name: `🚀Alerts`,
        topic: `Automated ship alerts. Go to ${dist_1.default.frontendUrl} to take action!`,
        permissions: [],
    },
    chat: {
        name: `🛠Main Deck`,
        topic: `For full-crew discussions.`,
    },
    broadcast: {
        name: `📣Comms Bay`,
        topic: `Area chatter and received broadcasts come here. Send messages here to broadcast them within your interaction range.`,
    },
};
async function resolveOrCreateChannel({ type, guild, }) {
    const { name, topic, permissions } = channelData[type];
    const permissionsRes = await (0, checkPermissions_1.default)({
        requiredPermissions: [`MANAGE_CHANNELS`],
        guild,
    });
    if (`error` in permissionsRes) {
        dist_1.default.log(permissionsRes);
        return null;
    }
    if (permissionsRes.message)
        dist_1.default.log(permissionsRes.message);
    const existingChannels = [
        ...(await guild.channels.cache).values(),
    ];
    let existingSubChannels = [];
    let parentCategory = null;
    // ----- get/make category -----
    const existingCategory = existingChannels.find((ch) => ch instanceof Discord.CategoryChannel &&
        ch.name === dist_1.default.gameName);
    if (existingCategory) {
        parentCategory = existingCategory;
        existingSubChannels = existingChannels.filter((c) => c instanceof Discord.TextChannel &&
            c.parentId === existingCategory.id);
    }
    else {
        const createdCategory = await guild.channels
            .create(dist_1.default.gameName, {
            type: `GUILD_CATEGORY`,
            position: 99999,
            reason: `Game initialization`,
        })
            .catch(dist_1.default.log);
        if (createdCategory)
            parentCategory = createdCategory;
        dist_1.default.log(`Created category channel for ${guild.name}.`);
    }
    if (!parentCategory)
        return null;
    // ----- get/make channel -----
    const existing = existingSubChannels.find((c) => c.name === name.toLowerCase().replace(/\s/g, `-`));
    if (existing)
        return new GameChannel_1.GameChannel(guild, existing);
    const channel = (await guild.channels
        .create(name, {
        reason: `Game initialization`,
        parent: parentCategory,
        topic,
        permissionOverwrites: permissions,
    })
        .catch(dist_1.default.log)) || null;
    dist_1.default.log(`Created channel ${name} for ${guild.name}.`);
    if (channel === null)
        return null;
    return new GameChannel_1.GameChannel(guild, channel);
}
exports.default = resolveOrCreateChannel;
//# sourceMappingURL=resolveOrCreateChannel.js.map