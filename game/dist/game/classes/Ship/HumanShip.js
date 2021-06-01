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
class HumanShip extends CombatShip_1.CombatShip {
    constructor(data, game) {
        super(data, game);
        this.logAlertLevel = `high`;
        this.crewMembers = [];
        this.captain = null;
        this.availableRooms = [
            `bunk`,
            `cockpit`,
            `repair`,
            `weapons`,
        ];
        this.commonCredits = 0;
        this.membersIn = crew_1.membersIn;
        this.cumulativeSkillIn = crew_1.cumulativeSkillIn;
        this.id = data.id;
        //* id matches discord guildId here
        this.ai = false;
        this.human = true;
        this.captain = data.captain || null;
        this.log = data.log || [];
        if (data.commonCredits)
            this.commonCredits = data.commonCredits;
        if (data.logAlertLevel)
            this.logAlertLevel = data.logAlertLevel;
        data.crewMembers?.forEach((cm) => {
            this.addCrewMember(cm);
        });
        if (!this.log.length)
            this.logEntry(`Your crew boards the ship ${this.name} for the first time, and sets out towards the stars.`, `medium`);
        this.visible = this.game.scanCircle(this.location, this.radii.sight, this.id, undefined, true);
        this.updatePlanet(true);
        setTimeout(() => {
            this.radii.game = this.game.gameSoftRadius;
            this.toUpdate.radii = this.radii;
        }, 100);
    }
    tick() {
        super.tick();
        if (this.dead)
            return;
        // ----- move -----
        this.move();
        // ----- scan -----
        this.visible = this.game.scanCircle(this.location, this.radii.sight, this.id, undefined, true);
        this.scanners.forEach((s) => s.use());
        this.crewMembers.forEach((cm) => cm.tick());
        this.toUpdate.crewMembers = this.crewMembers.map((cm) => dist_1.default.stubify(cm));
        // ----- discover new planets -----
        const newPlanets = this.visible.planets.filter((p) => !this.seenPlanets.includes(p));
        if (newPlanets.length) {
            this.seenPlanets.push(...newPlanets);
            this.toUpdate.seenPlanets = this.seenPlanets.map((p) => dist_1.default.stubify(p));
            db_1.db.ship.addOrUpdateInDb(this);
            newPlanets.forEach((p) => this.logEntry(`You've discovered the planet ${p.name}!`, `high`));
        }
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
        // ----- auto-attacks -----
        this.autoAttack();
        // todo if no io watchers, skip this
        // ----- updates for frontend -----
        this.toUpdate.visible = dist_1.default.stubify(this.visible, [`visible`, `seenPlanets`]);
        this.toUpdate.items = this.items.map((i) => dist_1.default.stubify(i));
        // ----- send update to listeners -----
        if (!Object.keys(this.toUpdate).length)
            return;
        io_1.default.to(`ship:${this.id}`).emit(`ship:update`, {
            id: this.id,
            updates: this.toUpdate,
        });
        this.toUpdate = {};
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
            // ----- update planet -----
            const previousPlanet = this.planet;
            this.planet =
                this.game.planets.find((p) => this.isAt(p.location)) || false;
            if (previousPlanet !== this.planet)
                this.toUpdate.planet = this.planet
                    ? dist_1.default.stubify(this.planet)
                    : false;
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
            this.speed * (dist_1.default.deltaTime / dist_1.default.TICK_INTERVAL);
        this.direction = dist_1.default.vectorToDegrees(this.velocity);
        this.toUpdate.direction = this.direction;
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
        this.updatePlanet();
    }
    updatePlanet(silent) {
        const previousPlanet = this.planet;
        this.planet =
            this.visible.planets.find((p) => this.isAt(p.location)) || false;
        if (previousPlanet !== this.planet)
            this.toUpdate.planet = this.planet
                ? dist_1.default.stubify(this.planet)
                : false;
        if (silent)
            return;
        // -----  log for you and other ships on that planet when you land/depart -----
        if (this.planet && this.planet !== previousPlanet) {
            this.logEntry(`Landed on ${this.planet ? this.planet.name : ``}.`, `high`);
            this.planet.shipsAt().forEach((s) => {
                if (s === this)
                    return;
                s.logEntry(`${this.name} landed on ${this.planet ? this.planet.name : ``}.`);
            });
        }
        else if (previousPlanet && !this.planet) {
            this.logEntry(`Departed from ${previousPlanet ? previousPlanet.name : ``}.`);
            if (previousPlanet)
                previousPlanet.shipsAt().forEach((s) => {
                    if (s === this)
                        return;
                    s.logEntry(`${this.name} departed from ${previousPlanet ? previousPlanet.name : ``}.`);
                });
        }
    }
    applyTickOfGravity() {
        super.applyTickOfGravity();
    }
    updateBroadcastRadius() {
        this.radii.broadcast = this.communicators.reduce((total, comm) => {
            const currRadius = comm.repair * comm.range;
            return currRadius + total;
        }, 0);
        this.toUpdate.radii = this.radii;
    }
    updateThingsThatCouldChangeOnItemChange() {
        super.updateThingsThatCouldChangeOnItemChange();
        this.updateBroadcastRadius();
    }
    addCommonCredits(amount, member) {
        this.commonCredits += amount;
        this.toUpdate.commonCredits = this.commonCredits;
        member.addStat(`totalContributedToCommonFund`, amount);
    }
    broadcast(message, crewMember) {
        const sanitized = dist_1.default.sanitize(message.replace(/\n/g, ` `)).result;
        // todo get equipment, use it, and adjust output/range based on repair etc
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
            io_1.default.emit(`ship:message`, otherShip.id, toSend, `broadcast`);
        }
        this.communicators.forEach((comm) => comm.use());
        this.updateBroadcastRadius();
        crewMember.addXp(`linguistics`, dist_1.default.baseXpGain * 20);
        return didSendCount;
    }
    // ----- room mgmt -----
    addRoom(room) {
        if (!this.availableRooms.includes(room))
            this.availableRooms.push(room);
    }
    removeRoom(room) {
        const index = this.availableRooms.findIndex((r) => r === room);
        if (index !== -1)
            this.availableRooms.splice(index, 1);
    }
    // ----- crew mgmt -----
    addCrewMember(data) {
        const cm = new CrewMember_1.CrewMember(data, this);
        this.crewMembers.push(cm);
        if (!this.captain)
            this.captain = cm.id;
        dist_1.default.log(`gray`, `Added crew member ${cm.name} to ${this.name}`);
        db_1.db.ship.addOrUpdateInDb(this);
        return cm;
    }
    removeCrewMember(id) {
        const index = this.crewMembers.findIndex((cm) => cm.id === id);
        if (index === -1) {
            dist_1.default.log(`red`, `Attempted to remove crew member that did not exist ${id} from ship ${this.id}`);
            return;
        }
        this.crewMembers.splice(index, 1);
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
    // ----- respawn -----
    respawn() {
        super.respawn();
        this.updatePlanet(true);
        this.toUpdate.dead = this.dead;
        if (this instanceof HumanShip) {
            this.logEntry(`Your crew, having barely managed to escape with their lives, scrounge together every credit they have to buy another basic ship.`, `critical`);
        }
    }
    // ----- auto attack -----
    autoAttack() {
        this.toUpdate.targetShip = false;
        const weaponsRoomMembers = this.membersIn(`weapons`);
        if (weaponsRoomMembers.length) {
            const tacticCounts = weaponsRoomMembers.reduce((totals, cm) => {
                const currTotal = totals.find((t) => t.tactic === cm.tactic);
                if (currTotal)
                    currTotal.total++;
                else
                    totals.push({ tactic: cm.tactic, total: 1 });
                return totals;
            }, []);
            const mainTactic = tacticCounts.sort((b, a) => b.total - a.total)?.[0]?.tactic;
            this.mainTactic = mainTactic;
            this.toUpdate.mainTactic = mainTactic;
            const attackableShips = this.getEnemiesInAttackRange();
            this.toUpdate.enemiesInAttackRange = dist_1.default.stubify(attackableShips, [`visible`, `seenPlanets`]);
            if (!mainTactic)
                return;
            if (!attackableShips.length)
                return;
            const availableWeapons = this.availableWeapons();
            if (!availableWeapons)
                return;
            // ----- gather most common attack target -----
            const targetCounts = weaponsRoomMembers.reduce((totals, cm) => {
                if (!cm.attackTarget)
                    return totals;
                const currTotal = totals.find((t) => t.attackTarget === cm.attackTarget);
                if (currTotal)
                    currTotal.total++;
                else
                    totals.push({
                        target: cm.attackTarget,
                        total: 1,
                    });
                return totals;
            }, []);
            const mainAttackTarget = targetCounts.sort((b, a) => b.total - a.total)?.[0]?.target;
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
                        mostRecent.attacker !== this &&
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
                availableWeapons.forEach((w) => {
                    this.attack(targetShip, w);
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
                        this.canAttack(mostRecent.attacker === this
                            ? mostRecent.defender
                            : mostRecent.attacker)
                        ? mostRecent
                        : ar, null);
                    // ----- if all else fails, just attack whatever's around -----
                    targetShip = mostRecentCombat
                        ? mostRecentCombat.attacker === this
                            ? mostRecentCombat.defender
                            : mostRecentCombat.attacker
                        : dist_1.default.randomFromArray(attackableShips);
                }
                this.toUpdate.targetShip = dist_1.default.stubify(targetShip, [`visible`, `seenPlanets`]);
                // ----- with EVERY AVAILABLE WEAPON -----
                availableWeapons.forEach((w) => {
                    this.attack(targetShip, w);
                });
            }
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