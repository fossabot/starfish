"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HumanShip = void 0;
const dist_1 = __importDefault(require("../../../../../common/dist"));
const db_1 = require("../../../db");
const crew_1 = require("./addins/crew");
const CombatShip_1 = require("./CombatShip");
const CrewMember_1 = require("../CrewMember/CrewMember");
class HumanShip extends CombatShip_1.CombatShip {
    constructor(data, game) {
        super(data, game);
        this.crewMembers = [];
        this.captain = null;
        this.availableRooms = [
            `bunk`,
            `cockpit`,
            `repair`,
            `weapons`,
        ];
        this.membersIn = crew_1.membersIn;
        this.cumulativeSkillIn = crew_1.cumulativeSkillIn;
        this.id = data.id;
        //* id matches discord guildId here
        this.ai = false;
        this.human = true;
        this.captain = data.captain || null;
        this.log = data.log || [];
        data.crewMembers?.forEach((cm) => {
            this.addCrewMember(cm);
        });
        if (!this.log.length)
            this.logEntry(`Your crew boards the ship ${this.name} for the first time, and sets out towards the stars.`, `medium`);
    }
    tick() {
        if (this.dead)
            return;
        this.crewMembers.forEach((cm) => cm.tick());
        this.toUpdate.crewMembers = this.crewMembers.map((cm) => dist_1.default.stubify(cm));
        super.tick();
        // ----- discover new planets -----
        const newPlanets = this.visible.planets.filter((p) => !this.seenPlanets.includes(p));
        if (newPlanets.length) {
            this.seenPlanets.push(...newPlanets);
            this.toUpdate.seenPlanets = dist_1.default.stubify(this.seenPlanets);
            db_1.db.ship.addOrUpdateInDb(this);
            newPlanets.forEach((p) => this.logEntry(`You've discovered the planet ${p.name}!`, `high`));
        }
        // ----- get nearby caches -----
        this.visible.caches.forEach((cache) => {
            if (this.isAt(cache.location)) {
                this.distributeCargoAmongCrew(cache.contents);
                this.logEntry(`Picked up a cache with ${cache.contents
                    .map((cc) => `${Math.round(cc.amount * 10000) / 10000} ${cc.type}`)
                    .join(` and `)} inside!${cache.message &&
                    ` There was a message attached, which said, "${cache.message}".`} The cache's contents were distributed evenly among the crew.`, `medium`);
                this.game.removeCache(cache);
            }
        });
        // ----- auto-attacks -----
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
    // ----- log -----
    logEntry(text, level = `low`) {
        this.log.push({ level, text, time: Date.now() });
        while (this.log.length > HumanShip.maxLogLength)
            this.log.shift();
        this.toUpdate.log = this.log;
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
        const engineThrustMultiplier = this.engines
            .filter((e) => e.repair > 0)
            .reduce((total, e) => total + e.thrustAmplification * e.repair, 0);
        // ----- calculate new location based on target of each member in cockpit -----
        for (let member of membersInCockpit) {
            if (!member.targetLocation)
                continue;
            // already there (plus a bit), so stop
            if (Math.abs(this.location[0] - member.targetLocation[0]) <
                dist_1.default.arrivalThreshold / 2 &&
                Math.abs(this.location[1] - member.targetLocation[1]) <
                    dist_1.default.arrivalThreshold / 2)
                continue;
            this.engines.forEach((e) => e.use());
            const skill = member.skills.find((s) => s.skill === `piloting`)
                ?.level || 1;
            const thrustMagnitude = dist_1.default.getThrustMagnitudeForSingleCrewMember(skill, engineThrustMultiplier);
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
        // ----- update planet -----
        const previousPlanet = this.planet;
        this.planet =
            this.game.planets.find((p) => this.isAt(p.location)) || false;
        if (previousPlanet !== this.planet)
            this.toUpdate.planet = this.planet
                ? dist_1.default.stubify(this.planet)
                : false;
        // ----- add previousLocation -----
        this.addPreviousLocation(startingLocation);
        // ----- random encounters -----
        const distanceTraveled = dist_1.default.distance(this.location, startingLocation);
        if (Math.random() * distanceTraveled >
            0.9999 * distanceTraveled) {
            const amount = Math.round(Math.random() * 3 * (Math.random() * 3)) /
                10 +
                1;
            this.distributeCargoAmongCrew([
                { type: `metals`, amount },
            ]);
            this.logEntry(`Encountered some space junk and managed to strip ${amount} ton${amount === 1 ? `` : `s`} of metal off of it.`);
        }
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
        cargo.forEach((contents) => {
            const toDistribute = contents.amount / this.crewMembers.length;
            this.crewMembers.forEach((cm) => {
                if (contents.type === `credits`)
                    cm.credits += contents.amount;
                else
                    cm.addCargo(contents.type, toDistribute);
            });
        });
    }
    // ----- respawn -----
    respawn() {
        super.respawn();
        if (this instanceof HumanShip) {
            this.logEntry(`Your crew, having barely managed to escape with their lives, scrounge together every credit they have to buy another basic ship.`, `critical`);
        }
    }
}
exports.HumanShip = HumanShip;
HumanShip.maxLogLength = 20;
//# sourceMappingURL=HumanShip.js.map