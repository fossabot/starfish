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
    constructor({ name, faction, loadout, seenPlanets, location, }, game) {
        this.toUpdate = {};
        this.visible = {
            ships: [],
            planets: [],
            caches: [],
            attackRemnants: [],
        };
        this.seenPlanets = [];
        this.weapons = [];
        this.engines = [];
        this.previousLocations = [];
        this.id = `${Math.random()}`.substring(2); // re-set in subclasses
        this.location = [0, 0];
        this.velocity = [0, 0];
        this.speed = 0; // just for frontend reference
        this.direction = 0; // just for frontend reference
        // targetLocation: CoordinatePair = [0, 0]
        this.human = false;
        this.attackable = false;
        this._hp = 10; // set in hp setter below
        this._maxHp = 10;
        this.dead = false; // set in hp setter below
        this.obeysGravity = true;
        this.addWeapon = items_1.addWeapon;
        this.addEngine = items_1.addEngine;
        this.removeItem = items_1.removeItem;
        this.equipLoadout = items_1.equipLoadout;
        // ----- radii -----
        this.sightRadius = 1;
        // ----- movement -----
        this.lastMoveAngle = 0;
        // get atTargetLocation(): boolean {
        //   return (
        //     math.abs(this.location[0] - this.targetLocation[0]) <
        //       0.000001 &&
        //     math.abs(this.location[1] - this.targetLocation[1]) <
        //       0.000001
        //   )
        // }
        this.move = motion_1.move;
        this.stop = motion_1.stop;
        this.isAt = motion_1.isAt;
        // thrust = thrust
        this.applyTickOfGravity = motion_1.applyTickOfGravity;
        this.game = game;
        this.name = name;
        this.faction =
            game.factions.find((f) => f.color === faction) ||
                false;
        if (location)
            this.location = location;
        else if (this.faction) {
            this.location = [
                ...(this.faction.homeworld?.location || [0, 0]),
            ];
        }
        else
            this.location = [0, 0];
        this.planet =
            this.game.planets.find((p) => this.isAt(p.location)) || false;
        if (seenPlanets)
            this.seenPlanets = seenPlanets
                .map((name) => this.game.planets.find((p) => p.name === name))
                .filter((p) => p);
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
        this.visible = this.game.scanCircle(this.location, this.sightRadius, this.id);
        const newPlanets = this.visible.planets.filter((p) => !this.seenPlanets.includes(p));
        if (newPlanets.length) {
            this.seenPlanets.push(...newPlanets);
            // todo alert ship
        }
        // ----- updates for frontend -----
        this.toUpdate.visible = io_1.stubify(this.visible);
        this.toUpdate.weapons = this.weapons.map((w) => io_1.stubify(w));
        this.toUpdate.engines = this.engines.map((e) => io_1.stubify(e));
        // ----- move -----
        this.move();
        if (this.obeysGravity)
            this.applyTickOfGravity();
        // ----- send update to listeners -----
        if (!Object.keys(this.toUpdate).length)
            return;
        io_1.io.to(`ship:${this.id}`).emit(`ship:update`, {
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
    get canMove() {
        if (this.dead)
            return false;
        return true;
    }
    // ----- crew -----
    membersIn(l) {
        return [];
    }
    cumulativeSkillIn(l, s) {
        return 1;
    }
    // ----- combat -----
    canAttack(s) {
        return false;
    }
    get hp() {
        return this._hp;
    }
    set hp(newValue) {
        this._hp = newValue;
        if (this._hp < 0)
            this._hp = 0;
        if (this._hp > this._maxHp)
            this._hp = this._maxHp;
        this.toUpdate._hp = this._hp;
        const didDie = !this.dead && newValue <= 0;
        if (didDie) {
            // ----- notify listeners -----
            io_1.io.to(`ship:${this.id}`).emit(`ship:die`, io_1.stubify(this));
            this.dead = true;
        }
        else
            this.dead = false;
    }
    respawn() {
        this.hp = this._maxHp;
        if (this.faction) {
            this.location = [
                ...(this.faction.homeworld?.location || [0, 0]),
            ];
        }
        else
            this.location = [0, 0];
    }
}
exports.Ship = Ship;
Ship.maxPreviousLocations = 10;
//# sourceMappingURL=Ship.js.map