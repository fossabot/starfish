"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllConstructible = exports.removeFromDb = exports.wipe = exports.addOrUpdateInDb = void 0;
const mongoose_1 = require("mongoose");
const dist_1 = __importDefault(require("../../../../common/dist"));
const zoneSchemaFields = {
    id: { type: String, required: true },
    name: { type: String },
    radius: { type: Number },
    color: { type: String },
    location: [{ type: Number, required: true }],
    passives: [
        {
            id: String,
            intensity: Number,
            data: mongoose_1.Schema.Types.Mixed,
        },
    ],
    effects: [
        {
            type: { type: String },
            intensity: Number,
            basedOnProximity: Boolean,
            dodgeable: Boolean,
            procChancePerTick: Number,
        },
    ],
};
const zoneSchema = new mongoose_1.Schema(zoneSchemaFields);
const DBZone = (0, mongoose_1.model)(`DBZone`, zoneSchema);
async function addOrUpdateInDb(data) {
    const toSave = new DBZone(data)._doc;
    delete toSave._id;
    const dbObject = await DBZone.findOneAndUpdate({ id: data.id }, toSave, {
        upsert: true,
        new: true,
        lean: true,
        setDefaultsOnInsert: true,
    });
    return dbObject;
}
exports.addOrUpdateInDb = addOrUpdateInDb;
async function wipe() {
    const res = await DBZone.deleteMany({});
    dist_1.default.log(`Wiped zone DB`, res);
}
exports.wipe = wipe;
async function removeFromDb(id) {
    const res = await DBZone.deleteMany({ id });
}
exports.removeFromDb = removeFromDb;
async function getAllConstructible() {
    const docs = (await DBZone.find({})).map((z) => z.toObject());
    return docs;
}
exports.getAllConstructible = getAllConstructible;
//# sourceMappingURL=zone.js.map