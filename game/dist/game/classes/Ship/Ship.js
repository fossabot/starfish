"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ship = void 0;
const dist_1 = __importDefault(require("../../../../../common/dist"));
const Engine_1 = require("../Item/Engine");
const Weapon_1 = require("../Item/Weapon");
const Scanner_1 = require("../Item/Scanner");
const Communicator_1 = require("../Item/Communicator");
const Armor_1 = require("../Item/Armor");
const loadouts_1 = __importDefault(require("../../presets/loadouts"));
const Stubbable_1 = require("../Stubbable");
class Ship extends Stubbable_1.Stubbable {
    static maxPreviousLocations = 30;
    type = `ship`;
    name;
    planet = false;
    faction;
    species;
    game;
    radii = {
        sight: 0,
        broadcast: 0,
        scan: 0,
        attack: 0,
        game: 0,
    };
    onlyVisibleToShipId;
    ai;
    human;
    crewMembers = [];
    tutorial;
    toUpdate = {};
    visible = {
        ships: [],
        planets: [],
        caches: [],
        attackRemnants: [],
        zones: [],
    };
    seenPlanets = [];
    seenLandmarks = [];
    chassis;
    items = [];
    previousLocations = [];
    id = `${Math.random()}`.substring(2); // re-set in subclasses
    location = [0, 0];
    velocity = [0, 0];
    speed = 0; // just for frontend reference
    direction = 0; // just for frontend reference
    // targetLocation: CoordinatePair = [0, 0]
    tagline = null;
    availableTaglines = [];
    headerBackground = null;
    availableHeaderBackgrounds = [`Default`];
    passives = [];
    slots = 1;
    attackable = false;
    _hp = 10; // set in hp setter below
    _maxHp = 10;
    dead = false; // set in hp setter below
    obeysGravity = true;
    mass = 10000;
    stats = [];
    constructor({ name, species, chassis, items, loadout, seenPlanets, seenLandmarks, location, velocity, previousLocations, tagline, availableTaglines, headerBackground, availableHeaderBackgrounds, stats, }, game) {
        super();
        this.game = game;
        this.name = name;
        this.rename(name);
        this.ai = true;
        this.human = false;
        this.species = game.species.find((s) => s.id === species.id);
        this.faction = this.species.faction;
        this.velocity = velocity || [0, 0];
        if (location) {
            this.location = location;
        }
        else if (this.faction) {
            this.location = [
                ...(this.faction.homeworld?.location || [0, 0]),
            ];
            // c.log(`fact`, this.location, this.faction.homeworld)
        }
        else
            this.location = [0, 0];
        if (previousLocations)
            this.previousLocations = previousLocations;
        if (tagline)
            this.tagline = tagline;
        if (availableTaglines)
            this.availableTaglines = availableTaglines;
        if (headerBackground)
            this.headerBackground = headerBackground;
        if (availableHeaderBackgrounds?.length)
            this.availableHeaderBackgrounds =
                availableHeaderBackgrounds;
        if (seenPlanets)
            this.seenPlanets = seenPlanets
                .map(({ name }) => this.game.planets.find((p) => p.name === name))
                .filter((p) => p);
        if (seenLandmarks)
            this.seenLandmarks = seenLandmarks
                .filter((l) => l?.type === `zone`)
                .map(({ id }) => this.game.zones.find((z) => z.id === id))
                .filter((z) => z);
        if (chassis &&
            chassis.id &&
            dist_1.default.items.chassis[chassis.id])
            this.chassis = dist_1.default.items.chassis[chassis.id];
        else if (loadout &&
            dist_1.default.items.chassis[loadouts_1.default[loadout]?.chassis])
            this.chassis =
                dist_1.default.items.chassis[loadouts_1.default[loadout].chassis];
        else
            this.chassis = dist_1.default.items.chassis.starter1;
        this.updateSlots();
        if (items)
            items.forEach((i) => this.addItem(i));
        if (!items && loadout)
            this.equipLoadout(loadout);
        this.hp = this.maxHp;
        this.updateSightAndScanRadius();
        this.recalculateMaxHp();
        this._hp = this.hp;
        if (stats)
            this.stats = stats;
        // passively lose previous locations over time
        // so someone who, for example, sits forever at a planet loses their trail eventually
        setInterval(() => {
            if (!this.previousLocations.length)
                return;
            this.previousLocations.shift();
            // c.log(`removing previous location`)
        }, (dist_1.default.tickInterval * 10000) / dist_1.default.gameSpeedMultiplier);
    }
    tick() {
        this._stub = null; // invalidate stub
        if (this.dead)
            return;
        if (this.obeysGravity)
            this.applyTickOfGravity();
        // c.log(`tick`, this.name)
    }
    rename(newName) {
        const prevName = this.name;
        this.name = dist_1.default
            .sanitize(newName)
            .result.substring(0, dist_1.default.maxNameLength);
        if (this.name.replace(/\s/g, ``).length === 0)
            this.name = `ship`;
        if (this.name === prevName)
            return;
        if (this.name) {
            dist_1.default.log(prevName, newName, this.name);
        }
        this.toUpdate.name = this.name;
        this.logEntry([
            `The ship has been renamed to`,
            { color: `var(--success)`, text: this.name },
            `&nospace!`,
        ], `high`);
    }
    // ----- item mgmt -----
    get engines() {
        return this.items.filter((i) => i instanceof Engine_1.Engine);
    }
    get weapons() {
        return this.items.filter((i) => i instanceof Weapon_1.Weapon);
    }
    get scanners() {
        return this.items.filter((i) => i instanceof Scanner_1.Scanner);
    }
    get communicators() {
        return this.items.filter((i) => i instanceof Communicator_1.Communicator);
    }
    get armor() {
        return this.items.filter((i) => i instanceof Armor_1.Armor);
    }
    swapChassis(chassisData) {
        if (!chassisData.id)
            return;
        const chassisToSwapTo = dist_1.default.items.chassis[chassisData.id];
        this.chassis = chassisToSwapTo;
        this.recalculateMass();
    }
    updateSlots() {
        let slots = this.chassis.slots;
        for (let p of this.passives.filter((p) => p.id === `extraEquipmentSlots`))
            slots += Math.round(p.intensity || 0);
        this.slots = slots;
        this.toUpdate.slots = slots;
    }
    addItem(itemData) {
        let item;
        if (!itemData.type)
            return false;
        if (this.slots <= this.items.length) {
            dist_1.default.log(`No chassis slots remaining to add item into.`);
            return false;
        }
        if (itemData.type === `engine`) {
            const engineData = itemData;
            let foundItem;
            if (engineData.id && engineData.id in dist_1.default.items.engine)
                foundItem = dist_1.default.items.engine[engineData.id];
            if (!foundItem)
                return false;
            item = new Engine_1.Engine(foundItem, this, engineData);
        }
        if (itemData.type === `weapon`) {
            const weaponData = itemData;
            let foundItem;
            if (weaponData.id && weaponData.id in dist_1.default.items.weapon)
                foundItem = dist_1.default.items.weapon[weaponData.id];
            if (!foundItem)
                return false;
            item = new Weapon_1.Weapon(foundItem, this, weaponData);
        }
        if (itemData.type === `scanner`) {
            const scannerData = itemData;
            let foundItem;
            if (scannerData.id &&
                scannerData.id in dist_1.default.items.scanner)
                foundItem = dist_1.default.items.scanner[scannerData.id];
            if (!foundItem)
                return false;
            item = new Scanner_1.Scanner(foundItem, this, scannerData);
        }
        if (itemData.type === `communicator`) {
            const communicatorData = itemData;
            let foundItem;
            if (communicatorData.id &&
                communicatorData.id in dist_1.default.items.communicator)
                foundItem =
                    dist_1.default.items.communicator[communicatorData.id];
            if (!foundItem)
                return false;
            item = new Communicator_1.Communicator(foundItem, this, communicatorData);
        }
        if (itemData.type === `armor`) {
            const armorData = itemData;
            let foundItem;
            if (armorData.id && armorData.id in dist_1.default.items.armor)
                foundItem = dist_1.default.items.armor[armorData.id];
            if (!foundItem)
                return false;
            item = new Armor_1.Armor(foundItem, this, armorData);
        }
        if (!item)
            return false;
        this.items.push(item);
        if (item.passives)
            item.passives.forEach((p) => this.applyPassive({
                ...p,
                data: {
                    ...p.data,
                    source: {
                        item: {
                            type: item.type,
                            id: item.id,
                        },
                    },
                },
            }));
        this.updateThingsThatCouldChangeOnItemChange();
        this.recalculateMass();
        if (this.items.length === 5)
            this.addHeaderBackground(`Flat 1`, `equipping 5 items`);
        else if (this.items.length === 8)
            this.addHeaderBackground(`Flat 2`, `equipping 8 items`);
        return item;
    }
    removeItem(item) {
        const itemIndex = this.items.findIndex((i) => i === item);
        if (itemIndex === -1)
            return false;
        this.items.splice(itemIndex, 1);
        if (item.passives)
            item.passives.forEach((p) => this.removePassive(p));
        this.updateThingsThatCouldChangeOnItemChange();
        this.recalculateMass();
        return true;
    }
    equipLoadout(id) {
        const loadout = loadouts_1.default[id];
        if (!loadout)
            return false;
        this.swapChassis({ id: loadout.chassis });
        loadout.items.forEach((baseData) => this.addItem(baseData));
        this.updateThingsThatCouldChangeOnItemChange();
        return true;
    }
    // ----- radii -----
    updateThingsThatCouldChangeOnItemChange() {
        this.recalculateMaxHp();
        this.updateSightAndScanRadius();
    }
    recalculateMass() {
        let mass = this.chassis.mass;
        for (let item of this.items)
            mass += item.mass;
        this.crewMembers.forEach((cm) => (mass += cm.inventory.reduce((total, cargo) => total + cargo.amount * 1000, 0)));
        this.mass = dist_1.default.r2(mass, 0);
        this.toUpdate.mass = this.mass;
    }
    updateSightAndScanRadius() {
        if (this.tutorial) {
            this.radii.sight =
                this.tutorial.currentStep.sightRange;
            this.radii.scan =
                this.tutorial.currentStep.scanRange || 0;
            this.toUpdate.radii = this.radii;
            return;
        }
        // ----- sight -----
        this.radii.sight = Math.max(dist_1.default.baseSightRange, dist_1.default.getRadiusDiminishingReturns(this.scanners.reduce((max, s) => s.sightRange * s.repair + max, 0), this.scanners.length));
        const boostSight = (this.passives.find((p) => p.id === `boostSightRange`)
            ?.intensity || 0) + 1;
        this.radii.sight *= boostSight;
        // ----- scan -----
        this.radii.scan = dist_1.default.getRadiusDiminishingReturns(this.scanners.reduce((max, s) => s.shipScanRange * s.repair + max, 0), this.scanners.length);
        const boostScan = (this.passives.find((p) => p.id === `boostScanRange`)
            ?.intensity || 0) + 1;
        this.radii.scan *= boostScan;
        this.toUpdate.radii = this.radii;
    }
    // ----- movement -----
    get canMove() {
        if (this.dead)
            return false;
        return true;
    }
    move(toLocation) {
        if (toLocation) {
            this.location = [...toLocation];
            this.toUpdate.location = this.location;
        }
    }
    addPreviousLocation(previousLocation, currentLocation) {
        if (this.previousLocations.length > 1 &&
            previousLocation[0] ===
                this.previousLocations[this.previousLocations.length - 1]?.[0] &&
            previousLocation[1] ===
                this.previousLocations[this.previousLocations.length - 1]?.[1])
            return;
        // if (this.ai)
        //   c.log(
        //     this.name,
        //     c.angleFromAToB(
        //       this.previousLocations[
        //         this.previousLocations.length - 1
        //       ],
        //       previousLocation,
        //     ) -
        //       c.angleFromAToB(
        //         previousLocation,
        //         currentLocation,
        //       ),
        //   )
        if (this.previousLocations.length < 1 ||
            (Math.abs(dist_1.default.angleFromAToB(this.previousLocations[this.previousLocations.length - 1], previousLocation) -
                dist_1.default.angleFromAToB(previousLocation, currentLocation)) > 5 &&
                dist_1.default.distance(this.location, this.previousLocations[this.previousLocations.length - 1]) > 0.000005)) {
            this.previousLocations.push([...currentLocation]);
            while (this.previousLocations.length >
                Ship.maxPreviousLocations)
                this.previousLocations.shift();
            this.toUpdate.previousLocations =
                this.previousLocations;
        }
    }
    isAt(coords, arrivalThresholdMultiplier = 1) {
        return dist_1.default.pointIsInsideCircle(this.location, coords, dist_1.default.arrivalThreshold * arrivalThresholdMultiplier);
    }
    applyTickOfGravity() {
        if (!this.human)
            return;
        if (this.planet)
            return;
        if (!this.canMove)
            return;
        for (let planet of this.seenPlanets || []) {
            const distance = dist_1.default.distance(planet.location, this.location);
            if (distance <= dist_1.default.gravityRange &&
                distance > dist_1.default.arrivalThreshold) {
                const vectorToAdd = dist_1.default
                    .getGravityForceVectorOnThisBodyDueToThatBody(this, planet)
                    // comes back as kg * m / second == N
                    .map((g) => (g *
                    Math.min(dist_1.default.deltaTime / dist_1.default.tickInterval, 2) *
                    dist_1.default.gameSpeedMultiplier) /
                    this.mass /
                    dist_1.default.kmPerAu /
                    dist_1.default.mPerKm);
                // c.log(
                //   this.name,
                //   planet.name,
                //   Math.abs(vectorToAdd[0]) +
                //     Math.abs(vectorToAdd[1]),
                // )
                if (Math.abs(vectorToAdd[0]) +
                    Math.abs(vectorToAdd[1]) <
                    0.0000000000001)
                    return;
                this.velocity[0] += vectorToAdd[0];
                this.velocity[1] += vectorToAdd[1];
                this.toUpdate.velocity = this.velocity;
                this.speed = dist_1.default.vectorToMagnitude(this.velocity);
                this.toUpdate.speed = this.speed;
                this.direction = dist_1.default.vectorToDegrees(this.velocity);
                this.toUpdate.direction = this.direction;
            }
        }
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
        if (this.hp > this._maxHp)
            this.hp = this._maxHp;
    }
    get hp() {
        const total = this.items.reduce((total, i) => Math.max(0, i.maxHp * i.repair) + total, 0);
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
    // ----- cosmetics -----
    addTagline(tagline, reason) {
        if (this.availableTaglines.find((t) => t === tagline))
            return;
        this.availableTaglines.push(tagline);
        this.toUpdate.availableTaglines = this.availableTaglines;
        this.logEntry([
            `Unlocked a new ship tagline for ${reason}:`,
            { text: `"${tagline}"`, color: `var(--success)` },
        ], `high`);
    }
    addHeaderBackground(bg, reason) {
        if (this.availableHeaderBackgrounds.find((b) => b === bg))
            return;
        this.availableHeaderBackgrounds.push(bg);
        this.toUpdate.availableHeaderBackgrounds =
            this.availableHeaderBackgrounds;
        this.logEntry([
            `Unlocked a new ship header for ${reason}:`,
            { text: `"${bg}"`, color: `var(--success)` },
        ], `high`);
    }
    // ----- stats -----
    addStat(statname, amount) {
        const existing = this.stats.find((s) => s.stat === statname);
        if (!existing)
            this.stats.push({
                stat: statname,
                amount,
            });
        else
            existing.amount += amount;
        this.toUpdate.stats = dist_1.default.stubify({ ...this.stats });
    }
    // ----- misc stubs -----
    logEntry(s, lv) { }
    updateMaxScanProperties() { }
    applyPassive(p) { }
    removePassive(p) { }
}
exports.Ship = Ship;
//# sourceMappingURL=Ship.js.map