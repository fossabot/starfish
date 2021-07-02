"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const dist_1 = __importDefault(require("../../../common/dist"));
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
class Game {
    constructor() {
        this.ships = [];
        this.planets = [];
        this.caches = [];
        this.factions = [];
        this.species = [];
        this.attackRemnants = [];
        this.factionRankings = [];
        // ----- game loop -----
        this.tickCount = 0;
        this.lastTickTime = Date.now();
        this.lastTickExpectedTime = 0;
        this.averageTickLag = 0;
        this.averageWorstShipTickLag = 0;
        this.averageTickTime = 0;
        this.startTime = new Date();
        Object.values(factions_1.default).forEach((fd) => this.addFaction(fd));
        Object.values(dist_1.default.species).map((sd) => this.addSpecies(sd));
        dist_1.default.log(`Loaded ${Object.keys(dist_1.default.species).length} species and ${Object.keys(factions_1.default).length} factions.`);
    }
    startGame() {
        dist_1.default.log(`----- Starting Game -----`);
        setInterval(() => this.save(), Game.saveTimeInterval);
        setInterval(() => this.daily(), 24 * 60 * 60 * 1000);
        this.tick();
        this.recalculateFactionRankings();
    }
    async save() {
        dist_1.default.log(`gray`, `----- Saving Game ----- (Tick avg: ${dist_1.default.r2(this.averageTickTime, 2)}ms, Worst human ship avg: ${dist_1.default.r2(this.averageWorstShipTickLag, 2)}ms)`);
        const promises = [];
        this.ships.forEach((s) => {
            promises.push(db_1.db.ship.addOrUpdateInDb(s));
        });
        await Promise.all(promises);
        this.recalculateFactionRankings();
    }
    async daily() {
        dist_1.default.log(`gray`, `----- Running Daily Tasks -----`);
        // remove inactive ships
        const inactiveCutoff = 14 * 24 * 60 * 60 * 1000; // 2 weeks
        const ic = Date.now() - inactiveCutoff;
        for (let inactiveShip of this.humanShips.filter((s) => !s.crewMembers.find((c) => c.lastActive > ic)))
            this.removeShip(inactiveShip);
        this.recalculateFactionRankings();
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
        const times = [];
        this.ships.forEach((s) => {
            const start = Date.now();
            s.tick();
            const time = Date.now() - start;
            times.push({ ship: s, time });
        });
        if (times.length)
            this.averageWorstShipTickLag = dist_1.default.lerp(this.averageWorstShipTickLag, times.sort((a, b) => b.time - a.time)[0].time || 0, 0.1);
        // c.log(times.map((s) => s.ship.name + ` ` + s.time))
        this.planets.forEach((p) => {
            p.toUpdate = {};
        });
        this.expireOldAttackRemnantsAndCaches();
        this.spawnNewCaches();
        this.spawnNewAIs();
        this.spawnNewPlanet();
        // ----- timing
        dist_1.default.deltaTime = Date.now() - this.lastTickTime;
        const thisTickLag = dist_1.default.deltaTime - this.lastTickExpectedTime;
        this.averageTickLag = dist_1.default.lerp(this.averageTickLag, thisTickLag, 0.1);
        const nextTickTime = Math.min(dist_1.default.TICK_INTERVAL, dist_1.default.TICK_INTERVAL - this.averageTickLag);
        this.lastTickTime = startTime;
        this.lastTickExpectedTime = nextTickTime;
        // ----- schedule next tick -----
        setTimeout(() => this.tick(), nextTickTime);
        //   // ----- notify watchers -----
        // io.to(`game`).emit(`game:tick`, {
        //   deltaTime: c.deltaTime,
        //   game: c.stubify<Game, GameStub>(this),
        // })
        const elapsedTimeInMs = Date.now() - startTime;
        if (elapsedTimeInMs > 50) {
            if (elapsedTimeInMs < 100)
                dist_1.default.log(`Tick took`, `yellow`, elapsedTimeInMs + ` ms`);
            else
                dist_1.default.log(`Tick took`, `red`, elapsedTimeInMs + ` ms`);
        }
        this.averageTickTime = dist_1.default.lerp(this.averageTickTime, elapsedTimeInMs, 0.1);
    }
    // ----- scan function -----
    // todo mega-optimize this with a chunks system
    scanCircle(center, radius, ignoreSelf, types, includeTrails = false, tutorial = false) {
        let ships = [], trails = [], planets = [], caches = [], attackRemnants = [];
        if (!types || types.includes(`ship`))
            ships = this.ships.filter((s) => {
                if (s.onlyVisibleToShipId &&
                    ignoreSelf &&
                    s.onlyVisibleToShipId !== ignoreSelf)
                    return false;
                if (tutorial && !s.onlyVisibleToShipId)
                    return false;
                if (s.id === ignoreSelf)
                    return false;
                if (dist_1.default.pointIsInsideCircle(center, s.location, radius))
                    return true;
                return false;
            });
        if ((!types || types.includes(`trail`)) &&
            includeTrails)
            trails = this.ships
                .filter((s) => {
                if (tutorial)
                    return false;
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
                .map((s) => [...s.previousLocations, s.location]);
        if (!types || types.includes(`planet`))
            planets = this.planets.filter((p) => dist_1.default.pointIsInsideCircle(center, p.location, radius));
        if (!types || types.includes(`cache`))
            caches = this.caches.filter((k) => {
                if (k.onlyVisibleToShipId &&
                    ignoreSelf &&
                    k.onlyVisibleToShipId !== ignoreSelf)
                    return false;
                return dist_1.default.pointIsInsideCircle(center, k.location, radius);
            });
        if (!types || types.includes(`attackRemnant`))
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
        return Math.max(5, Math.sqrt(count) * 2);
    }
    get gameSoftArea() {
        return Math.PI * this.gameSoftRadius ** 2;
    }
    // ----- tick helpers -----
    expireOldAttackRemnantsAndCaches() {
        const attackRemnantExpirationTime = Date.now() - dist_1.default.attackRemnantExpireTime;
        this.attackRemnants.forEach((ar, index) => {
            if (attackRemnantExpirationTime > ar.time) {
                this.removeAttackRemnant(ar);
            }
        });
        const cacheExpirationTime = Date.now() - dist_1.default.cacheExpireTime;
        this.caches.forEach((c, index) => {
            if (cacheExpirationTime > c.time) {
                this.removeCache(c);
            }
        });
    }
    spawnNewPlanet() {
        while (this.planets.length < this.gameSoftArea * 0.7 ||
            this.planets.length < this.factions.length - 1) {
            const factionThatNeedsAHomeworld = this.factions.find((f) => f.id !== `red` && !f.homeworld);
            const p = planets_1.generatePlanet(this, factionThatNeedsAHomeworld?.id);
            if (!p)
                return;
            const planet = this.addPlanet(p);
            dist_1.default.log(`gray`, `Spawned planet ${planet.name} at ${planet.location}${factionThatNeedsAHomeworld
                ? ` (${factionThatNeedsAHomeworld.id} faction homeworld)`
                : ``}.`);
            // c.log(this.planets.map((p) => p.vendor.items))
            // c.log(this.planets.map((p) => p.vendor.chassis))
            // c.log(this.planets.map((p) => p.vendor.cargo))
            // c.log(this.planets.map((p) => p.priceFluctuator))
        }
    }
    spawnNewCaches() {
        while (this.caches.length < this.gameSoftArea * 1.5) {
            const type = dist_1.default.randomFromArray(dist_1.default.cargoTypes);
            const amount = Math.round(Math.random() * 200) / 10 + 1;
            const location = dist_1.default.randomInsideCircle(this.gameSoftRadius);
            const message = Math.random() > 0.9
                ? dist_1.default.randomFromArray([
                    `Your lack of fear is based on your ignorance.`,
                    `Rationality was powerless.`,
                    `Time is the cruelest force of all.`,
                    `“We'll send only a brain," he said.`,
                    `Fate lies within the light cone.`,
                    `The universe is but a corpse puffing up.`,
                    `It's easy to be led to the abyss.`,
                    `In fundamental theory, one must be stupid.`,
                    `Let's go drinking.`,
                    `Go back to sleep like good bugs.`,
                    `Any planet is 'Earth' to those that live on it.`,
                    `The easiest way to solve a problem is to deny it exists.`,
                    `It pays to be obvious.`,
                    `All evil is good become cancerous.`,
                    `I've no sympathy at all.`,
                    `Theft is property.`,
                    `Pretend that you have free will.`,
                ])
                : undefined;
            this.addCache({
                contents: [
                    {
                        type,
                        amount,
                    },
                ],
                location,
                message,
            });
            dist_1.default.log(`gray`, `Spawned random cache of ${amount} ${type} at ${location}.`);
        }
    }
    spawnNewAIs() {
        while (this.ships.length &&
            this.aiShips.length < this.gameSoftArea * 1.3) {
            let radius = this.gameSoftRadius;
            let spawnPoint;
            while (!spawnPoint) {
                let point = dist_1.default.randomInsideCircle(radius);
                // c.log(point)
                const tooClose = this.humanShips.find((hs) => dist_1.default.pointIsInsideCircle(point, hs.location, 0.1));
                if (tooClose)
                    spawnPoint = undefined;
                else
                    spawnPoint = point;
                radius += 0.1;
            }
            const level = dist_1.default.distance([0, 0], spawnPoint) * 2 + 0.1;
            const species = dist_1.default.randomFromArray(this.species
                .filter((s) => s.faction.id === `red`)
                .map((s) => s.id));
            this.addAIShip({
                location: spawnPoint,
                name: `${dist_1.default.capitalize(species.substring(0, species.length - 1))}${`${Math.random().toFixed(3)}`.substring(2)}`,
                species: {
                    id: species,
                },
                level,
                headerBackground: `ai.jpg`,
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
        // c.log(
        //   `gray`,
        //   `Adding human ship ${data.name} to game at ${data.location}`,
        // )
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
        // c.log(
        //   `gray`,
        //   `Adding level ${data.level} AI ship ${data.name} to game at ${data.location}`,
        // )
        const newShip = new AIShip_1.AIShip(data, this);
        this.ships.push(newShip);
        if (save)
            db_1.db.ship.addOrUpdateInDb(newShip);
        return newShip;
    }
    removeShip(ship) {
        dist_1.default.log(`Removing ship ${ship.name} from the game.`);
        db_1.db.ship.removeFromDb(ship.id);
        if (ship.tutorial)
            ship.tutorial.cleanUp();
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
        // c.log(`adding`, newCache)
        if (save)
            db_1.db.cache.addOrUpdateInDb(newCache);
        return newCache;
    }
    removeCache(cache) {
        dist_1.default.log(`Removing cache ${cache.id} from the game.`);
        db_1.db.cache.removeFromDb(cache.id);
        const index = this.caches.findIndex((ec) => cache.id === ec.id);
        if (index === -1)
            return dist_1.default.log(`Failed to find cache in list.`);
        this.caches.splice(index, 1);
        // c.log(this.caches.length, `remaining`)
    }
    addAttackRemnant(data, save = true) {
        const newAttackRemnant = new AttackRemnant_1.AttackRemnant(data);
        this.attackRemnants.push(newAttackRemnant);
        if (save)
            db_1.db.attackRemnant.addOrUpdateInDb(newAttackRemnant);
        return newAttackRemnant;
    }
    removeAttackRemnant(ar) {
        dist_1.default.log(`Removing attack remnant ${ar.id} from the game.`);
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
    recalculateFactionRankings() {
        // credits
        let topCreditsShips = [];
        const creditsScores = [];
        for (let faction of this.factions) {
            if (faction.id === `red`)
                continue;
            let total = 0;
            faction.members.forEach((s) => {
                let shipTotal = s.commonCredits || 0;
                for (let cm of s.crewMembers) {
                    shipTotal += cm.credits;
                }
                topCreditsShips.push({
                    name: s.name,
                    color: faction.color,
                    score: shipTotal,
                });
                total += shipTotal;
            });
            creditsScores.push({
                faction: dist_1.default.stubify(faction, [
                    `members`,
                ]),
                score: total,
            });
        }
        topCreditsShips = topCreditsShips
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);
        // control
        const controlScores = [];
        for (let faction of this.factions) {
            if (faction.id === `red`)
                continue;
            controlScores.push({
                faction: dist_1.default.stubify(faction, [
                    `members`,
                ]),
                score: 0,
            });
        }
        for (let planet of this.planets) {
            planet.allegiances.forEach((a) => {
                if (a.faction.id === `red`)
                    return;
                const found = controlScores.find((s) => s.faction.id === a.faction.id);
                if (!found)
                    return;
                found.score += a.level;
            });
        }
        this.factionRankings = [
            {
                category: `credits`,
                scores: creditsScores.sort((a, b) => b.score - a.score),
                top: topCreditsShips,
            },
            {
                category: `control`,
                scores: controlScores.sort((a, b) => b.score - a.score),
            },
        ];
        // c.log(JSON.stringify(this.factionRankings, null, 2))
        this.humanShips.forEach((hs) => (hs.toUpdate.factionRankings =
            this.factionRankings));
    }
}
exports.Game = Game;
Game.saveTimeInterval = 1 * 60 * 1000;
//# sourceMappingURL=Game.js.map