"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const dist_1 = __importDefault(require("../../../common/dist"));
const events_1 = __importDefault(require("events"));
const Planet_1 = require("./classes/Planet");
const Cache_1 = require("./classes/Cache");
const Faction_1 = require("./classes/Faction");
const AttackRemnant_1 = require("./classes/AttackRemnant");
const HumanShip_1 = require("./classes/Ship/HumanShip");
const AIShip_1 = require("./classes/Ship/AIShip");
const planets_1 = __importDefault(require("./presets/planets"));
const factions_1 = __importDefault(require("./presets/factions"));
class Game extends events_1.default {
    constructor() {
        super();
        this.attackRemnants = [];
        this.lastTickTime = Date.now();
        // ----- game loop -----
        this.tickCount = 0;
        this.startTime = new Date();
        this.ships = [];
        this.planets = [];
        this.caches = [];
        this.factions = [];
        this.attackRemnants = [];
        this.startGame();
    }
    startGame() {
        this.emit('beforeStart');
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
        this.emit('tick');
        // ----- timing
        const elapsedTimeInMs = Date.now() - startTime;
        if (elapsedTimeInMs > 10) {
            if (elapsedTimeInMs < 30)
                dist_1.default.log(`Tick took`, 'yellow', elapsedTimeInMs + ` ms`);
            else
                dist_1.default.log(`Tick took`, 'red', elapsedTimeInMs + ` ms`);
        }
        dist_1.default.deltaTime = Date.now() - this.lastTickTime;
        this.lastTickTime = startTime;
        setTimeout(() => this.tick(), Math.min(dist_1.default.TICK_INTERVAL, Math.max(1, dist_1.default.TICK_INTERVAL - (dist_1.default.deltaTime - dist_1.default.TICK_INTERVAL))));
    }
    // ----- scan function -----
    scanCircle(center, radius, type) {
        let ships = [], planets = [], caches = [];
        if (!type || type === `ship`)
            ships = this.ships.filter((s) => dist_1.default.pointIsInsideCircle(center, s.location, radius));
        if (!type || type === `planet`)
            planets = this.planets.filter((p) => dist_1.default.pointIsInsideCircle(center, p.location, radius));
        if (!type || type === `cache`)
            caches = this.caches.filter((k) => dist_1.default.pointIsInsideCircle(center, k.location, radius));
        return { ships, planets, caches };
    }
    // ----- entity functions -----
    addHumanShip(data) {
        const newShip = new HumanShip_1.HumanShip(data, this);
        dist_1.default.log(`Adding human ship ${newShip.name} to game`);
        this.ships.push(newShip);
        return newShip;
    }
    addAIShip(data) {
        const newShip = new AIShip_1.AIShip(data, this);
        dist_1.default.log(`Adding AI ship ${newShip.name} to game`);
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