"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllConstructible = exports.wipe = exports.removeFromDb = exports.addOrUpdateInDb = void 0;
const mongoose_1 = require("mongoose");
const dist_1 = __importDefault(require("../../../../common/dist"));
const planetSchemaFields = {
    location: [{ type: Number, required: true }],
    color: String,
    name: { type: String, required: true },
    radius: Number,
    factionId: String,
    creatures: [String],
    homeworld: { id: String },
    repairCostMultiplier: Number,
    allegiances: [{ faction: { id: String }, level: Number }],
    vendor: {
        cargo: [
            {
                cargoType: String,
                buyMultiplier: Number,
                sellMultiplier: Number,
            },
        ],
        chassis: [
            {
                chassisType: String,
                buyMultiplier: Number,
                sellMultiplier: Number,
            },
        ],
        items: [
            {
                itemType: String,
                itemId: String,
                buyMultiplier: Number,
                sellMultiplier: Number,
            },
        ],
        actives: [
            {
                activeType: String,
                buyMultiplier: Number,
                sellMultiplier: Number,
            },
        ],
        passives: [
            { passiveType: String, buyMultiplier: Number },
        ],
    },
};
const planetSchema = new mongoose_1.Schema(planetSchemaFields);
const DBPlanet = mongoose_1.model(`DBPlanet`, planetSchema);
async function addOrUpdateInDb(data) {
    const stub = dist_1.default.stubify(data);
    const toSave = new DBPlanet(stub)._doc;
    delete toSave._id;
    const dbObject = await DBPlanet.findOneAndUpdate({ name: data.name }, toSave, {
        upsert: true,
        new: true,
        lean: true,
        setDefaultsOnInsert: true,
    });
    return dbObject;
}
exports.addOrUpdateInDb = addOrUpdateInDb;
async function removeFromDb(name) {
    const res = await DBPlanet.deleteOne({ name });
    dist_1.default.log(`Deleted planet`, name, res);
}
exports.removeFromDb = removeFromDb;
async function wipe() {
    const res = await DBPlanet.deleteMany({});
    dist_1.default.log(`Wiped planet DB`, res);
}
exports.wipe = wipe;
async function getAllConstructible() {
    const docs = await DBPlanet.find({});
    return docs;
}
exports.getAllConstructible = getAllConstructible;
//# sourceMappingURL=planet.js.map