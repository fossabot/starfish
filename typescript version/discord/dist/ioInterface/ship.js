"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.attack = exports.thrust = exports.create = exports.get = void 0;
const dist_1 = __importDefault(require("../../../common/dist"));
const index_1 = require("./index");
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
async function thrust(data) {
    if (!(await index_1.connected()))
        return null;
    const res = await new Promise((resolve) => {
        index_1.io.emit(`ship:thrust`, data, ({ data: thrustResult, error, }) => {
            if (!thrustResult || error) {
                dist_1.default.log(error);
                resolve(null);
                return;
            }
            resolve(thrustResult);
        });
    });
    return res;
}
exports.thrust = thrust;
async function attack(data) {
    if (!(await index_1.connected()))
        return null;
    const res = await new Promise((resolve) => {
        index_1.io.emit(`ship:attack`, data, ({ data: attackResult, error, }) => {
            if (!attackResult || error) {
                dist_1.default.log(error);
                resolve(null);
                return;
            }
            resolve(attackResult);
        });
    });
    return res;
}
exports.attack = attack;
//# sourceMappingURL=ship.js.map