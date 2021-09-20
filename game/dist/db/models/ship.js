"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllConstructible = exports.wipeAI = exports.wipe = exports.removeFromDb = exports.addOrUpdateInDb = void 0;
const mongoose_1 = require("mongoose");
const dist_1 = __importDefault(require("../../../../common/dist"));
const shipSchemaFields = {
    id: { type: String, required: true },
    location: [{ type: Number, required: true }],
    velocity: [{ type: Number, required: true }],
    name: { type: String, required: true },
    species: { id: String },
    loadout: String,
    chassis: { id: String },
    items: [
        {
            type: { type: String, required: true },
            id: { type: String, required: true },
            repair: Number,
            cooldownRemaining: Number,
        },
    ],
    previousLocations: [[Number, Number]],
    // ----- human
    log: [
        {
            content: mongoose_1.Schema.Types.Mixed,
            time: Number,
            level: String,
        },
    ],
    seenPlanets: [{ name: String }],
    seenLandmarks: [{ type: { type: String }, id: String }],
    tutorial: {
        step: Number,
    },
    tagline: String,
    availableTaglines: [{ type: String }],
    headerBackground: String,
    availableHeaderBackgrounds: [{ type: String }],
    captain: String,
    logAlertLevel: String,
    stats: [{ stat: String, amount: Number }],
    crewMembers: [
        {
            name: { type: String, required: true },
            id: { type: String, required: true },
            lastActive: Number,
            cockpitCharge: Number,
            skills: [
                {
                    skill: String,
                    level: Number,
                    xp: Number,
                },
            ],
            location: String,
            stamina: Number,
            inventory: [{ id: { type: String }, amount: Number }],
            credits: Number,
            actives: [
                {
                    id: { required: true, type: String },
                    cooldownRemaining: Number,
                },
            ],
            passives: [
                {
                    id: { required: true, type: String },
                    level: Number,
                },
            ],
            tactic: String,
            itemTarget: String,
            minePriority: String,
            attackFactions: [String],
            targetLocation: [Number, Number],
            repairPriority: String,
            stats: [{ stat: String, amount: Number }],
            tutorialShipId: String,
            mainShipId: String,
        },
    ],
    commonCredits: Number,
    // ---- ai
    ai: { type: Boolean, default: false },
    spawnPoint: [Number, Number],
    level: Number,
    onlyVisibleToShipId: String,
};
const shipSchema = new mongoose_1.Schema(shipSchemaFields);
const DBShip = (0, mongoose_1.model)(`DBShip`, shipSchema);
async function addOrUpdateInDb(data) {
    const stub = data.stubify();
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
    // c.log(`Deleted ship`, id, res)
}
exports.removeFromDb = removeFromDb;
async function wipe() {
    const res = await DBShip.deleteMany({});
    dist_1.default.log(`Wiped ship DB`, res);
}
exports.wipe = wipe;
async function wipeAI() {
    const res = await DBShip.deleteMany({ ai: true });
    dist_1.default.log(`Wiped AIs from ship DB`, res);
}
exports.wipeAI = wipeAI;
async function getAllConstructible() {
    const docs = (await DBShip.find({})).map((d) => d.toObject());
    // clearExtraneousMongooseIdEntry(docs)
    return docs;
}
exports.getAllConstructible = getAllConstructible;
function clearExtraneousMongooseIdEntry(obj) {
    if (obj && obj._id)
        delete obj._id;
    if (typeof obj !== `object`)
        return;
    if (Array.isArray(obj)) {
        obj.forEach(clearExtraneousMongooseIdEntry);
        return;
    }
    Object.keys(obj).forEach((key) => clearExtraneousMongooseIdEntry(obj[key]));
}
//# sourceMappingURL=ship.js.map