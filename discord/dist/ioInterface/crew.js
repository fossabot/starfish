"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.add = void 0;
const dist_1 = __importDefault(require("../../../common/dist"));
const index_1 = require("./index");
async function add(shipId, data) {
    if (!(await index_1.connected()))
        return null;
    const crewMemberStub = await new Promise((resolve) => {
        index_1.io.emit('crew:add', shipId, data, ({ data: crewMember, error, }) => {
            if (!crewMember || error) {
                dist_1.default.log(error);
                resolve(null);
                return;
            }
            resolve(crewMember);
        });
    });
    return crewMemberStub;
}
exports.add = add;
//# sourceMappingURL=crew.js.map