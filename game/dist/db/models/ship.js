"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllConstructible = exports.wipe = exports.removeFromDb = exports.addOrUpdateInDb = void 0;
const mongoose_1 = require("mongoose");
const dist_1 = __importDefault(require("../../../../common/dist"));
const shipSchemaFields = {
    id: { type: String, required: true },
    ai: { type: Boolean, default: false },
    location: [{ type: Number, required: true }],
    name: { type: String, required: true },
    faction: { color: String },
    loadout: String,
    engines: [{ id: String, repair: Number }],
    weapons: [
        {
            id: String,
            repair: Number,
            cooldownRemaining: Number,
        },
    ],
    previousLocations: [[Number, Number]],
    log: [{ text: String, time: Number, level: String }],
    seenPlanets: [{ name: String }],
    captain: String,
    crewMembers: [
        {
            name: { type: String, required: true },
            id: { type: String, required: true },
            skills: [
                {
                    skill: String,
                    level: Number,
                    xp: Number,
                },
            ],
            location: String,
            stamina: Number,
            inventory: [
                { type: { type: String }, amount: Number },
            ],
            credits: Number,
            actives: [String],
            tactic: String,
            attackFactions: [String],
            targetLocation: [Number, Number],
            repairPriority: String,
        },
    ],
    spawnPoint: [Number, Number],
};
const shipSchema = new mongoose_1.Schema(shipSchemaFields);
const DBShip = mongoose_1.model(`DBShip`, shipSchema);
async function addOrUpdateInDb(data) {
    const stub = dist_1.default.stubify(data);
    const toSave = new DBShip(stub)._doc;
    delete toSave._id;
    const dbObject = await DBShip.findOneAndUpdate({ id: data.id }, toSave, {
        upsert: true,
        new: true,
        lean: true,
        setDefaultsOnInsert: true,
    });
    return dbObject;
}
exports.addOrUpdateInDb = addOrUpdateInDb;
async function removeFromDb(id) {
    const res = await DBShip.deleteOne({ id });
    dist_1.default.log(`Deleted ship`, id, res);
}
exports.removeFromDb = removeFromDb;
async function wipe() {
    const res = await DBShip.deleteMany({});
    dist_1.default.log(`Wiped ship DB`, res);
}
exports.wipe = wipe;
async function getAllConstructible() {
    const docs = await DBShip.find({});
    return docs;
}
exports.getAllConstructible = getAllConstructible;
//# sourceMappingURL=ship.js.map