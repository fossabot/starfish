"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const dist_1 = __importDefault(require("../../../common/dist"));
const io_1 = __importDefault(require("../server/io"));
const db_1 = require("../db");
const Cache_1 = require("./classes/Cache");
const Faction_1 = require("./classes/Faction");
const Species_1 = require("./classes/Species");
const AttackRemnant_1 = require("./classes/AttackRemnant");
const Zone_1 = require("./classes/Zone");
const ChunkManager_1 = require("./classes/Chunks/ChunkManager");
const HumanShip_1 = require("./classes/Ship/HumanShip");
const AIShip_1 = require("./classes/Ship/AIShip");
const planets_1 = require("./presets/planets");
const zones_1 = require("./presets/zones");
const BasicPlanet_1 = require("./classes/Planet/BasicPlanet");
const MiningPlanet_1 = require("./classes/Planet/MiningPlanet");
const gameSettings_1 = __importDefault(require("./presets/gameSettings"));
class Game {
    constructor() {
        this.ships = [];
        this.planets = [];
        this.caches = [];
        this.zones = [];
        this.factions = [];
        this.species = [];
        this.attackRemnants = [];
        this.chunkManager = new ChunkManager_1.ChunkManager();
        this.factionRankings = [];
        this.paused = false;
        // ----- game loop -----
        this.tickCount = 0;
        this.lastTickTime = Date.now();
        this.lastTickExpectedTime = 0;
        this.averageTickLag = 0;
        this.averageWorstShipTickLag = 0;
        this.averageTickTime = 0;
        this.startTime = Date.now();
        this.settings = (0, gameSettings_1.default)();
        Object.values(dist_1.default.factions).forEach((fd) => this.addFaction(fd));
        Object.values(dist_1.default.species).map((sd) => this.addSpecies(sd));
        dist_1.default.log(`Loaded ${Object.keys(dist_1.default.species).length} species and ${Object.keys(dist_1.default.factions).length} factions.`);
        // setTimeout(() => {
        //   c.log(
        //     this.chunkManager.getElementsWithinRadius(
        //       [0, 0],
        //       0.1,
        //     ).length,
        //   )
        // }, 1000)
    }
    setSettings(newSettings) {
        this.settings = {
            ...(0, gameSettings_1.default)(),
            ...this.settings,
            ...newSettings,
        };
        db_1.db.gameSettings.addOrUpdateInDb(this.settings);
    }
    startGame() {
        dist_1.default.log(`----- Starting Game -----`);
        setInterval(() => this.save(), Game.saveTimeInterval);
        setInterval(() => this.daily(), 24 * 60 * 60 * 1000);
        this.tick();
        this.recalculateFactionRankings();
    }
    async save() {
        if (this.paused)
            return;
        const saveStartTime = Date.now();
        const promises = [];
        this.planets.forEach((p) => {
            promises.push(db_1.db.planet.addOrUpdateInDb(p));
        });
        await Promise.all(promises);
        // * we were doing it this way but at a certain point we got a stack overflow (I think this was the cause)
        // this.ships.forEach((s) => {
        //   promises.push(db.ship.addOrUpdateInDb(s))
        // })
        for (let s of this.ships) {
            await db_1.db.ship.addOrUpdateInDb(s);
        }
        this.recalculateFactionRankings();
        dist_1.default.log(`gray`, `----- Saved Game in ${dist_1.default.r2((Date.now() - saveStartTime) / 1000)}s ----- (Tick avg: ${dist_1.default.r2(this.averageTickTime, 2)}ms, Worst human ship avg: ${dist_1.default.r2(this.averageWorstShipTickLag, 2)}ms)`);
    }
    async daily() {
        if (this.paused)
            return;
        dist_1.default.log(`gray`, `----- Running Daily Tasks -----`);
        // remove inactive ships
        const inactiveCutoff = 14 * 24 * 60 * 60 * 1000; // 2 weeks
        const ic = Date.now() - inactiveCutoff;
        for (let inactiveShip of this.humanShips.filter((s) => !s.crewMembers.find((c) => c.lastActive > ic)))
            this.removeShip(inactiveShip);
        this.recalculateFactionRankings();
    }
    tick() {
        if (this.paused)
            return setTimeout(() => this.tick(), dist_1.default.tickInterval);
        // c.log(`tick`, Date.now() - this.lastTickTime)
        const tickStartTime = Date.now();
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
        this.spawnNewPlanets();
        this.spawnNewZones();
        // ----- timing
        const tickDoneTime = Date.now();
        dist_1.default.deltaTime = tickDoneTime - this.lastTickTime;
        const thisTickLag = dist_1.default.deltaTime - dist_1.default.tickInterval;
        this.averageTickLag = dist_1.default.lerp(this.averageTickLag, thisTickLag, 0.1);
        const nextTickTime = Math.min(dist_1.default.tickInterval, dist_1.default.tickInterval - this.averageTickLag);
        this.lastTickTime = tickStartTime;
        this.lastTickExpectedTime = nextTickTime;
        // ----- schedule next tick -----
        setTimeout(() => this.tick(), nextTickTime);
        //   // ----- notify watchers -----
        // io.to(`game`).emit(`game:tick`, {
        //   deltaTime: c.deltaTime,
        //   game: c.stubify<Game, GameStub>(this),
        // })
        const elapsedTimeInMs = tickDoneTime - tickStartTime;
        // c.log(`Tick: ${c.r2(elapsedTimeInMs)}ms`)
        // if (elapsedTimeInMs > 100) {
        //   if (elapsedTimeInMs < 200)
        //     c.log(
        //       `Tick took`,
        //       `yellow`,
        //       elapsedTimeInMs + ` ms`,
        //     )
        //   else
        //     c.log(`Tick took`, `red`, elapsedTimeInMs + ` ms`)
        // }
        this.averageTickTime = dist_1.default.lerp(this.averageTickTime, elapsedTimeInMs, 0.1);
    }
    // ----- scan function -----
    // todo optimize this with a chunks system
    scanCircle(center, radius, ignoreSelf, types, includeTrails = false, tutorial = false) {
        let ships = [], trails = [], planets = [], caches = [], attackRemnants = [], zones = [];
        const method = `chunks1`; // * this is just to compare scan algorithms. with about 1500 ships, original took 220ms, original2 took 48ms, chunks1 took 13ms
        if (method === `chunks1`) {
            const visible = this.chunkManager.getElementsWithinRadius(center, radius);
            if (!types || types.includes(`humanShip`))
                ships.push(...visible.filter((s) => s.type === `ship` && s.ai === false).filter((s) => {
                    if (s.onlyVisibleToShipId &&
                        ((ignoreSelf &&
                            s.onlyVisibleToShipId !== ignoreSelf) ||
                            !ignoreSelf))
                        return false;
                    if (tutorial && !s.onlyVisibleToShipId)
                        return false;
                    if (s.tutorial &&
                        s.id !== ignoreSelf &&
                        !tutorial)
                        return false;
                    if (s.id === ignoreSelf)
                        return false;
                    if (dist_1.default.pointIsInsideCircle(center, s.location, radius))
                        return true;
                    return false;
                }));
            if (!types || types.includes(`aiShip`))
                ships.push(...visible.filter((s) => s.type === `ship` && s.ai === true).filter((s) => {
                    if (s.onlyVisibleToShipId &&
                        ((ignoreSelf &&
                            s.onlyVisibleToShipId !== ignoreSelf) ||
                            !ignoreSelf))
                        return false;
                    if (tutorial && !s.onlyVisibleToShipId)
                        return false;
                    if (s.tutorial &&
                        s.id !== ignoreSelf &&
                        !tutorial)
                        return false;
                    if (s.id === ignoreSelf)
                        return false;
                    if (dist_1.default.pointIsInsideCircle(center, s.location, radius))
                        return true;
                    return false;
                }));
            if ((!types || types.includes(`trail`)) &&
                includeTrails) {
                const showColors = includeTrails === `withColors`;
                trails = visible.filter((s) => s.type === `ship`)
                    .filter((s) => {
                    if (tutorial)
                        return false;
                    if (s.tutorial)
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
                    .map((s) => {
                    return {
                        color: showColors
                            ? s.faction.color
                            : undefined,
                        points: [
                            ...s.previousLocations,
                            s.location,
                        ],
                    };
                });
            }
            if (!types || types.includes(`planet`))
                planets = visible.filter((s) => s.type === `planet`).filter((p) => dist_1.default.pointIsInsideCircle(center, p.location, radius));
            if (!types || types.includes(`cache`))
                caches = visible.filter((s) => s.type === `cache`).filter((k) => {
                    if (k.onlyVisibleToShipId &&
                        ignoreSelf &&
                        k.onlyVisibleToShipId !== ignoreSelf)
                        return false;
                    return dist_1.default.pointIsInsideCircle(center, k.location, radius);
                });
            if (!types || types.includes(`attackRemnant`))
                attackRemnants = visible.filter((s) => s.type === `attackRemnant`).filter((a) => {
                    if (a.onlyVisibleToShipId &&
                        ignoreSelf &&
                        a.onlyVisibleToShipId !== ignoreSelf)
                        return false;
                    return (dist_1.default.pointIsInsideCircle(center, a.start, radius) ||
                        dist_1.default.pointIsInsideCircle(center, a.end, radius));
                });
            if (!types || types.includes(`zone`))
                zones = visible.filter((s) => s.type === `zone`).filter((z) => {
                    return (dist_1.default.distance(center, z.location) - z.radius <=
                        radius);
                });
        }
        if (method === `original2`) {
            if (!types || types.includes(`humanShip`))
                ships.push(...this.humanShips.filter((s) => {
                    if (s.onlyVisibleToShipId &&
                        ((ignoreSelf &&
                            s.onlyVisibleToShipId !== ignoreSelf) ||
                            !ignoreSelf))
                        return false;
                    if (tutorial && !s.onlyVisibleToShipId)
                        return false;
                    if (s.tutorial &&
                        s.id !== ignoreSelf &&
                        !tutorial)
                        return false;
                    if (s.id === ignoreSelf)
                        return false;
                    if (dist_1.default.pointIsInsideCircle(center, s.location, radius))
                        return true;
                    return false;
                }));
            if (!types || types.includes(`aiShip`))
                ships.push(...this.aiShips.filter((s) => {
                    if (s.onlyVisibleToShipId &&
                        ((ignoreSelf &&
                            s.onlyVisibleToShipId !== ignoreSelf) ||
                            !ignoreSelf))
                        return false;
                    if (tutorial && !s.onlyVisibleToShipId)
                        return false;
                    if (s.tutorial &&
                        s.id !== ignoreSelf &&
                        !tutorial)
                        return false;
                    if (s.id === ignoreSelf)
                        return false;
                    if (dist_1.default.pointIsInsideCircle(center, s.location, radius))
                        return true;
                    return false;
                }));
            if ((!types || types.includes(`trail`)) &&
                includeTrails) {
                const showColors = includeTrails === `withColors`;
                trails = this.ships
                    .filter((s) => {
                    if (tutorial)
                        return false;
                    if (s.tutorial)
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
                    .map((s) => {
                    return {
                        color: showColors
                            ? s.faction.color
                            : undefined,
                        points: [
                            ...s.previousLocations,
                            s.location,
                        ],
                    };
                });
            }
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
                attackRemnants = this.attackRemnants.filter((a) => {
                    if (a.onlyVisibleToShipId &&
                        ignoreSelf &&
                        a.onlyVisibleToShipId !== ignoreSelf)
                        return false;
                    return (dist_1.default.pointIsInsideCircle(center, a.start, radius) ||
                        dist_1.default.pointIsInsideCircle(center, a.end, radius));
                });
            if (!types || types.includes(`zone`))
                zones = this.zones.filter((z) => {
                    return (dist_1.default.distance(center, z.location) - z.radius <=
                        radius);
                });
        }
        if (method === `original`) {
            if (!types ||
                types.includes(`humanShip`) ||
                types.includes(`aiShip`))
                ships.push(...this.ships.filter((s) => {
                    if (s.onlyVisibleToShipId &&
                        ((ignoreSelf &&
                            s.onlyVisibleToShipId !== ignoreSelf) ||
                            !ignoreSelf))
                        return false;
                    if (tutorial && !s.onlyVisibleToShipId)
                        return false;
                    if (s.tutorial &&
                        s.id !== ignoreSelf &&
                        !tutorial)
                        return false;
                    if (s.id === ignoreSelf)
                        return false;
                    if (dist_1.default.pointIsInsideCircle(center, s.location, radius))
                        return true;
                    return false;
                }));
            if ((!types || types.includes(`trail`)) &&
                includeTrails) {
                const showColors = includeTrails === `withColors`;
                trails = this.ships
                    .filter((s) => {
                    if (tutorial)
                        return false;
                    if (s.tutorial)
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
                    .map((s) => {
                    return {
                        color: showColors
                            ? s.faction.color
                            : undefined,
                        points: [
                            ...s.previousLocations,
                            s.location,
                        ],
                    };
                });
            }
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
                attackRemnants = this.attackRemnants.filter((a) => {
                    if (a.onlyVisibleToShipId &&
                        ignoreSelf &&
                        a.onlyVisibleToShipId !== ignoreSelf)
                        return false;
                    return (dist_1.default.pointIsInsideCircle(center, a.start, radius) ||
                        dist_1.default.pointIsInsideCircle(center, a.end, radius));
                });
            if (!types || types.includes(`zone`))
                zones = this.zones.filter((z) => {
                    return (dist_1.default.distance(center, z.location) - z.radius <=
                        radius);
                });
        }
        return {
            ships,
            trails,
            planets,
            caches,
            attackRemnants,
            zones,
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
    async spawnNewPlanets() {
        while (this.planets.length <
            this.gameSoftArea * this.settings.planetDensity ||
            this.planets.length < this.factions.length - 1) {
            const weights = [
                { weight: 0.6, value: `basic` },
                { weight: 0.35, value: `mining` },
            ];
            const selection = dist_1.default.randomWithWeights(weights);
            // ----- basic planet -----
            if (selection === `basic`) {
                const factionThatNeedsAHomeworld = this.factions.find((f) => f.id !== `red` && !f.homeworld);
                const p = (0, planets_1.generateBasicPlanet)(this, factionThatNeedsAHomeworld?.id);
                if (!p)
                    continue;
                const planet = await this.addBasicPlanet(p);
                dist_1.default.log(`gray`, `Spawned basic planet ${planet.name} at ${planet.location
                    .map((l) => dist_1.default.r2(l))
                    .join(`, `)}${factionThatNeedsAHomeworld
                    ? ` (${factionThatNeedsAHomeworld.id} faction homeworld)`
                    : ``}.`);
                // c.log(this.planets.map((p) => p.vendor.items))
                // c.log(this.planets.map((p) => p.vendor.chassis))
                // c.log(this.planets.map((p) => p.vendor.cargo))
                // c.log(this.planets.map((p) => p.priceFluctuator))
            }
            else if (selection === `mining`) {
                const p = (0, planets_1.generateMiningPlanet)(this);
                if (!p)
                    continue;
                const planet = await this.addMiningPlanet(p);
                dist_1.default.log(`gray`, `Spawned mining planet ${planet.name} at ${planet.location}.`);
            }
        }
    }
    async spawnNewZones() {
        while (this.zones.length <
            this.gameSoftArea * this.settings.zoneDensity) {
            const z = (0, zones_1.generateZoneData)(this);
            if (!z)
                return;
            const zone = await this.addZone(z);
            dist_1.default.log(`gray`, `Spawned zone ${zone.name} at ${zone.location.map((l) => dist_1.default.r2(l))} of radius ${dist_1.default.r2(zone.radius)} and intensity ${dist_1.default.r2(zone.effects[0].intensity)}.`);
        }
    }
    spawnNewCaches() {
        while (this.caches.length <
            this.gameSoftArea * this.settings.cacheDensity) {
            const id = dist_1.default.randomFromArray([
                ...Object.keys(dist_1.default.cargo),
                `credits`,
            ]);
            const amount = id === `credits`
                ? Math.round(Math.random() * 5000 + 1)
                : Math.round(Math.random() * 20 + 1);
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
                        id,
                        amount,
                    },
                ],
                location,
                message,
            });
            dist_1.default.log(`gray`, `Spawned random cache of ${amount} ${id} at ${location}.`);
        }
    }
    spawnNewAIs() {
        while (this.ships.length &&
            this.aiShips.length <
                this.gameSoftArea * this.settings.aiShipDensity) {
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
    async addHumanShip(data, save = true) {
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
        this.chunkManager.addOrUpdate(newShip);
        if (save)
            await db_1.db.ship.addOrUpdateInDb(newShip);
        return newShip;
    }
    async addAIShip(data, save = true) {
        const existing = this.ships.find((s) => s && s instanceof AIShip_1.AIShip && s.id === data.id);
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
        this.chunkManager.addOrUpdate(newShip);
        if (save)
            await db_1.db.ship.addOrUpdateInDb(newShip);
        return newShip;
    }
    async removeShip(ship) {
        if (typeof ship === `string`) {
            const foundShip = this.ships.find((s) => s.id === ship);
            if (!foundShip) {
                dist_1.default.log(`red`, `Attempted to remove a ship that does not exist from the game.`, ship);
                return;
            }
            ship = foundShip;
        }
        // remove all tutorial ships for members of this ship
        for (let cm of ship.crewMembers) {
            if (cm.tutorialShipId) {
                const tutorialShip = this.ships.find((s) => s.id === cm.tutorialShipId);
                if (tutorialShip) {
                    // c.log(`Removing excess tutorial ship`)
                    await tutorialShip.tutorial?.cleanUp();
                }
            }
        }
        dist_1.default.log(`Removing ship ${ship.name} (${ship.id}) from the game.`);
        await db_1.db.ship.removeFromDb(ship.id);
        const index = this.ships.findIndex((ec) => ship.id === ec.id);
        if (index === -1)
            return;
        this.ships.splice(index, 1);
        this.chunkManager.remove(ship);
        if (!ship.tutorial)
            ship.crewMembers.forEach((cm) => {
                io_1.default.to(`user:${cm.id}`).emit(`user:reloadShips`);
            });
        ship.tutorial?.cleanUp();
        // c.log(
        //   this.humanShips.length,
        //   (
        //     await (
        //       await db.ship.getAllConstructible()
        //     ).filter((s) => s.ai === false)
        //   ).map((s) => s.id),
        // )
    }
    async addBasicPlanet(data, save = true) {
        const existing = this.planets.find((p) => p.name === data.name);
        if (existing) {
            dist_1.default.log(`red`, `Attempted to add existing planet ${existing.name}.`);
            return existing;
        }
        const newPlanet = await new BasicPlanet_1.BasicPlanet(data, this);
        this.planets.push(newPlanet);
        this.chunkManager.addOrUpdate(newPlanet);
        if (`homeworld` in newPlanet && newPlanet.homeworld)
            newPlanet.homeworld.homeworld =
                newPlanet;
        if (save)
            await db_1.db.planet.addOrUpdateInDb(newPlanet);
        return newPlanet;
    }
    async addMiningPlanet(data, save = true) {
        const existing = this.planets.find((p) => p.name === data.name);
        if (existing) {
            dist_1.default.log(`red`, `Attempted to add existing planet ${existing.name}.`);
            return existing;
        }
        const newPlanet = await new MiningPlanet_1.MiningPlanet(data, this);
        this.planets.push(newPlanet);
        this.chunkManager.addOrUpdate(newPlanet);
        if (save)
            await db_1.db.planet.addOrUpdateInDb(newPlanet);
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
    async addCache(data, save = true) {
        const existing = this.caches.find((cache) => cache.id === data.id);
        if (existing) {
            dist_1.default.log(`red`, `Attempted to add existing cache (${existing.id}).`);
            return existing;
        }
        const newCache = new Cache_1.Cache(data, this);
        this.caches.push(newCache);
        this.chunkManager.addOrUpdate(newCache);
        // c.log(`adding`, newCache)
        if (save)
            await db_1.db.cache.addOrUpdateInDb(newCache);
        return newCache;
    }
    removeCache(cache) {
        dist_1.default.log(`Removing cache ${cache.id} from the game.`);
        db_1.db.cache.removeFromDb(cache.id);
        const index = this.caches.findIndex((ec) => cache.id === ec.id);
        if (index === -1)
            return dist_1.default.log(`Failed to find cache in list.`);
        this.caches.splice(index, 1);
        this.chunkManager.remove(cache);
        // c.log(this.caches.length, `remaining`)
    }
    async addZone(data, save = true) {
        const existing = this.zones.find((zone) => zone.id === data.id);
        if (existing) {
            dist_1.default.log(`red`, `Attempted to add existing zone (${existing.id}).`);
            return existing;
        }
        const newZone = new Zone_1.Zone(data, this);
        this.zones.push(newZone);
        this.chunkManager.addOrUpdate(newZone);
        if (save)
            await db_1.db.zone.addOrUpdateInDb(newZone);
        return newZone;
    }
    removeZone(zone) {
        dist_1.default.log(`Removing zone ${zone.name} from the game.`);
        this.humanShips.forEach((hs) => {
            const seenThisZone = hs.seenLandmarks.findIndex((lm) => lm.type === `zone` && lm.id === zone.id);
            if (seenThisZone !== -1) {
                hs.seenLandmarks.splice(seenThisZone, 1);
                hs.toUpdate.seenLandmarks = hs.seenLandmarks.map((z) => z.toVisibleStub());
            }
        });
        db_1.db.zone.removeFromDb(zone.id);
        this.chunkManager.remove(zone);
        const index = this.zones.findIndex((z) => zone.id === z.id);
        if (index === -1)
            return;
        this.zones.splice(index, 1);
    }
    addAttackRemnant(data, save = true) {
        const newAttackRemnant = new AttackRemnant_1.AttackRemnant(data);
        this.attackRemnants.push(newAttackRemnant);
        this.chunkManager.addOrUpdate(newAttackRemnant);
        if (save)
            db_1.db.attackRemnant.addOrUpdateInDb(newAttackRemnant);
        return newAttackRemnant;
    }
    removeAttackRemnant(ar) {
        // c.log(`Removing attack remnant ${ar.id} from the game.`)
        db_1.db.attackRemnant.removeFromDb(ar.id);
        const index = this.attackRemnants.findIndex((eAr) => ar.id === eAr.id);
        if (index === -1)
            return;
        this.attackRemnants.splice(index, 1);
        this.chunkManager.remove(ar);
    }
    get humanShips() {
        return this.ships.filter((s) => s instanceof HumanShip_1.HumanShip);
    }
    get aiShips() {
        return this.ships.filter((s) => s instanceof AIShip_1.AIShip);
    }
    get basicPlanets() {
        return this.planets.filter((p) => p instanceof BasicPlanet_1.BasicPlanet);
    }
    get miningPlanets() {
        return this.planets.filter((p) => p instanceof MiningPlanet_1.MiningPlanet);
    }
    recalculateFactionRankings() {
        // netWorth
        let topNetWorthShips = [];
        const netWorthScores = [];
        for (let faction of this.factions) {
            if (faction.id === `red`)
                continue;
            let total = 0;
            faction.members
                .filter((s) => !s.tutorial)
                .forEach((s) => {
                let shipTotal = s.commonCredits || 0;
                for (let cm of s.crewMembers) {
                    shipTotal += cm.credits;
                }
                for (let i of s.items) {
                    shipTotal += dist_1.default.items[i.type][i.id].basePrice;
                }
                topNetWorthShips.push({
                    name: s.name,
                    color: faction.color,
                    score: shipTotal,
                });
                total += shipTotal;
            });
            netWorthScores.push({
                faction: dist_1.default.stubify(faction, [
                    `members`,
                ]),
                score: total,
            });
        }
        topNetWorthShips = topNetWorthShips
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
        for (let planet of this.basicPlanets) {
            planet.allegiances.forEach((a) => {
                if (a.faction.id === `red`)
                    return;
                const found = controlScores.find((s) => s.faction.id === a.faction.id);
                if (!found)
                    return;
                // c.log(`planet with allegiance:`, found) // todo remove
                found.score += a.level;
            });
        }
        // members
        let topMembersShips = [];
        const membersScores = [];
        for (let faction of this.factions) {
            if (faction.id === `red`)
                continue;
            let total = 0;
            faction.members
                .filter((s) => !s.tutorial)
                .forEach((s) => {
                let shipTotal = s.crewMembers.length || 0;
                topMembersShips.push({
                    name: s.name,
                    color: faction.color,
                    score: shipTotal,
                });
                total += shipTotal;
            });
            membersScores.push({
                faction: dist_1.default.stubify(faction, [
                    `members`,
                ]),
                score: total,
            });
        }
        topMembersShips = topMembersShips
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);
        this.factionRankings = [
            {
                category: `netWorth`,
                scores: netWorthScores.sort((a, b) => b.score - a.score),
                top: topNetWorthShips,
            },
            {
                category: `control`,
                scores: controlScores.sort((a, b) => b.score - a.score),
            },
            {
                category: `members`,
                scores: membersScores.sort((a, b) => b.score - a.score),
                top: topMembersShips,
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