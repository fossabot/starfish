"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const dist_1 = __importDefault(require("../../../common/dist"));
const io_1 = require("../server/io");
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
        this.tick();
    }
    // ----- general functions -----
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
        // ----- timing
        const elapsedTimeInMs = Date.now() - startTime;
        if (elapsedTimeInMs > 10) {
            if (elapsedTimeInMs < 30)
                dist_1.default.log(`Tick took`, 'yellow', elapsedTimeInMs + ` ms`);
            else
                dist_1.default.log(`Tick took`, 'red', elapsedTimeInMs + ` ms`);
        }
        dist_1.default.deltaTime = Date.now() - this.lastTickTime;
        const thisTickLag = dist_1.default.deltaTime - this.lastTickExpectedTime;
        this.averageTickLag = dist_1.default.lerp(this.averageTickLag, thisTickLag, 0.3);
        const nextTickTime = Math.min(dist_1.default.TICK_INTERVAL, dist_1.default.TICK_INTERVAL - this.averageTickLag);
        this.lastTickTime = startTime;
        this.lastTickExpectedTime = nextTickTime;
        setTimeout(() => this.tick(), nextTickTime);
        io_1.io.to('game').emit('game:tick', {
            deltaTime: dist_1.default.deltaTime,
            game: io_1.stubify(this),
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
    // ----- entity functions -----
    addHumanShip(data) {
        dist_1.default.log(`Adding human ship ${data.name} to game`);
        const newShip = new HumanShip_1.HumanShip(data, this);
        this.ships.push(newShip);
        return newShip;
    }
    addAIShip(data) {
        dist_1.default.log(`Adding AI ship ${data.name} to game`);
        const newShip = new AIShip_1.AIShip(data, this);
        this.ships.push(newShip);
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
    addCache(data) {
        const newCache = new Cache_1.Cache(data, this);
        this.caches.push(newCache);
        return newCache;
    }
    addAttackRemnant(data) {
        const newAttackRemnant = new AttackRemnant_1.AttackRemnant(data);
        this.attackRemnants.push(newAttackRemnant);
        return newAttackRemnant;
    }
}
exports.Game = Game;
//# sourceMappingURL=Game.js.map