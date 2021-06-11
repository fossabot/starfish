"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HumanShip = void 0;
const dist_1 = __importDefault(require("../../../../../common/dist"));
const db_1 = require("../../../db");
const io_1 = __importDefault(require("../../../server/io"));
const crew_1 = require("./addins/crew");
const CombatShip_1 = require("./CombatShip");
const CrewMember_1 = require("../CrewMember/CrewMember");
const rooms_1 = require("../../presets/rooms");
const Tutorial_1 = require("./addins/Tutorial");
class HumanShip extends CombatShip_1.CombatShip {
    constructor(data, game) {
        super(data, game);
        this.logAlertLevel = `high`;
        this.crewMembers = [];
        this.captain = null;
        this.rooms = {};
        this.maxScanProperties = null;
        this.visible = {
            ships: [],
            planets: [],
            caches: [],
            attackRemnants: [],
        };
        this.commonCredits = 0;
        this.membersIn = crew_1.membersIn;
        this.cumulativeSkillIn = crew_1.cumulativeSkillIn;
        this.id = data.id;
        // id matches discord guildId
        this.ai = false;
        this.human = true;
        this.captain = data.captain || null;
        this.log = data.log || [];
        if (data.tutorial && data.tutorial.step !== undefined)
            this.tutorial = new Tutorial_1.Tutorial(data.tutorial, this);
        this.recalculateShownPanels();
        if (data.commonCredits)
            this.commonCredits = data.commonCredits;
        if (data.logAlertLevel)
            this.logAlertLevel = data.logAlertLevel;
        this.resolveRooms();
        data.crewMembers?.forEach((cm) => {
            this.addCrewMember(cm, true);
        });
        if (!this.log.length)
            this.logEntry(`Your crew boards the ship ${this.name} for the first time, and sets out towards the stars.`, `medium`);
        this.updateMaxScanProperties();
        this.updateVisible();
        if (!this.tutorial)
            this.updatePlanet(true);
        setTimeout(() => {
            this.radii.game = this.game.gameSoftRadius;
            this.toUpdate.radii = this.radii;
        }, 100);
    }
    tick() {
        const profiler = new dist_1.default.Profiler(4, `human ship tick`, false, 0);
        super.tick();
        if (this.dead)
            return;
        if (this.tutorial)
            this.tutorial.tick();
        profiler.step(`move`);
        // ----- move -----
        this.move();
        profiler.step(`update visible`);
        // ----- scan -----
        this.updateVisible();
        this.scanners.forEach((s) => s.use());
        profiler.step(`crew tick & stubify`);
        this.crewMembers.forEach((cm) => cm.tick());
        this.toUpdate.crewMembers = this.crewMembers.map((cm) => dist_1.default.stubify(cm));
        profiler.step(`discover planets`);
        // ----- discover new planets -----
        const newPlanets = this.visible.planets.filter((p) => !this.seenPlanets.includes(p));
        if (newPlanets.length) {
            this.seenPlanets.push(...newPlanets);
            this.toUpdate.seenPlanets = this.seenPlanets.map((p) => dist_1.default.stubify(p));
            db_1.db.ship.addOrUpdateInDb(this);
            newPlanets.forEach((p) => this.logEntry(`Discovered the planet ${p.name}!`, `high`));
        }
        profiler.step(`get caches`);
        // ----- get nearby caches -----
        this.visible.caches.forEach((cache) => {
            if (this.isAt(cache.location)) {
                if (!cache.canBePickedUpBy(this))
                    return;
                this.distributeCargoAmongCrew(cache.contents);
                this.logEntry(`Picked up a cache with ${cache.contents
                    .map((cc) => `${Math.round(cc.amount * 10000) / 10000}${cc.type === `credits` ? `` : ` tons of`} ${cc.type}`)
                    .join(` and `)} inside!${cache.message &&
                    ` There was a message attached which said, "${cache.message}".`}`, `medium`);
                this.game.removeCache(cache);
            }
        });
        profiler.step(`auto attack`);
        // ----- auto-attacks -----
        this.autoAttack();
        profiler.step(`frontend stubify`);
        // todo if no io watchers, skip this
        // ----- updates for frontend -----
        this.toUpdate.visible = {
            ships: this.visible.ships,
            trails: this.visible.trails || [],
            attackRemnants: this.visible.attackRemnants.map((ar) => ar.stubify()),
            planets: this.visible.planets.map((p) => p.stubify()),
            caches: this.visible.caches.map((c) => c.stubify()),
        };
        this.toUpdate.items = this.items.map((i) => i.stubify());
        profiler.step(`frontend send`);
        // ----- send update to listeners -----
        if (Object.keys(this.toUpdate).length)
            io_1.default.to(`ship:${this.id}`).emit(`ship:update`, {
                id: this.id,
                updates: this.toUpdate,
            });
        this.toUpdate = {};
        profiler.end();
    }
    // ----- log -----
    logEntry(text, level = `low`) {
        this.log.push({ level, text, time: Date.now() });
        while (this.log.length > HumanShip.maxLogLength)
            this.log.shift();
        this.toUpdate.log = this.log;
        if (this.logAlertLevel === `off`)
            return;
        const levelsToAlert = [this.logAlertLevel];
        if (this.logAlertLevel === `low`)
            levelsToAlert.push(`medium`, `high`, `critical`);
        if (this.logAlertLevel === `medium`)
            levelsToAlert.push(`high`, `critical`);
        if (this.logAlertLevel === `high`)
            levelsToAlert.push(`critical`);
        if (levelsToAlert.includes(level))
            io_1.default.emit(`ship:message`, this.id, text);
    }
    // ----- move -----
    move(toLocation) {
        super.move(toLocation);
        if (toLocation) {
            this.updateVisible();
            this.updatePlanet();
            return;
        }
        const startingLocation = [
            ...this.location,
        ];
        const membersInCockpit = this.membersIn(`cockpit`);
        if (!this.canMove || !membersInCockpit.length) {
            this.speed = 0;
            this.velocity = [0, 0];
            this.toUpdate.speed = this.speed;
            this.toUpdate.velocity = this.velocity;
            return;
        }
        const engineThrustMultiplier = Math.max(dist_1.default.noEngineThrustMagnitude, this.engines
            .filter((e) => e.repair > 0)
            .reduce((total, e) => total + e.thrustAmplification * e.repair, 0));
        // ----- calculate new location based on target of each member in cockpit -----
        for (let member of membersInCockpit) {
            if (!member.targetLocation)
                continue;
            const distanceToTarget = dist_1.default.distance(this.location, member.targetLocation);
            if (distanceToTarget < 0.000001)
                continue;
            const skill = member.skills.find((s) => s.skill === `piloting`)
                ?.level || 1;
            const thrustMagnitude = Math.min(dist_1.default.getThrustMagnitudeForSingleCrewMember(skill, engineThrustMultiplier), distanceToTarget);
            this.engines.forEach((e) => e.use());
            const unitVectorToTarget = dist_1.default.degreesToUnitVector(dist_1.default.angleFromAToB(this.location, member.targetLocation));
            this.location[0] +=
                unitVectorToTarget[0] *
                    thrustMagnitude *
                    (dist_1.default.deltaTime / 1000);
            this.location[1] +=
                unitVectorToTarget[1] *
                    thrustMagnitude *
                    (dist_1.default.deltaTime / 1000);
        }
        this.toUpdate.location = this.location;
        this.velocity = [
            this.location[0] - startingLocation[0],
            this.location[1] - startingLocation[1],
        ];
        this.toUpdate.velocity = this.velocity;
        this.speed = dist_1.default.vectorToMagnitude(this.velocity);
        this.toUpdate.speed =
            this.speed / (dist_1.default.deltaTime / dist_1.default.TICK_INTERVAL);
        this.direction = dist_1.default.vectorToDegrees(this.velocity);
        this.toUpdate.direction = this.direction;
        // ----- skip if in tutorial -----
        if (!this.tutorial) {
            // ----- add previousLocation -----
            this.addPreviousLocation(startingLocation);
            // ----- game radius -----
            this.radii.game = this.game.gameSoftRadius;
            this.toUpdate.radii = this.radii;
            const isOutsideRadius = dist_1.default.distance([0, 0], this.location) >
                this.game.gameSoftRadius;
            const startedOutsideRadius = dist_1.default.distance([0, 0], startingLocation) >
                this.game.gameSoftRadius;
            if (isOutsideRadius && !startedOutsideRadius)
                this.logEntry(`Left the known universe. Nothing but the void awaits out here.`, `high`);
            if (!isOutsideRadius && startedOutsideRadius)
                this.logEntry(`Re-entered the known universe.`, `high`);
            // ----- random encounters -----
            const distanceTraveled = dist_1.default.distance(this.location, startingLocation);
            if (dist_1.default.lottery(distanceTraveled * (dist_1.default.deltaTime / 1000), 0.5)) {
                const amount = Math.round(Math.random() * 3 * (Math.random() * 3)) /
                    10 +
                    1;
                const type = dist_1.default.randomFromArray([
                    `oxygen`,
                    `salt`,
                    `water`,
                ]);
                this.distributeCargoAmongCrew([
                    { type: type, amount },
                ]);
                this.logEntry(`Encountered some space junk and managed to harvest ${amount} ton${amount === 1 ? `` : `s`} of ${type} off of it.`);
            }
        }
        this.updatePlanet();
    }
    updateVisible() {
        const targetTypes = this.tutorial?.currentStep.visibleTypes;
        const visible = this.game.scanCircle(this.location, this.radii.sight, this.id, targetTypes, true);
        const shipsWithValidScannedProps = visible.ships.map((s) => {
            return this.shipToValidScanResult(s);
        });
        this.visible = {
            ...visible,
            ships: shipsWithValidScannedProps,
        };
    }
    async updatePlanet(silent) {
        const previousPlanet = this.planet;
        this.planet =
            this.game.planets.find((p) => this.isAt(p.location)) || false;
        if (previousPlanet !== this.planet)
            this.toUpdate.planet = this.planet
                ? this.planet.stubify()
                : false;
        if (silent)
            return;
        await dist_1.default.sleep(100); // to resolve the constructor; this.tutorial doesn't exist yet
        // -----  log for you and other ships on that planet when you land/depart -----
        if ((!this.tutorial || this.tutorial.step > 0) &&
            this.planet &&
            this.planet !== previousPlanet) {
            this.logEntry(`Landed on ${this.planet ? this.planet.name : ``}.`, `high`);
            if (!this.tutorial)
                this.planet.shipsAt().forEach((s) => {
                    if (s === this)
                        return;
                    s.logEntry(`${this.name} landed on ${this.planet ? this.planet.name : ``}.`);
                });
        }
        else if (previousPlanet && !this.planet) {
            this.logEntry(`Departed from ${previousPlanet ? previousPlanet.name : ``}.`);
            if (previousPlanet && !this.tutorial)
                previousPlanet.shipsAt().forEach((s) => {
                    if (s === this)
                        return;
                    s.logEntry(`${this.name} departed from ${previousPlanet ? previousPlanet.name : ``}.`);
                });
        }
    }
    updateBroadcastRadius() {
        this.radii.broadcast = dist_1.default.getRadiusDiminishingReturns(this.communicators.reduce((total, comm) => {
            const currRadius = comm.repair * comm.range;
            return currRadius + total;
        }, 0), this.communicators.length);
        this.toUpdate.radii = this.radii;
    }
    updateThingsThatCouldChangeOnItemChange() {
        super.updateThingsThatCouldChangeOnItemChange();
        this.updateBroadcastRadius();
        this.toUpdate._hp = this.hp;
        this.toUpdate._maxHp = this._maxHp;
    }
    recalculateShownPanels() {
        if (!this.tutorial)
            this.shownPanels = undefined;
        else
            this.shownPanels =
                this.tutorial.currentStep.shownPanels;
        this.toUpdate.shownPanels = this.shownPanels;
    }
    equipLoadout(l, removeExisting = false) {
        if (removeExisting)
            this.items = [];
        const res = super.equipLoadout(l);
        if (!res)
            return res;
        this.toUpdate.items = this.items;
        this.updateThingsThatCouldChangeOnItemChange();
        this.updateBroadcastRadius();
        return true;
    }
    addCommonCredits(amount, member) {
        this.commonCredits += amount;
        this.toUpdate.commonCredits = this.commonCredits;
        member.addStat(`totalContributedToCommonFund`, amount);
    }
    broadcast(message, crewMember) {
        const sanitized = dist_1.default.sanitize(message.replace(/\n/g, ` `)).result;
        const range = this.radii.broadcast;
        let didSendCount = 0;
        for (let otherShip of this.visible.ships.filter((s) => s.human)) {
            const distance = dist_1.default.distance(this.location, otherShip.location);
            if (distance > range)
                continue;
            didSendCount++;
            const antiGarble = this.communicators.reduce((total, curr) => curr.antiGarble * curr.repair + total, 0);
            const crewSkillAntiGarble = (crewMember.skills.find((s) => s.skill === `linguistics`)?.level || 0) / 100;
            const garbleAmount = distance /
                (range + antiGarble + crewSkillAntiGarble);
            const garbled = dist_1.default.garble(sanitized, garbleAmount);
            const toSend = `**🚀${this.name}** says: *(${dist_1.default.r2(distance, 2)}AU away, ${dist_1.default.r2(Math.min(100, (1 - garbleAmount) * 100), 0)}% fidelity)*\n\`${garbled.substring(0, dist_1.default.maxBroadcastLength)}\``;
            if (otherShip.id)
                io_1.default.emit(`ship:message`, otherShip.id, toSend, `broadcast`);
        }
        this.communicators.forEach((comm) => comm.use());
        this.updateBroadcastRadius();
        crewMember.addXp(`linguistics`, dist_1.default.baseXpGain * 20);
        return didSendCount;
    }
    // ----- room mgmt -----
    resolveRooms() {
        this.rooms = {};
        let roomsToAdd = [];
        if (this.tutorial)
            roomsToAdd =
                this.tutorial.currentStep?.shownRooms || [];
        else
            roomsToAdd = [`bunk`, `cockpit`, `repair`, `weapons`];
        for (let room of roomsToAdd)
            this.addRoom(room);
    }
    addRoom(room) {
        if (!(room in this.rooms))
            this.rooms[room] = rooms_1.rooms[room];
        this.toUpdate.rooms = this.rooms;
    }
    removeRoom(room) {
        delete this.rooms[room];
        this.toUpdate.rooms = this.rooms;
    }
    // ----- items -----
    addItem(itemData) {
        const res = super.addItem(itemData);
        if (itemData.type === `scanner`)
            this.updateMaxScanProperties();
        return res;
    }
    removeItem(item) {
        const res = super.removeItem(item);
        if (item.type === `scanner`)
            this.updateMaxScanProperties();
        return res;
    }
    // ----- crew mgmt -----
    addCrewMember(data, silent = false) {
        const cm = new CrewMember_1.CrewMember(data, this);
        this.crewMembers.push(cm);
        if (!this.captain)
            this.captain = cm.id;
        dist_1.default.log(`gray`, `Added crew member ${cm.name} to ${this.name}`);
        if (!silent && this.crewMembers.length > 1)
            this.logEntry(`${cm.name} has joined the ship's crew!`, `high`);
        db_1.db.ship.addOrUpdateInDb(this);
        return cm;
    }
    removeCrewMember(id) {
        const index = this.crewMembers.findIndex((cm) => cm.id === id);
        const cm = this.crewMembers[index];
        if (index === -1) {
            dist_1.default.log(`red`, `Attempted to remove crew member that did not exist ${id} from ship ${this.id}`);
            return;
        }
        if (this.captain === cm.id) {
            dist_1.default.log(`red`, `Attempted to kick the captain from ship ${this.id}`);
            return;
        }
        this.crewMembers.splice(index, 1);
        this.logEntry(`${cm.name} has been kicked from the crew. The remaining crew members watch forlornly as their icy body drifts by the observation window. `, `critical`);
        // * this could be abused to generate infinite money
        // ${cm.name}'s cargo has been distributed amongst the crew.
        // this.distributeCargoAmongCrew([
        //   ...cm.inventory,
        //   { type: `credits`, amount: cm.credits },
        // ])
        db_1.db.ship.addOrUpdateInDb(this);
    }
    distributeCargoAmongCrew(cargo) {
        const leftovers = [];
        cargo.forEach((contents) => {
            let toDistribute = contents.amount;
            const canHoldMore = [...this.crewMembers];
            while (canHoldMore.length && toDistribute) {
                const amountForEach = toDistribute / canHoldMore.length;
                toDistribute = canHoldMore.reduce((total, cm, index) => {
                    if (contents.type === `credits`)
                        cm.credits += amountForEach;
                    else {
                        const leftOver = cm.addCargo(contents.type, amountForEach);
                        if (leftOver) {
                            canHoldMore.splice(index, 1);
                            return total + leftOver;
                        }
                    }
                    return total;
                }, 0);
            }
            if (toDistribute > 1) {
                const existing = leftovers.find((l) => l.type === contents.type);
                if (existing)
                    existing.amount += toDistribute;
                else
                    leftovers.push({
                        type: contents.type,
                        amount: toDistribute,
                    });
            }
        });
        if (leftovers.length) {
            setTimeout(() => this.logEntry(`Your crew couldn't hold everything, so some cargo was released as a cache.`), 500);
            this.game.addCache({
                location: [...this.location],
                contents: leftovers,
                droppedBy: this.id,
            });
        }
    }
    // -----
    updateMaxScanProperties() {
        // c.log(`updating max scan properties`, this.name)
        const totalShape = {
            ...dist_1.default.baseShipScanProperties,
        };
        for (let scanner of this.scanners) {
            ;
            Object.keys(scanner.shipScanData).forEach((key) => {
                const value = scanner.shipScanData[key];
                if (!totalShape[key] && value === true)
                    totalShape[key] = true;
                if (totalShape[key] === undefined &&
                    Array.isArray(value)) {
                    ;
                    totalShape[key] = value;
                }
                else if (Array.isArray(totalShape[key]) &&
                    Array.isArray(value)) {
                    for (let s of value) {
                        if (!totalShape[key].includes(s))
                            totalShape[key].push(s);
                    }
                }
            });
        }
        this.maxScanProperties = totalShape;
    }
    shipToValidScanResult(ship) {
        const scanPropertiesToUse = dist_1.default.distance(this.location, ship.location) <
            this.radii.scan
            ? this.maxScanProperties || dist_1.default.baseShipScanProperties
            : dist_1.default.baseShipScanProperties;
        const partialShip = {} // sorry to the typescript gods for this one
        ;
        Object.entries(scanPropertiesToUse).forEach(([key, value]) => {
            if (!ship[key])
                return;
            if (value === true)
                partialShip[key] = ship[key];
            if (Array.isArray(value)) {
                if (Array.isArray(ship[key])) {
                    partialShip[key] = ship[key].map((el) => {
                        const returnVal = {};
                        Object.keys(el)
                            .filter((elKey) => value.includes(elKey))
                            .forEach((elKey) => {
                            returnVal[elKey] = el[elKey];
                        });
                        return returnVal;
                    });
                }
                else {
                    partialShip[key] = {};
                    Object.keys(ship[key]).forEach((elKey) => {
                        if (value.includes(elKey))
                            partialShip[key][elKey] = ship[key][elKey];
                    });
                }
            }
        });
        return partialShip;
    }
    // ----- respawn -----
    respawn(silent = false) {
        super.respawn();
        this.updatePlanet(true);
        this.toUpdate.dead = this.dead;
        this.crewMembers.forEach((cm) => (cm.targetLocation = null));
        if (!silent && this instanceof HumanShip) {
            this.logEntry(`Your crew, having barely managed to escape with their lives, scrounge together every credit they have to buy another basic ship.`, `critical`);
        }
    }
    // ----- auto attack -----
    autoAttack() {
        this.toUpdate.targetShip = false;
        const weaponsRoomMembers = this.membersIn(`weapons`);
        if (!weaponsRoomMembers.length)
            return;
        // ----- gather most common tactic -----
        const tacticCounts = weaponsRoomMembers.reduce((totals, cm) => {
            const currTotal = totals.find((t) => t.tactic === cm.tactic);
            const toAdd = cm.skills.find((s) => s.skill === `munitions`)
                ?.level || 1;
            if (currTotal)
                currTotal.total += toAdd;
            else
                totals.push({ tactic: cm.tactic, total: toAdd });
            return totals;
        }, []);
        const mainTactic = tacticCounts.sort((b, a) => b.total - a.total)?.[0]?.tactic;
        this.mainTactic = mainTactic;
        this.toUpdate.mainTactic = mainTactic;
        const attackableShips = this.getEnemiesInAttackRange();
        this.toUpdate.enemiesInAttackRange = dist_1.default.stubify(attackableShips, [`visible`, `seenPlanets`]);
        // ----- gather most common item target -----
        const itemTargetCounts = weaponsRoomMembers.reduce((totals, cm) => {
            if (!cm.itemTarget)
                return totals;
            const currTotal = totals.find((t) => t.itemTarget === cm.itemTarget);
            const toAdd = cm.skills.find((s) => s.skill === `munitions`)
                ?.level || 1;
            if (currTotal)
                currTotal.total += toAdd;
            else
                totals.push({
                    target: cm.itemTarget,
                    total: toAdd,
                });
            return totals;
        }, []);
        let mainItemTarget = itemTargetCounts.sort((b, a) => b.total - a.total)?.[0]?.target;
        this.itemTarget = mainItemTarget;
        this.toUpdate.itemTarget = mainItemTarget;
        if (!mainTactic)
            return;
        if (!attackableShips.length)
            return;
        const availableWeapons = this.availableWeapons();
        if (!availableWeapons)
            return;
        // ----- gather most common attack target -----
        const shipTargetCounts = weaponsRoomMembers.reduce((totals, cm) => {
            if (!cm.attackTarget)
                return totals;
            const currTotal = totals.find((t) => t.attackTarget === cm.attackTarget);
            const toAdd = cm.skills.find((s) => s.skill === `munitions`)
                ?.level || 1;
            if (currTotal)
                currTotal.total += toAdd;
            else
                totals.push({
                    target: cm.attackTarget,
                    total: toAdd,
                });
            return totals;
        }, []);
        const mainAttackTarget = shipTargetCounts.sort((b, a) => b.total - a.total)?.[0]?.target;
        // ----- defensive strategy -----
        if (mainTactic === `defensive`) {
            let targetShip;
            if (mainAttackTarget &&
                this.canAttack(mainAttackTarget)) {
                const attackedByThatTarget = this.visible.attackRemnants.find((ar) => ar.attacker === mainAttackTarget);
                if (attackedByThatTarget)
                    targetShip = mainAttackTarget;
            }
            else {
                const mostRecentDefense = this.visible.attackRemnants.reduce((mostRecent, ar) => mostRecent &&
                    mostRecent.time > ar.time &&
                    mostRecent.attacker.id !== this.id &&
                    this.canAttack(mostRecent.attacker)
                    ? mostRecent
                    : ar, null);
                targetShip = mostRecentDefense?.attacker;
            }
            this.toUpdate.targetShip = targetShip
                ? dist_1.default.stubify(targetShip, [
                    `visible`,
                    `seenPlanets`,
                ])
                : null;
            if (!targetShip)
                return;
            if (!targetShip.stubify)
                // in some cases we end up with a stub here
                targetShip = this.game.ships.find((s) => s.attackable && s.id === targetShip?.id);
            if (targetShip)
                availableWeapons.forEach((w) => {
                    this.attack(targetShip, w, mainItemTarget);
                });
        }
        // ----- aggressive strategy -----
        if (mainTactic === `aggressive`) {
            let targetShip = mainAttackTarget;
            if (targetShip && !this.canAttack(targetShip))
                targetShip = undefined;
            if (!targetShip) {
                // ----- if no attack target, pick the one we were most recently in combat with that's still in range -----
                const mostRecentCombat = this.visible.attackRemnants.reduce((mostRecent, ar) => mostRecent &&
                    mostRecent.time > ar.time &&
                    this.canAttack(mostRecent.attacker.id === this.id
                        ? mostRecent.defender
                        : mostRecent.attacker)
                    ? mostRecent
                    : ar, null);
                // ----- if all else fails, just attack whatever's around -----
                targetShip = mostRecentCombat
                    ? mostRecentCombat.attacker.id === this.id
                        ? mostRecentCombat.defender
                        : mostRecentCombat.attacker
                    : dist_1.default.randomFromArray(attackableShips);
            }
            // ----- attack with EVERY AVAILABLE WEAPON -----
            if (!targetShip)
                return;
            if (!targetShip.stubify)
                // in some cases we end up with a stub here
                targetShip = this.game.ships.find((s) => s.attackable && s.id === targetShip?.id);
            if (targetShip) {
                this.toUpdate.targetShip = targetShip.stubify();
                availableWeapons.forEach((w) => {
                    this.attack(targetShip, w, mainItemTarget);
                });
            }
            else
                this.toUpdate.targetShip = false;
        }
    }
    die() {
        super.die();
        setTimeout(() => {
            this.logEntry(`Your ship has been destroyed! All cargo and equipment are lost, along with most of your credits, but the crew managed to escape back to their homeworld. Respawn and get back out there!`, `critical`);
        }, 100);
        const cacheContents = [];
        this.crewMembers.forEach((cm) => {
            // ----- crew member cargo -----
            while (cm.inventory.length) {
                const toAdd = cm.inventory.pop();
                const existing = cacheContents.find((cc) => cc.type === toAdd?.type);
                if (existing)
                    existing.amount += toAdd?.amount || 0;
                else if (toAdd)
                    cacheContents.push(toAdd);
            }
            // ----- crew member credits -----
            const toCache = cm.credits *
                CombatShip_1.CombatShip.percentOfCreditsDroppedOnDeath;
            cm.credits -=
                cm.credits * CombatShip_1.CombatShip.percentOfCreditsLostOnDeath;
            const existing = cacheContents.find((cc) => cc.type === `credits`);
            if (existing)
                existing.amount += toCache || 0;
            else if (cm.credits)
                cacheContents.push({
                    type: `credits`,
                    amount: toCache,
                });
            cm.location = `bunk`;
            cm.stamina = 0;
        });
        // ----- ship common credits -----
        const toCache = this.commonCredits *
            CombatShip_1.CombatShip.percentOfCreditsDroppedOnDeath;
        this.commonCredits -=
            this.commonCredits *
                CombatShip_1.CombatShip.percentOfCreditsLostOnDeath;
        const existing = cacheContents.find((cc) => cc.type === `credits`);
        if (existing)
            existing.amount += toCache || 0;
        else if (this.commonCredits)
            cacheContents.push({
                type: `credits`,
                amount: toCache,
            });
        if (cacheContents.length)
            this.game.addCache({
                contents: cacheContents,
                location: this.location,
                message: `Remains of ${this.name}`,
            });
    }
}
exports.HumanShip = HumanShip;
HumanShip.maxLogLength = 20;
//# sourceMappingURL=HumanShip.js.map