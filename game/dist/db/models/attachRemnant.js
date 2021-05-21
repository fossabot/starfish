"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllConstructible = exports.removeFromDb = exports.addOrUpdateInDb = void 0;
const mongoose_1 = require("mongoose");
const dist_1 = __importDefault(require("../../../../common/dist"));
const cacheSchemaFields = {
    id: { type: String, required: true },
    ownerId: { type: String, required: true },
    time: { type: Number, default: Date.now() },
    location: [{ type: Number, required: true }],
    message: { type: String, default: `` },
    contents: [{ type: { type: String }, amount: Number }],
};
const cacheSchema = new mongoose_1.Schema(cacheSchemaFields);
const DBCache = mongoose_1.model(`DBCache`, cacheSchema);
async function addOrUpdateInDb(data) {
    const toSave = new DBCache(data)._doc;
    delete toSave._id;
    const dbObject = await DBCache.findOneAndUpdate({ id: data.id }, toSave, {
        upsert: true,
        new: true,
        lean: true,
        setDefaultsOnInsert: true,
    });
    return dbObject;
}
exports.addOrUpdateInDb = addOrUpdateInDb;
async function removeFromDb(id) {
    const res = await DBCache.deleteOne({ id });
    dist_1.default.log(`Deleted cache`, id, res);
}
exports.removeFromDb = removeFromDb;
async function getAllConstructible() {
    const docs = await DBCache.find({});
    return docs;
}
exports.getAllConstructible = getAllConstructible;
//# sourceMappingURL=attachRemnant.js.map