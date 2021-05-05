"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ship = void 0;
const dist_1 = __importDefault(require("../../../../../common/dist"));
const items_1 = require("./addins/items");
const movement_1 = require("./addins/movement");
class Ship {
    constructor({ name, planet, faction, loadout }, game) {
        this.weapons = [];
        this.engines = [];
        this.previousLocations = [];
        this.id = `${Math.random()}`.substring(2); // re-set in subclasses
        this.location = [0, 0];
        this.velocity = [0, 0];
        this.human = false;
        this.attackable = false;
        this.dead = false;
        this.hp = 10;
        this.obeysGravity = true;
        this.addWeapon = items_1.addWeapon;
        this.addEngine = items_1.addEngine;
        this.removeItem = items_1.removeItem;
        this.equipLoadout = items_1.equipLoadout;
        this.move = movement_1.move;
        this.stop = movement_1.stop;
        this.thrust = movement_1.thrust;
        this.applyTickOfGravity = movement_1.applyTickOfGravity;
        this.game = game;
        this.name = name;
        this.planet =
            game.planets.find((p) => p.name === planet) || null;
        if (this.planet)
            this.location = [...this.planet.location];
        this.faction =
            game.factions.find((f) => f.color === faction) || null;
        if (loadout)
            this.equipLoadout(loadout);
    }
    identify() {
        dist_1.default.log(`Ship: ${this.name} (${this.id}) at ${this.location}`);
        if (this.planet)
            dist_1.default.log(`      docked at ${this.planet.name}`);
        else
            dist_1.default.log(`      velocity: ${this.velocity}`);
    }
    tick() {
        if (this.planet !== null)
            this.move();
        if (this.obeysGravity)
            this.applyTickOfGravity();
    }
    // ----- item mgmt -----
    get items() {
        const items = [...this.weapons, ...this.engines];
        return items;
    }
    // ----- ranges -----
    // ----- movement -----
    get canMove() {
        if (this.planet)
            return false;
        if (this.dead)
            return false;
        return true;
    }
    // ----- combat -----
    canAttack(s) {
        return false;
    }
    get alive() {
        return true;
    }
}
exports.Ship = Ship;
//# sourceMappingURL=Ship.js.map