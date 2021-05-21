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
const AttackRemnant_1 = require("./classes/AttackRemnant");
const HumanShip_1 = require("./classes/Ship/HumanShip");
const AIShip_1 = require("./classes/Ship/AIShip");
const planets_1 = __importDefault(require("./presets/planets"));
const factions_1 = __importDefault(require("./presets/factions"));
class Game {
    constructor() {
        this.attackRemnants = [];
        // ----- game loop -----
        this.tickCount = 0;
        this.lastTickTime = Date.now();
        this.lastTickExpectedTime = 0;
        this.averageTickLag = 0;
        this.startTime = new Date();
        this.ships = [];
        this.planets = [];
        this.caches = [];
        this.factions = [];
        this.attackRemnants = [];
        this.startGame();
    }
    startGame() {
        dist_1.default.log(`----- Starting Game -----`);
        planets_1.default.forEach((p) => {
            this.addPlanet(p);
        });
        factions_1.default.forEach((f) => {
            this.addFaction(f);
        });
        setInterval(() => this.save(), Game.saveTimeInterval);
        this.tick();
    }
    async save() {
        dist_1.default.log(`gray`, `----- Saving Game -----`);
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
        this.averageTickLag = dist_1.default.lerp(this.averageTickLag, thisTickLag, 0.3);
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
    scanCircle(center, radius, ignoreSelf, type) {
        let ships = [], planets = [], caches = [], attackRemnants = [];
        if (!type || type === `ship`)
            ships = this.ships.filter((s) => s.id !== ignoreSelf &&
                dist_1.default.pointIsInsideCircle(center, s.location, radius));
        if (!type || type === `planet`)
            planets = this.planets.filter((p) => dist_1.default.pointIsInsideCircle(center, p.location, radius));
        if (!type || type === `cache`)
            caches = this.caches.filter((k) => dist_1.default.pointIsInsideCircle(center, k.location, radius));
        if (!type || type === `attackRemnant`)
            attackRemnants = this.attackRemnants.filter((a) => dist_1.default.pointIsInsideCircle(center, a.start, radius) ||
                dist_1.default.pointIsInsideCircle(center, a.end, radius));
        return { ships, planets, caches, attackRemnants };
    }
    // ----- radii -----
    get gameSoftRadius() {
        const count = this.humanShips.length;
        return Math.sqrt(count);
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
    spawnNewCaches() {
        if (this.caches.length <= this.gameSoftArea * 2) {
            const amount = Math.round(Math.random() * 200) / 10 + 1;
            this.addCache({
                contents: [
                    {
                        type: dist_1.default.randomFromArray(dist_1.default.cargoTypes),
                        amount,
                    },
                ],
                location: dist_1.default.randomInsideCircle(this.gameSoftRadius),
            });
            dist_1.default.log(`spawned random cache`);
        }
    }
    // ----- entity functions -----
    addHumanShip(data, save = true) {
        const existing = this.ships.find((s) => s instanceof HumanShip_1.HumanShip && s.id === data.id);
        if (existing) {
            dist_1.default.log(`red`, `Attempted to add an existing human ship.`);
            return existing;
        }
        dist_1.default.log(`gray`, `Adding human ship ${data.name} to game`);
        const newShip = new HumanShip_1.HumanShip(data, this);
        this.ships.push(newShip);
        if (save)
            db_1.db.ship.addOrUpdateInDb(newShip);
        return newShip;
    }
    addAIShip(data, save = true) {
        const existing = this.ships.find((s) => s instanceof AIShip_1.AIShip && s.id === data.id);
        if (existing) {
            dist_1.default.log(`red`, `Attempted to add an existing ai ship.`);
            return existing;
        }
        dist_1.default.log(`gray`, `Adding AI ship ${data.name} to game`);
        const newShip = new AIShip_1.AIShip(data, this);
        this.ships.push(newShip);
        if (save)
            db_1.db.ship.addOrUpdateInDb(newShip);
        return newShip;
    }
    addPlanet(data) {
        const newPlanet = new Planet_1.Planet(data, this);
        this.planets.push(newPlanet);
        return newPlanet;
    }
    addFaction(data) {
        const newFaction = new Faction_1.Faction(data, this);
        this.factions.push(newFaction);
        return newFaction;
    }
    addCache(data, save = true) {
        const existing = this.caches.find((cache) => cache.id === data.id);
        if (existing) {
            dist_1.default.log(`red`, `Attempted to add an existing cache.`);
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