"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import { DBAttackRemnant } from './models/attackRemnant'
// we can do some powerful stuff like validation here, check
// https://mongoosejs.com/docs/schematypes.html
// const schemas = {
//   guild: mongoose.Schema(
//     {
//       _id: { type: String },
//       active: { type: Boolean, default: true },
//       roles: [{ id: String, roleType: String }],
//       channels: [{ id: String, channelType: String }],
//       messages: [
//         {
//           id: String,
//           messageType: String,
//           channelType: String,
//         },
//       ],
//       created: { type: Number, default: Date.now() },
//       faction: { color: String },
//       members: [{ userId: String, crewMemberId: String }],
//       name: String,
//       settings: { prefix: { type: String, default: `.` } },
//       shipIds: [String],
//     },
//     {
//       toObject: { virtuals: true },
//       toJSON: { virtuals: true },
//     },
//   ),
//   ship: mongoose.Schema(
//     {
//       _id: { type: String },
//       guildId: String,
//       velocity: [Number],
//       captain: String,
//       cargo: [{ cargoType: String, amount: Number }],
//       credits: { type: Number, default: 0 },
//       equipment: [
//         {
//           equipmentType: String,
//           list: [
//             {
//               id: String,
//               repair: Number,
//               repaired: Number,
//             },
//           ],
//         },
//       ],
//       launched: { type: Number, default: Date.now() },
//       location: [{ type: Number, default: 0 }],
//       pastLocations: [[Number]],
//       name: String,
//       power: Number,
//       seen: { planets: [String] },
//       status: {
//         dead: Boolean,
//         docked: String,
//       },
//     },
//     {
//       toObject: { virtuals: true },
//       toJSON: { virtuals: true },
//     },
//   ),
//   user: mongoose.Schema(
//     {
//       _id: { type: String },
//       activeGuild: String,
//       memberships: [
//         { guildId: String, crewMemberId: String },
//       ],
//     },
//     {
//       toObject: { virtuals: true },
//       toJSON: { virtuals: true },
//     },
//   ),
//   crewMember: mongoose.Schema(
//     {
//       _id: { type: String },
//       userId: String,
//       guildId: String,
//       joined: { type: Number, default: Date.now() },
//       stamina: Number,
//       level: [{ skill: String, level: Number }],
//       xp: [{ skill: String, xp: Number }],
//     },
//     {
//       toObject: { virtuals: true },
//       toJSON: { virtuals: true },
//     },
//   ),
//   cache: mongoose.Schema(
//     {
//       _id: { type: String },
//       amount: Number,
//       created: Number,
//       location: Array,
//       type: String,
//     },
//     {
//       toObject: { virtuals: true },
//       toJSON: { virtuals: true },
//     },
//   ),
//   attackRemnant: mongoose.Schema(
//     {
//       _id: { type: String },
//       time: { type: Number, default: Date.now() },
//       attacker: {
//         name: String,
//         shipId: String,
//         location: [Number],
//       },
//       weaponId: String,
//       didHit: Boolean,
//       damage: Number,
//       destroyedShip: Boolean,
//       defender: {
//         name: String,
//         shipId: String,
//         location: [Number],
//       },
//     },
//     {
//       toObject: { virtuals: true },
//       toJSON: { virtuals: true },
//     },
//   ),
//   planet: mongoose.Schema(
//     { _id: { type: String }, name: String },
//     {
//       toObject: { virtuals: true },
//       toJSON: { virtuals: true },
//     },
//   ),
// }
// object.values(schemas).forEach((s) =>
//   s
//     .virtual(`id`)
//     .get(function () {
//       return `${this._id}`
//     })
//     .set(function (id) {
//       this._id = `${id}`
//     }),
// )
// const models = {}
// object.keys(schemas).forEach((schemaName) => {
//   models[schemaName] = mongoose.model(
//     schemaName,
//     schemas[schemaName],
//   )
// })
// module.exports = models
//# sourceMappingURL=models.js.map