"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const dist_1 = __importDefault(require("../../../common/dist"));
const io_1 = __importDefault(require("../server/io"));
const db_1 = require("../db");
const Planet_1 = require("./classes/Planet");
const Cache_1 = require("./classes/Cache");
const Faction_1 = require("./classes/Faction");
const Species_1 = require("./classes/Species");
const AttackRemnant_1 = require("./classes/AttackRemnant");
const HumanShip_1 = require("./classes/Ship/HumanShip");
const AIShip_1 = require("./classes/Ship/AIShip");
const planets_1 = require("./presets/planets");
const factions_1 = __importDefault(require("./presets/factions"));
const species_1 = __importDefault(require("./presets/species"));
class Game {
    constructor() {
        this.ships = [];
        this.planets = [];
        this.caches = [];
        this.factions = [];
        this.species = [];
        this.attackRemnants = [];
        // ----- game loop -----
        this.tickCount = 0;
        this.lastTickTime = Date.now();
        this.lastTickExpectedTime = 0;
        this.averageTickLag = 0;
        this.startTime = new Date();
        Object.values(factions_1.default).forEach((fd) => this.addFaction(fd));
        Object.values(species_1.default).map((sd) => this.addSpecies(sd));
        dist_1.default.log(`Loaded ${Object.keys(species_1.default).length} species and ${Object.keys(factions_1.default).length} factions.`);
    }
    startGame() {
        dist_1.default.log(`----- Starting Game -----`);
        setInterval(() => this.save(), Game.saveTimeInterval);
        this.tick();
    }
    async save() {
        dist_1.default.log(`gray`, `----- Saving Game ----- (Tick avg.: ${dist_1.default.r2(this.averageTickLag, 2)}ms)`);
        const promises = [];
        this.ships.forEach((s) => {
            promises.push(db_1.db.ship.addOrUpdateInDb(s));
        });
        await Promise.all(promises);
    }
    identify() {
        dist_1.default.log(`Game of ${dist_1.default.GAME_NAME} started at ${this.startTime}, running for ${this.tickCount} ticks`);
        dist_1.default.log(`${this.ships.length} ships, ${this.planets.length} planets, ${this.caches.length} caches`);
        this.planets.forEach((p) => p.identify());
        this.ships.forEach((s) => s.identify());
    }
    tick() {
        const startTime = Date.now();
        this.tickCount++;
        this.ships.forEach((s) => s.tick());
        this.expireOldAttackRemnantsAndCaches();
        this.spawnNewCaches();
        this.spawnNewAIs();
        this.spawnNewPlanet();
        // ----- timing
        const elapsedTimeInMs = Date.now() - startTime;
        if (elapsedTimeInMs > 50) {
            if (elapsedTimeInMs < 100)
                dist_1.default.log(`Tick took`, `yellow`, elapsedTimeInMs + ` ms`);
            else
                dist_1.default.log(`Tick took`, `red`, elapsedTimeInMs + ` ms`);
        }
        dist_1.default.deltaTime = Date.now() - this.lastTickTime;
        const thisTickLag = dist_1.default.deltaTime - this.lastTickExpectedTime;
        this.averageTickLag = dist_1.default.lerp(this.averageTickLag, thisTickLag, 0.1);
        const nextTickTime = Math.min(dist_1.default.TICK_INTERVAL, dist_1.default.TICK_INTERVAL - this.averageTickLag);
        this.lastTickTime = startTime;
        this.lastTickExpectedTime = nextTickTime;
        setTimeout(() => this.tick(), nextTickTime);
        io_1.default.to(`game`).emit(`game:tick`, {
            deltaTime: dist_1.default.deltaTime,
            game: dist_1.default.stubify(this),
        });
    }
    // ----- scan function -----
    // todo mega-optimize this. chunks?
    scanCircle(center, radius, ignoreSelf, type, includeTrails = false) {
        let ships = [], trails = [], planets = [], caches = [], attackRemnants = [];
        if (!type || type === `ship`)
            ships = this.ships.filter((s) => {
                if (s.id === ignoreSelf)
                    return false;
                if (dist_1.default.pointIsInsideCircle(center, s.location, radius))
                    return true;
                return false;
            });
        if ((!type || type === `trail`) && includeTrails)
            trails = this.ships
                .filter((s) => {
                if (s.id === ignoreSelf)
                    return false;
                if (ships.find((ship) => ship === s))
                    return false;
                for (let l of s.previousLocations) {
                    if (dist_1.default.pointIsInsideCircle(center, l, radius))
                        return true;
                }
                return false;
            })
                .map((s) => s.previousLocations);
        if (!type || type === `planet`)
            planets = this.planets.filter((p) => dist_1.default.pointIsInsideCircle(center, p.location, radius));
        if (!type || type === `cache`)
            caches = this.caches.filter((k) => dist_1.default.pointIsInsideCircle(center, k.location, radius));
        if (!type || type === `attackRemnant`)
            attackRemnants = this.attackRemnants.filter((a) => dist_1.default.pointIsInsideCircle(center, a.start, radius) ||
                dist_1.default.pointIsInsideCircle(center, a.end, radius));
        return {
            ships,
            trails,
            planets,
            caches,
            attackRemnants,
        };
    }
    // ----- radii -----
    get gameSoftRadius() {
        const count = this.humanShips.length || 1;
        return Math.max(1, Math.sqrt(count) / 2);
    }
    get gameSoftArea() {
        return Math.PI * this.gameSoftRadius ** 2;
    }
    // ----- tick helpers -----
    expireOldAttackRemnantsAndCaches() {
        const attackRemnantExpirationTime = Date.now() - AttackRemnant_1.AttackRemnant.expireTime;
        this.attackRemnants.forEach((ar, index) => {
            if (attackRemnantExpirationTime > ar.time) {
                this.removeAttackRemnant(ar);
            }
        });
        const cacheExpirationTime = Date.now() - Cache_1.Cache.expireTime;
        this.caches.forEach((c, index) => {
            if (cacheExpirationTime > c.time) {
                this.removeCache(c);
            }
        });
    }
    spawnNewPlanet() {
        while (this.planets.length < this.gameSoftArea * 1.5 ||
            this.planets.length < this.factions.length - 1) {
            const factionThatNeedsAHomeworld = this.factions.find((f) => f.id !== `red` && !f.homeworld);
            const p = planets_1.generatePlanet(this, factionThatNeedsAHomeworld?.id);
            if (!p)
                return;
            const planet = this.addPlanet(p);
            dist_1.default.log(`gray`, `Spawned planet ${p.name} at ${p.location}${factionThatNeedsAHomeworld
                ? ` (${factionThatNeedsAHomeworld.id} faction homeworld)`
                : ``}.`);
            dist_1.default.log(this.planets.map((p) => p.vendor.items));
            dist_1.default.log(this.planets.map((p) => p.vendor.chassis));
            dist_1.default.log(this.planets.map((p) => p.vendor.cargo));
        }
    }
    spawnNewCaches() {
        while (this.caches.length < this.gameSoftArea * 1.5) {
            const type = dist_1.default.randomFromArray(dist_1.default.cargoTypes);
            const amount = Math.round(Math.random() * 200) / 10 + 1;
            const location = dist_1.default.randomInsideCircle(this.gameSoftRadius);
            this.addCache({
                contents: [
                    {
                        type,
                        amount,
                    },
                ],
                location,
            });
            dist_1.default.log(`gray`, `Spawned random cache of ${amount} ${type} at ${location}.`);
        }
    }
    spawnNewAIs() {
        while (this.ships.length &&
            this.aiShips.length < this.gameSoftArea * 1.35) {
            let radius = this.gameSoftRadius;
            let spawnPoint;
            while (!spawnPoint) {
                let point = dist_1.default.randomInsideCircle(radius);
                const tooClose = this.humanShips.find((hs) => dist_1.default.pointIsInsideCircle(point, hs.location, 0.2));
                if (tooClose)
                    spawnPoint = undefined;
                else
                    spawnPoint = point;
                radius += 0.1;
            }
            const level = dist_1.default.distance([0, 0], spawnPoint) * 2 + 0.1;
            this.addAIShip({
                location: spawnPoint,
                name: `AI${`${Math.random().toFixed(3)}`.substring(2)}`,
                species: { id: `robots` },
                loadout: `aiDefault`,
                level,
            });
        }
    }
    // ----- entity functions -----
    addHumanShip(data, save = true) {
        const existing = this.ships.find((s) => s instanceof HumanShip_1.HumanShip && s.id === data.id);
        if (existing) {
            dist_1.default.log(`red`, `Attempted to add existing human ship ${existing.name} (${existing.id}).`);
            return existing;
        }
        dist_1.default.log(`gray`, `Adding human ship ${data.name} to game at ${data.location}`);
        data.loadout = `humanDefault`;
        const newShip = new HumanShip_1.HumanShip(data, this);
        this.ships.push(newShip);
        if (save)
            db_1.db.ship.addOrUpdateInDb(newShip);
        return newShip;
    }
    addAIShip(data, save = true) {
        const existing = this.ships.find((s) => s instanceof AIShip_1.AIShip && s.id === data.id);
        if (existing) {
            dist_1.default.log(`red`, `Attempted to add existing ai ship ${existing.name} (${existing.id}).`);
            return existing;
        }
        dist_1.default.log(`gray`, `Adding level ${data.level} AI ship ${data.name} to game at ${data.location}`);
        data.loadout = `aiDefault`;
        const newShip = new AIShip_1.AIShip(data, this);
        this.ships.push(newShip);
        if (save)
            db_1.db.ship.addOrUpdateInDb(newShip);
        return newShip;
    }
    removeShip(ship) {
        dist_1.default.log(`Removing ship ${ship.name} from the game.`);
        db_1.db.ship.removeFromDb(ship.id);
        const index = this.ships.findIndex((ec) => ship.id === ec.id);
        if (index === -1)
            return;
        this.ships.splice(index, 1);
    }
    addPlanet(data, save = true) {
        const existing = this.planets.find((p) => p.name === data.name);
        if (existing) {
            dist_1.default.log(`red`, `Attempted to add existing planet ${existing.name}.`);
            return existing;
        }
        const newPlanet = new Planet_1.Planet(data, this);
        this.planets.push(newPlanet);
        if (newPlanet.homeworld)
            newPlanet.homeworld.homeworld = newPlanet;
        if (save)
            db_1.db.planet.addOrUpdateInDb(newPlanet);
        return newPlanet;
    }
    addFaction(data) {
        const newFaction = new Faction_1.Faction(data, this);
        this.factions.push(newFaction);
        return newFaction;
    }
    addSpecies(data) {
        const newSpecies = new Species_1.Species(data, this);
        this.species.push(newSpecies);
        return newSpecies;
    }
    addCache(data, save = true) {
        const existing = this.caches.find((cache) => cache.id === data.id);
        if (existing) {
            dist_1.default.log(`red`, `Attempted to add existing cache (${existing.id}).`);
            return existing;
        }
        const newCache = new Cache_1.Cache(data, this);
        this.caches.push(newCache);
        if (save)
            db_1.db.cache.addOrUpdateInDb(newCache);
        return newCache;
    }
    removeCache(cache) {
        db_1.db.cache.removeFromDb(cache.id);
        const index = this.caches.findIndex((ec) => cache.id === ec.id);
        if (index === -1)
            return;
        this.caches.splice(index, 1);
    }
    addAttackRemnant(data, save = true) {
        const newAttackRemnant = new AttackRemnant_1.AttackRemnant(data);
        this.attackRemnants.push(newAttackRemnant);
        if (save)
            db_1.db.attackRemnant.addOrUpdateInDb(newAttackRemnant);
        return newAttackRemnant;
    }
    removeAttackRemnant(ar) {
        db_1.db.attackRemnant.removeFromDb(ar.id);
        const index = this.attackRemnants.findIndex((eAr) => ar.id === eAr.id);
        if (index === -1)
            return;
        this.attackRemnants.splice(index, 1);
    }
    get humanShips() {
        return this.ships.filter((s) => s instanceof HumanShip_1.HumanShip);
    }
    get aiShips() {
        return this.ships.filter((s) => s instanceof AIShip_1.AIShip);
    }
}
exports.Game = Game;
Game.saveTimeInterval = 1 * 60 * 1000;
//# sourceMappingURL=Game.js.map