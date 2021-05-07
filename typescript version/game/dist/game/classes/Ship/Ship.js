"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ship = void 0;
const dist_1 = __importDefault(require("../../../../../common/dist"));
const items_1 = require("./addins/items");
const motion_1 = require("./addins/motion");
const io_1 = require("../../../server/io");
class Ship {
    constructor({ name, planet, faction, loadout }, game) {
        this.toUpdate = {};
        this.visible = {
            ships: [],
            planets: [],
            caches: [],
            attackRemnants: [],
        };
        this.weapons = [];
        this.engines = [];
        this.previousLocations = [];
        this.id = `${Math.random()}`.substring(2); // re-set in subclasses
        this.location = [0, 0];
        this.velocity = [0, 0];
        this.targetLocation = [0, 0];
        this.human = false;
        this.attackable = false;
        this.dead = false;
        this.hp = 10;
        this.obeysGravity = true;
        this.addWeapon = items_1.addWeapon;
        this.addEngine = items_1.addEngine;
        this.removeItem = items_1.removeItem;
        this.equipLoadout = items_1.equipLoadout;
        // ----- movement -----
        this.lastMoveAngle = 0;
        this.move = motion_1.move;
        this.stop = motion_1.stop;
        // thrust = thrust
        this.applyTickOfGravity = motion_1.applyTickOfGravity;
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
        this.visible = this.game.scanCircle(this.location, this.sightRange, this.id);
        this.toUpdate.visible = io_1.stubify(this.visible);
        if (!this.planet)
            this.move();
        if (this.obeysGravity)
            this.applyTickOfGravity();
        // ----- send update to listeners -----
        if (!Object.keys(this.toUpdate).length)
            return;
        io_1.io.to(`ship:${this.id}`).emit('ship:update', {
            id: this.id,
            updates: this.toUpdate,
        });
        this.toUpdate = {};
    }
    // ----- item mgmt -----
    get items() {
        const items = [...this.weapons, ...this.engines];
        return items;
    }
    // ----- ranges -----
    get sightRange() {
        return 2;
    }
    get canMove() {
        if (!!this.planet)
            return false;
        if (!!this.dead)
            return false;
        return true;
    }
    get atTargetLocation() {
        return (Math.abs(this.location[0] - this.targetLocation[0]) <
            0.000001 &&
            Math.abs(this.location[1] - this.targetLocation[1]) <
                0.000001);
    }
    // ----- crew -----
    membersIn(l) {
        return [];
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
Ship.maxPreviousLocations = 10;
//# sourceMappingURL=Ship.js.map