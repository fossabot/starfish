"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.alertLevel = exports.broadcast = exports.respawn = exports.create = exports.get = exports.rename = exports.kickMember = exports.setCaptain = void 0;
const dist_1 = __importDefault(require("../../../common/dist"));
const index_1 = require("./index");
async function setCaptain(shipId, crewMemberId) {
    const error = await new Promise((resolve) => {
        index_1.io.emit(`ship:setCaptain`, shipId, crewMemberId, ({ data, error }) => {
            if (error) {
                dist_1.default.log(error);
                resolve(error);
                return;
            }
            resolve(null);
        });
    });
    return error; // null = ok
}
exports.setCaptain = setCaptain;
async function kickMember(shipId, crewMemberId) {
    const error = await new Promise((resolve) => {
        index_1.io.emit(`ship:kickMember`, shipId, crewMemberId, ({ data, error }) => {
            if (error) {
                dist_1.default.log(error);
                resolve(error);
                return;
            }
            resolve(null);
        });
    });
    return error; // null = ok
}
exports.kickMember = kickMember;
async function rename(shipId, newName) {
    await index_1.io.emit(`ship:rename`, shipId, newName);
}
exports.rename = rename;
async function get(id) {
    if (!(await index_1.connected()))
        return null;
    const shipStub = await new Promise((resolve) => {
        index_1.io.emit(`ship:get`, id, ({ data: ship, error, }) => {
            if (!ship || error) {
                dist_1.default.log(error);
                resolve(null);
                return;
            }
            resolve(ship);
        });
    });
    return shipStub;
}
exports.get = get;
async function create(data) {
    if (!(await index_1.connected()))
        return null;
    const shipStub = await new Promise((resolve) => {
        index_1.io.emit(`ship:create`, data, ({ data: ship, error, }) => {
            if (!ship || error) {
                dist_1.default.log(error);
                resolve(null);
                return;
            }
            resolve(ship);
        });
    });
    return shipStub;
}
exports.create = create;
async function respawn(id) {
    if (!(await index_1.connected()))
        return null;
    const shipStub = await new Promise((resolve) => {
        index_1.io.emit(`ship:respawn`, id, ({ data: ship, error, }) => {
            if (!ship || error) {
                dist_1.default.log(error);
                resolve(null);
                return;
            }
            resolve(ship);
        });
    });
    return shipStub;
}
exports.respawn = respawn;
async function broadcast(guildId, crewMemberId, message) {
    if (!(await index_1.connected()))
        return { error: `` };
    const result = await new Promise((resolve) => {
        index_1.io.emit(`ship:broadcast`, guildId, crewMemberId, message, (res) => {
            resolve(res);
        });
    });
    return result;
}
exports.broadcast = broadcast;
async function alertLevel(guildId, level) {
    if (!(await index_1.connected()))
        return { error: `` };
    const result = await new Promise((resolve) => {
        index_1.io.emit(`ship:alertLevel`, guildId, level, (res) => {
            resolve(res);
        });
    });
    return result;
}
exports.alertLevel = alertLevel;
//# sourceMappingURL=ship.js.map