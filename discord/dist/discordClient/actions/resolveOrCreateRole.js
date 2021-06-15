"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dist_1 = __importDefault(require("../../../../common/dist"));
const checkPermissions_1 = __importDefault(require("./checkPermissions"));
const roleData = {
    crew: {
        name: `Crew`,
    },
};
async function resolveOrCreateRole({ type, guild, }) {
    const { name } = roleData[type];
    const permissionsRes = await checkPermissions_1.default({
        requiredPermissions: [`MANAGE_ROLES`],
        guild,
    });
    if (`error` in permissionsRes) {
        dist_1.default.log(permissionsRes);
        return null;
    }
    if (permissionsRes.message)
        dist_1.default.log(permissionsRes.message);
    const existingRoles = await guild.roles.cache.array();
    // ----- get/make role -----
    const existing = existingRoles.find((c) => c.name === name);
    if (existing) {
        // c.log(`found existing role...`)
        return existing;
    }
    try {
        // c.log(`attempting to create role...`)
        const role = (await guild.roles
            .create({
            data: {
                name,
                hoist: false,
                mentionable: true,
                position: 99999,
            },
            reason: `Game initialization`,
        })
            .catch(dist_1.default.log)) || null;
        dist_1.default.log(`Created role ${name} for ${guild.name}.`);
        return role;
    }
    catch (e) {
        dist_1.default.log(`red`, `failed to create role:`, e);
        return null;
    }
}
exports.default = resolveOrCreateRole;
//# sourceMappingURL=resolveOrCreateRole.js.map