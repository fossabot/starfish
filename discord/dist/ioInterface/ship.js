"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = exports.get = void 0;
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
// export async function thrust(
//   data: ThrustRequest,
// ): Promise<ThrustResult | null> {
//   if (!(await connected())) return null
//   const res: ThrustResult | null = await new Promise(
//     (resolve) => {
//       io.emit(
//         `ship:thrust`,
//         data,
//         ({
//           data: thrustResult,
//           error,
//         }: IOResponseReceived<ThrustResult>) => {
//           if (!thrustResult || error) {
//             c.log(error)
//             resolve(null)
//             return
//           }
//           resolve(thrustResult)
//         },
//       )
//     },
//   )
//   return res
// }
// export async function attack(
//   data: AttackRequest,
// ): Promise<TakenDamageResult | null> {
//   if (!(await connected())) return null
//   const res: TakenDamageResult | null = await new Promise(
//     (resolve) => {
//       io.emit(
//         `ship:attack`,
//         data,
//         ({
//           data: attackResult,
//           error,
//         }: IOResponseReceived<TakenDamageResult>) => {
//           if (!attackResult || error) {
//             c.log(error)
//             resolve(null)
//             return
//           }
//           resolve(attackResult)
//         },
//       )
//     },
//   )
//   return res
// }
//# sourceMappingURL=ship.js.map