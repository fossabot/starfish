"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.equipLoadout = exports.removeItem = exports.addEngine = exports.addWeapon = void 0;
const items_1 = require("../../../presets/items");
const Weapon_1 = require("../../Item/Weapon");
const Engine_1 = require("../../Item/Engine");
const loadouts_1 = __importDefault(require("../../../presets/loadouts"));
function addWeapon(id, props) {
    const baseData = items_1.weapons[id];
    if (!baseData)
        return false;
    const item = new Weapon_1.Weapon(baseData, this, props);
    this.items.push(item);
    this.recalculateMaxHp();
    this.toUpdate.attackRadius = this.radii.attack;
    return true;
}
exports.addWeapon = addWeapon;
function addEngine(id, props) {
    const baseData = items_1.engines[id];
    if (!baseData)
        return false;
    const item = new Engine_1.Engine(baseData, this, props);
    this.items.push(item);
    this.recalculateMaxHp();
    return true;
}
exports.addEngine = addEngine;
function removeItem(item) {
    const weaponIndex = this.items.findIndex((w) => w === item);
    if (weaponIndex !== -1) {
        this.items.splice(weaponIndex, 1);
        return true;
    }
    const engineIndex = this.items.findIndex((e) => e === item);
    if (engineIndex !== -1) {
        this.items.splice(engineIndex, 1);
        return true;
    }
    this.recalculateMaxHp();
    return false;
}
exports.removeItem = removeItem;
function equipLoadout(name) {
    const loadout = loadouts_1.default[name];
    if (!loadout)
        return false;
    loadout.weapons.forEach((baseData) => this.addWeapon(baseData.id));
    loadout.engines.forEach((baseData) => this.addEngine(baseData.id));
    return true;
}
exports.equipLoadout = equipLoadout;
//# sourceMappingURL=items.js.map