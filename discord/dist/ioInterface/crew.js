"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.move = exports.rename = exports.add = void 0;
const dist_1 = __importDefault(require("../../../common/dist"));
const index_1 = require("./index");
async function add(shipId, data) {
    if (!(await (0, index_1.connected)()))
        return `Failed to add crew member`;
    const crewMemberStub = await new Promise((resolve) => {
        index_1.io.emit(`crew:add`, shipId, data, ({ data: crewMember, error, }) => {
            if (!crewMember || error) {
                dist_1.default.log(error);
                resolve(error);
                return;
            }
            resolve(crewMember);
        });
    });
    return crewMemberStub || `Failed to add crew member.`;
}
exports.add = add;
async function rename(shipId, crewId, name) {
    if (!(await (0, index_1.connected)()))
        return `Failed to rename crew member`;
    index_1.io.emit(`crew:rename`, shipId, crewId, name);
}
exports.rename = rename;
async function move(shipId, crewId, target) {
    if (!(await (0, index_1.connected)()))
        return `Failed to move crew member`;
    index_1.io.emit(`crew:move`, shipId, crewId, target);
}
exports.move = move;
//# sourceMappingURL=crew.js.map