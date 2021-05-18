"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HumanShip = void 0;
const dist_1 = __importDefault(require("../../../../../common/dist"));
const CrewMember_1 = require("../CrewMember/CrewMember");
const CombatShip_1 = require("./CombatShip");
const crew_1 = require("./addins/crew");
const io_1 = require("../../../server/io");
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
        this.human = true;
        this.id = data.id;
        //* id matches discord guildId here
        this.captain = data.captain || null;
        data.crewMembers?.forEach((cm) => {
            this.addCrewMember(cm);
        });
    }
    tick() {
        this.crewMembers.forEach((cm) => cm.tick());
        this.toUpdate.crewMembers = this.crewMembers.map((cm) => io_1.stubify(cm));
        super.tick();
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
            this.toUpdate.enemiesInAttackRange = io_1.stubify(attackableShips, [`visible`, `seenPlanets`]);
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
                    ? io_1.stubify(targetShip, [
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
                this.toUpdate.targetShip = io_1.stubify(targetShip, [`visible`, `seenPlanets`]);
                // ----- with EVERY AVAILABLE WEAPON -----
                availableWeapons.forEach((w) => {
                    this.attack(targetShip, w);
                });
            }
        }
    }
    addRoom(room) {
        if (!this.availableRooms.includes(room))
            this.availableRooms.push(room);
    }
    removeRoom(room) {
        const index = this.availableRooms.findIndex((r) => r === room);
        if (index !== -1)
            this.availableRooms.splice(index, 1);
    }
    addCrewMember(data) {
        const cm = new CrewMember_1.CrewMember(data, this);
        this.crewMembers.push(cm);
        if (!this.captain)
            this.captain = cm.id;
        dist_1.default.log(`Added crew member`, cm.name, `to`, this.name);
        return cm;
    }
    removeCrewMember(id) {
        const index = this.crewMembers.findIndex((cm) => cm.id === id);
        if (index === -1) {
            dist_1.default.log(`red`, `Attempted to remove crew member that did not exist`, id, `from ship`, this.id);
            return;
        }
        this.crewMembers.splice(index, 1);
    }
    respawn() {
        super.respawn();
        this.crewMembers.forEach((cm) => {
            while (cm.inventory.length) {
                const cachePayload = cm.inventory.pop();
                // todo spawn as caches
            }
            cm.location = `bunk`;
            cm.credits *= 0.5;
        });
    }
}
exports.HumanShip = HumanShip;
//# sourceMappingURL=HumanShip.js.map