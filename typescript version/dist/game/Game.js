"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const common_1 = __importDefault(require("../common"));
const Planet_1 = require("./classes/Planet");
const Cache_1 = require("./classes/Cache");
const Faction_1 = require("./classes/Faction");
const HumanShip_1 = require("./classes/Ship/HumanShip");
const AIShip_1 = require("./classes/Ship/AIShip");
const planets_1 = __importDefault(require("./presets/planets"));
const factions_1 = __importDefault(require("./presets/factions"));
class Game {
    constructor() {
        // ------------- game loop --------------
        this.tickCount = 0;
        this.startTime = new Date();
        this.ships = [];
        this.planets = [];
        this.caches = [];
        this.factions = [];
        this.startGame();
    }
    identify() {
        common_1.default.log(`Game of ${common_1.default.GAME_NAME} started at ${this.startTime}, running for ${this.tickCount} ticks`);
        common_1.default.log(`${this.ships.length} ships, ${this.planets.length} planets, ${this.caches.length} caches`);
        this.planets.forEach((p) => p.identify());
        this.ships.forEach((s) => s.identify());
    }
    startGame() {
        common_1.default.log(`----- Starting Game -----`);
        planets_1.default.forEach((p) => {
            this.addPlanet(p);
        });
        factions_1.default.forEach((f) => {
            this.addFaction(f);
        });
        setInterval(() => this.tick(), common_1.default.TICK_INTERVAL);
    }
    tick() {
        this.tickCount++;
        this.ships.forEach((s) => s.tick());
    }
    // ------------- entity functions --------------
    addHumanShip(data) {
        const newShip = new HumanShip_1.HumanShip(data, this);
        common_1.default.log(`Adding human ship ${newShip.name} to game`);
        this.ships.push(newShip);
        return newShip;
    }
    addAIShip(data) {
        const newShip = new AIShip_1.AIShip(data, this);
        common_1.default.log(`Adding AI ship ${newShip.name} to game`);
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
}
exports.Game = Game;
//# sourceMappingURL=Game.js.map