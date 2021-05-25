"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ship = void 0;
const dist_1 = __importDefault(require("../../../../../common/dist"));
const Engine_1 = require("../Item/Engine");
const Weapon_1 = require("../Item/Weapon");
const loadouts_1 = __importDefault(require("../../presets/loadouts"));
const items_1 = require("../../presets/items");
class Ship {
    constructor({ name, faction, items, loadout, seenPlanets, location, previousLocations, }, game) {
        this.radii = {
            sight: 0,
            broadcast: 0,
            scan: 0,
            attack: 0,
        };
        this.crewMembers = [];
        this.toUpdate = {};
        this.visible = {
            ships: [],
            planets: [],
            caches: [],
            attackRemnants: [],
        };
        this.seenPlanets = [];
        this.items = [];
        this.previousLocations = [];
        this.id = `${Math.random()}`.substring(2); // re-set in subclasses
        this.location = [0, 0];
        this.velocity = [0, 0];
        this.speed = 0; // just for frontend reference
        this.direction = 0; // just for frontend reference
        // targetLocation: CoordinatePair = [0, 0]
        this.attackable = false;
        this._hp = 10; // set in hp setter below
        this._maxHp = 10;
        this.dead = false; // set in hp setter below
        this.obeysGravity = true;
        this.mass = 1000000;
        // ----- movement -----
        this.lastMoveAngle = 0;
        this.game = game;
        this.name = name;
        this.ai = true;
        this.human = false;
        this.faction =
            game.factions.find((f) => f.color === faction?.color) || false;
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
        if (previousLocations)
            this.previousLocations = previousLocations;
        if (seenPlanets)
            this.seenPlanets = seenPlanets
                .map(({ name }) => this.game.planets.find((p) => p.name === name))
                .filter((p) => p);
        if (items)
            items.forEach((i) => this.addItem(i));
        if (!items && loadout)
            this.equipLoadout(loadout);
        this.hp = this.maxHp;
        this.updateSightRadius();
        this.recalculateMaxHp();
        this._hp = this.hp;
    }
    identify() {
        dist_1.default.log(this.ai ? `gray` : `white`, `Ship: ${this.name} (${this.id}) at ${this.location}`);
        if (this.planet)
            dist_1.default.log(`      docked at ${this.planet.name}`);
        else
            dist_1.default.log(`      velocity: ${this.velocity}`);
    }
    tick() {
        if (this.dead)
            return;
        if (this.obeysGravity)
            this.applyTickOfGravity();
        // c.log(`tick`, this.name)
    }
    // ----- item mgmt -----
    get engines() {
        return this.items.filter((i) => i instanceof Engine_1.Engine);
    }
    get weapons() {
        return this.items.filter((i) => i instanceof Weapon_1.Weapon);
    }
    addItem(itemData) {
        let item;
        if (itemData.type === `engine`) {
            const engineData = itemData;
            let foundItem;
            if (engineData.id && engineData.id in items_1.engines)
                foundItem = items_1.engines[engineData.id];
            if (!foundItem)
                return false;
            item = new Engine_1.Engine(foundItem, this, engineData);
        }
        if (itemData.type === `weapon`) {
            const weaponData = itemData;
            let foundItem;
            if (weaponData.id && weaponData.id in items_1.weapons)
                foundItem = items_1.weapons[weaponData.id];
            if (!foundItem)
                return false;
            item = new Weapon_1.Weapon(foundItem, this, weaponData);
        }
        if (item) {
            this.items.push(item);
            this.recalculateMaxHp();
            this.toUpdate.attackRadius = this.radii.attack;
        }
        return true;
    }
    removeItem(item) {
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
    equipLoadout(name) {
        const loadout = loadouts_1.default[name];
        if (!loadout)
            return false;
        loadout.forEach((baseData) => this.addItem(baseData));
        return true;
    }
    // ----- radii -----
    updateSightRadius() {
        this.radii.sight = 0.6;
        this.toUpdate.radii = this.radii;
    }
    get canMove() {
        if (this.dead)
            return false;
        return true;
    }
    move(toLocation) {
        if (toLocation) {
            this.location = toLocation;
            this.toUpdate.location = this.location;
            // this.speed = 0
            // this.velocity = [0, 0]
            // this.toUpdate.speed = this.speed
            // this.toUpdate.velocity = this.velocity
            // this.addPreviousLocation(previousLocation)
        }
    }
    addPreviousLocation(locationBeforeThisTick) {
        const lastPrevLoc = this.previousLocations[this.previousLocations.length - 1];
        const newAngle = dist_1.default.angleFromAToB(this.location, locationBeforeThisTick);
        if (!lastPrevLoc ||
            (Math.abs(newAngle - this.lastMoveAngle) > 8 &&
                dist_1.default.distance(this.location, lastPrevLoc) > 0.001)) {
            if (locationBeforeThisTick &&
                locationBeforeThisTick[0])
                this.previousLocations.push(locationBeforeThisTick);
            while (this.previousLocations.length >
                Ship.maxPreviousLocations)
                this.previousLocations.shift();
            this.toUpdate.previousLocations =
                this.previousLocations;
        }
        this.lastMoveAngle = newAngle;
    }
    isAt(coords) {
        return dist_1.default.pointIsInsideCircle(this.location, coords, dist_1.default.ARRIVAL_THRESHOLD);
    }
    applyTickOfGravity() {
        if (!this.canMove)
            return;
        if (this.human) {
            for (let planet of this.visible.planets) {
                const distance = dist_1.default.distance(planet.location, this.location);
                if (distance <= dist_1.default.GRAVITY_RANGE &&
                    distance > dist_1.default.ARRIVAL_THRESHOLD) {
                    const FAKE_MULTIPLIER_TO_GO_FROM_FORCE_OVER_TIME_TO_SINGLE_TICK = 100;
                    const vectorToAdd = dist_1.default
                        .getGravityForceVectorOnThisBodyDueToThatBody(this, planet)
                        .map((g) => ((g *
                        (dist_1.default.deltaTime / 1000) *
                        dist_1.default.gameSpeedMultiplier) /
                        this.mass /
                        dist_1.default.KM_PER_AU /
                        dist_1.default.M_PER_KM) *
                        FAKE_MULTIPLIER_TO_GO_FROM_FORCE_OVER_TIME_TO_SINGLE_TICK);
                    // c.log(
                    //   this.name,
                    //   planet.name,
                    //   math.abs(vectorToAdd[0] + vectorToAdd[1]),
                    // )
                    if (Math.abs(vectorToAdd[0] + vectorToAdd[1]) <
                        0.000000001)
                        return;
                    // if (c.distance(this.location, [this.location[0] + vectorToAdd[0],
                    //   this.location[1] + vectorToAdd[1]]) > c.distance(this.location, planet.location)){
                    //     this.location = planet.location
                    //   }
                    // c.log(vectorToAdd)
                    this.location[0] += vectorToAdd[0];
                    this.location[1] += vectorToAdd[1];
                    this.toUpdate.location = this.location;
                }
            }
        }
        // todo
        //
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
    get maxHp() {
        return this._maxHp;
    }
    recalculateMaxHp() {
        this._maxHp = this.items.reduce((total, i) => i.maxHp + total, 0);
    }
    get hp() {
        const total = this.items.reduce((total, i) => i.maxHp * i.repair + total, 0);
        this._hp = total;
        const wasDead = this.dead;
        this.dead = total <= 0;
        if (this.dead !== wasDead)
            this.toUpdate.dead = this.dead;
        return total;
    }
    set hp(newValue) {
        this._hp = newValue;
        if (this._hp < 0)
            this._hp = 0;
        if (this._hp > this._maxHp)
            this._hp = this._maxHp;
        this.toUpdate._hp = this._hp;
    }
    // ----- misc stubs -----
    logEntry(s, lv) { }
}
exports.Ship = Ship;
Ship.maxPreviousLocations = 20;
//# sourceMappingURL=Ship.js.map