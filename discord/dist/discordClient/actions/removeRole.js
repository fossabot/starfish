"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dist_1 = __importDefault(require("../../../../common/dist"));
const checkPermissions_1 = __importDefault(require("./checkPermissions"));
async function removeRole(guild, roleName = `Crew`) {
    const permissionsRes = await (0, checkPermissions_1.default)({
        requiredPermissions: [`MANAGE_ROLES`],
        guild,
    });
    if (`error` in permissionsRes) {
        dist_1.default.log(permissionsRes);
        return false;
    }
    if (permissionsRes.message)
        dist_1.default.log(permissionsRes.message);
    const existingRoles = [
        ...(await guild.roles.cache).values(),
    ];
    const existing = existingRoles.find((c) => c.name === roleName);
    if (existing) {
        dist_1.default.log(`removing role...`);
        existing.delete().catch(dist_1.default.log);
        return true;
    }
    return false;
}
exports.default = removeRole;
//# sourceMappingURL=removeRole.js.map