"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllConstructible = exports.wipe = exports.removeFromDb = exports.addOrUpdateInDb = void 0;
const mongoose_1 = require("mongoose");
const dist_1 = __importDefault(require("../../../../common/dist"));
const planetSchemaFields = {
    planetType: String,
    id: String,
    location: [{ type: Number, required: true }],
    color: String,
    name: { type: String, required: true },
    radius: Number,
    mass: Number,
    landingRadiusMultiplier: Number,
    creatures: [String],
    level: Number,
    xp: Number,
    baseLevel: Number,
    passives: [
        {
            id: String,
            intensity: Number,
            data: mongoose_1.Schema.Types.Mixed,
        },
    ],
    pacifist: Boolean,
    stats: [{ stat: String, amount: Number }],
    // mining
    mine: [
        {
            id: { type: String },
            payoutAmount: Number,
            mineRequirement: Number,
            mineCurrent: Number,
        },
    ],
    // basic
    leanings: [
        {
            type: { type: String },
            never: Boolean,
            propensity: Number,
        },
    ],
    factionId: String,
    homeworld: { id: String },
    allegiances: [{ faction: { id: String }, level: Number }],
    vendor: {
        cargo: [
            {
                id: String,
                buyMultiplier: Number,
                sellMultiplier: Number,
            },
        ],
        chassis: [
            {
                id: String,
                buyMultiplier: Number,
                sellMultiplier: Number,
            },
        ],
        items: [
            {
                type: { type: String },
                id: String,
                buyMultiplier: Number,
                sellMultiplier: Number,
            },
        ],
        passives: [
            {
                id: String,
                buyMultiplier: Number,
                intensity: Number,
            },
        ],
        repairCostMultiplier: Number,
    },
};
const planetSchema = new mongoose_1.Schema(planetSchemaFields);
const DBPlanet = (0, mongoose_1.model)(`DBPlanet`, planetSchema);
async function addOrUpdateInDb(data) {
    const stub = data.stubify();
    const toSave = new DBPlanet(stub)._doc;
    delete toSave._id;
    const dbObject = await DBPlanet.findOneAndUpdate({ id: data.id }, toSave, {
        upsert: true,
        new: true,
        lean: true,
        setDefaultsOnInsert: true,
    });
    return dbObject;
}
exports.addOrUpdateInDb = addOrUpdateInDb;
async function removeFromDb(id) {
    const res = await DBPlanet.deleteMany({ id });
    dist_1.default.log(`Deleted planet`, id, res);
}
exports.removeFromDb = removeFromDb;
async function wipe() {
    const res = await DBPlanet.deleteMany({});
    dist_1.default.log(`Wiped planet DB`, res);
}
exports.wipe = wipe;
async function getAllConstructible() {
    const docs = (await DBPlanet.find({})).map((d) => d.toObject());
    // clearExtraneousMongooseIdEntry(docs)
    return docs;
}
exports.getAllConstructible = getAllConstructible;
function clearExtraneousMongooseIdEntry(obj) {
    if (!obj)
        return;
    if (obj._id)
        delete obj._id;
    if (typeof obj !== `object`)
        return;
    if (Array.isArray(obj)) {
        obj.forEach(clearExtraneousMongooseIdEntry);
        return;
    }
    Object.keys(obj).forEach((key) => clearExtraneousMongooseIdEntry(obj[key]));
}
//# sourceMappingURL=planet.js.map