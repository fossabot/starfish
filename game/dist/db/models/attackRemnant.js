"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllConstructible = exports.removeFromDb = exports.wipe = exports.addOrUpdateInDb = void 0;
const mongoose_1 = require("mongoose");
const dist_1 = __importDefault(require("../../../../common/dist"));
const attackRemnantSchemaFields = {
    id: { type: String, required: true },
    attacker: {
        id: String,
        name: String,
    },
    defender: {
        id: String,
        name: String,
    },
    time: { type: Number, default: Date.now() },
    start: [{ type: Number, required: true }],
    end: [{ type: Number, required: true }],
    damageTaken: {
        damageTaken: Number,
        didDie: Boolean,
        weapon: {
            id: String,
        },
    },
    onlyVisibleToShipId: { type: String },
};
const attackRemnantSchema = new mongoose_1.Schema(attackRemnantSchemaFields);
const DBAttackRemnant = (0, mongoose_1.model)(`DBAttackRemnant`, attackRemnantSchema);
async function addOrUpdateInDb(data) {
    const toSave = new DBAttackRemnant(data)._doc;
    delete toSave._id;
    const dbObject = await DBAttackRemnant.findOneAndUpdate({ id: data.id }, toSave, {
        upsert: true,
        new: true,
        lean: true,
        setDefaultsOnInsert: true,
    });
    return dbObject;
}
exports.addOrUpdateInDb = addOrUpdateInDb;
async function wipe() {
    const res = await DBAttackRemnant.deleteMany({});
    dist_1.default.log(`Wiped attack remnant DB`, res);
}
exports.wipe = wipe;
async function removeFromDb(id) {
    const res = await DBAttackRemnant.deleteMany({ id });
}
exports.removeFromDb = removeFromDb;
async function getAllConstructible() {
    const docs = (await DBAttackRemnant.find({})).map((z) => z.toObject());
    return docs;
}
exports.getAllConstructible = getAllConstructible;
//# sourceMappingURL=attackRemnant.js.map