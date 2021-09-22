"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CombatShip = void 0;
const dist_1 = __importDefault(require("../../../../../common/dist"));
const db_1 = require("../../../db");
const Ship_1 = require("./Ship");
class CombatShip extends Ship_1.Ship {
    constructor(props, game) {
        super(props, game);
        this.attackable = true;
        this.species.passives.forEach((p) => this.applyPassive(p));
        this.updateAttackRadius();
    }
    updateThingsThatCouldChangeOnItemChange() {
        super.updateThingsThatCouldChangeOnItemChange();
        this.updateAttackRadius();
    }
    updateAttackRadius() {
        this.radii.attack = this.weapons.reduce((highest, curr) => Math.max(curr.range * curr.repair, highest), 0);
        this.toUpdate.radii = this.radii;
    }
    applyPassive(p) {
        this.passives.push(p);
        this.updateThingsThatCouldChangeOnItemChange();
        this.updateAttackRadius();
        this.updateMaxScanProperties();
        this.updateSlots();
        this.toUpdate.passives = this.passives;
    }
    removePassive(p) {
        let index;
        if (p.data?.source?.planetName)
            index = this.passives.findIndex((ep) => {
                for (let key in ep) {
                    if (ep[key] !== p[key])
                        return false;
                    if (ep.data?.source?.planetName !==
                        p.data?.source?.planetName)
                        return false;
                }
                return true;
            });
        else
            index = this.passives.findIndex((ep) => {
                for (let key in ep)
                    if (ep[key] !== p[key])
                        return false;
                return true;
            });
        if (index === -1)
            return;
        // c.log(`removing passive`, p)
        this.passives.splice(index, 1);
        this.updateThingsThatCouldChangeOnItemChange();
        this.updateAttackRadius();
        this.updateMaxScanProperties();
        this.updateSlots();
        this.toUpdate.passives = this.passives;
    }
    applyZoneTickEffects() {
        this.visible.zones
            .filter((z) => dist_1.default.pointIsInsideCircle(z.location, this.location, z.radius))
            .forEach((z) => z.affectShip(this));
    }
    availableWeapons() {
        return this.weapons.filter((w) => w.cooldownRemaining <= 0);
    }
    getEnemiesInAttackRange() {
        const combatShipsInRange = this.visible.ships
            .map((s) => this.game.ships.find((ship) => ship.id === s.id))
            .filter((s) => s && this.canAttack(s, true));
        return combatShipsInRange;
    }
    async respawn() {
        dist_1.default.log(`Respawning`, this.name);
        const lostItems = [...this.items];
        this.items = [];
        this.previousLocations = [];
        this.recalculateMaxHp();
        this.hp = this.maxHp;
        this.dead = false;
        this.move([...(this.faction.homeworld?.location || [0, 0])].map((pos) => pos +
            dist_1.default.randomBetween(dist_1.default.arrivalThreshold * -0.4, dist_1.default.arrivalThreshold * 0.4)));
        await db_1.db.ship.addOrUpdateInDb(this);
        return lostItems;
    }
    canAttack(otherShip, ignoreWeaponState = false) {
        if (this === otherShip)
            return false;
        if (!otherShip.attackable)
            return false;
        if ((otherShip.planet && otherShip.planet.pacifist) ||
            (this.planet && this.planet.pacifist))
            return false;
        if (otherShip.dead || this.dead)
            return false;
        if (otherShip.faction &&
            this.faction &&
            otherShip.faction.id === this.faction.id)
            return false;
        if (dist_1.default.distance(otherShip.location, this.location) >
            this.radii.attack)
            return false;
        if (!ignoreWeaponState &&
            !this.availableWeapons().length)
            return false;
        return true;
    }
    attack(target, weapon, targetType) {
        if (!this.canAttack(target))
            return {
                damageTaken: 0,
                didDie: false,
                weapon,
                miss: true,
            };
        weapon.use();
        const totalMunitionsSkill = this.cumulativeSkillIn(`weapons`, `munitions`);
        const range = dist_1.default.distance(this.location, target.location);
        const rangeAsPercent = range / (weapon.range * weapon.repair);
        const minHitChance = 0.9;
        const enemyAgility = target.chassis.agility +
            (target.passives.find((p) => p.id === `boostChassisAgility`)?.intensity || 0);
        const hitRoll = Math.random();
        let miss = hitRoll * enemyAgility <
            Math.min(rangeAsPercent, minHitChance);
        // todo this makes it impossible to hit some ships even when they're "in range"... fix
        let damage = miss
            ? 0
            : dist_1.default.getHitDamage(weapon, totalMunitionsSkill);
        // apply passive
        const relevantPassives = this.passives.filter((p) => p.id ===
            `boostAttackWithNumberOfFactionMembersWithinDistance`) || [];
        let passiveDamageMultiplier = relevantPassives.reduce((total, p) => total + (p.intensity || 0), 0);
        if (passiveDamageMultiplier) {
            let factionMembersInRange = 0;
            const range = relevantPassives.reduce((avg, curr) => avg +
                (curr.data?.distance || 0) /
                    relevantPassives.length, 0);
            this.visible.ships.forEach((s) => {
                if (s?.faction?.id === this.faction.id &&
                    dist_1.default.distance(s.location, this.location) <= range)
                    factionMembersInRange++;
            });
            passiveDamageMultiplier *= factionMembersInRange;
            dist_1.default.log(`damage boosted from passive by`, passiveDamageMultiplier, `because there are`, factionMembersInRange, `faction members within`, range);
            damage *= 1 + passiveDamageMultiplier;
        }
        // * using repair only for damage rolls. hit rolls are unaffected to keep the excitement alive, know what I mean?
        if (damage === 0)
            miss = true;
        dist_1.default.log(`need to beat ${rangeAsPercent}, rolled ${hitRoll} for a ${miss ? `miss` : `hit`} of damage ${damage}`);
        const damageResult = {
            miss,
            damage,
            weapon,
            targetType,
        };
        const attackResult = target.takeDamage(this, damageResult);
        this.game.addAttackRemnant({
            attacker: this,
            defender: target,
            damageTaken: attackResult,
            start: [...this.location],
            end: [...target.location],
            time: Date.now(),
            onlyVisibleToShipId: this.tutorial
                ? this.id
                : target.tutorial
                    ? target.id
                    : undefined,
        });
        if (attackResult.miss)
            this.logEntry([
                `Missed`,
                {
                    text: target.name,
                    color: target.faction.color,
                    tooltipData: target.toLogStub(),
                },
                `with`,
                {
                    text: weapon.displayName,
                    color: `var(--item)`,
                    tooltipData: {
                        ...weapon.toLogStub(),
                        cooldownRemaining: undefined,
                    },
                },
                `&nospace.`,
            ], `low`);
        else
            this.logEntry([
                `Attacked`,
                {
                    text: target.name,
                    color: target.faction.color,
                    tooltipData: target.toLogStub(),
                },
                `with`,
                {
                    text: weapon.displayName,
                    color: `var(--item)`,
                    tooltipData: {
                        ...weapon.toLogStub(),
                        cooldownRemaining: undefined,
                        _hp: undefined,
                    },
                },
                `&nospace, dealing`,
                {
                    text: dist_1.default.r2(dist_1.default.r2(attackResult.damageTaken)) +
                        ` damage`,
                    color: `var(--success)`,
                    tooltipData: {
                        type: `damage`,
                        ...attackResult,
                    },
                },
                `&nospace.`,
                attackResult.didDie
                    ? `${target.name} died in the exchange.`
                    : ``,
            ], `high`);
        this.addStat(`damageDealt`, attackResult.damageTaken);
        if (attackResult.didDie) {
            // extra combat xp for all crew members in the weapons bay
            const xpBoostMultiplier = this.passives
                .filter((p) => p.id === `boostXpGain`)
                .reduce((total, p) => (p.intensity || 0) + total, 0) + 1;
            this.crewMembers
                .filter((cm) => cm.location === `weapons`)
                .forEach((cm) => {
                cm.addXp(`munitions`, dist_1.default.baseXpGain * 3000 * xpBoostMultiplier);
            });
            this.addStat(`kills`, 1);
            if (this.stats.find((s) => s.stat === `kills`)
                ?.amount === 1)
                this.addHeaderBackground(`Stone Cold 1`, `destroying an enemy ship`);
        }
        return attackResult;
    }
    takeDamage(attacker, attack) {
        const previousHp = this.hp;
        let remainingDamage = attack.damage;
        // ----- apply passives -----
        // scaled damage reduction
        const passiveDamageMultiplier = Math.max(0, 1 -
            this.passives
                .filter((p) => p.id === `scaledDamageReduction`)
                .reduce((total, p) => total + (p.intensity || 0), 0));
        remainingDamage *= passiveDamageMultiplier;
        // flat damage reduction
        const flatDamageReduction = this.passives
            .filter((p) => p.id === `flatDamageReduction`)
            .reduce((total, p) => total + (p.intensity || 0), 0);
        remainingDamage -= flatDamageReduction;
        if (remainingDamage < 0)
            remainingDamage = 0;
        const attackDamageAfterPassives = remainingDamage;
        // calculate passive item type damage boosts from attacker
        let itemTypeDamageMultipliers = {};
        (attacker.passives?.filter((p) => p.id === `boostDamageToItemType`) || []).forEach((p) => {
            if (!itemTypeDamageMultipliers[p.data?.type])
                itemTypeDamageMultipliers[p.data?.type] = 1 + (p.intensity || 0);
            else
                itemTypeDamageMultipliers[p.data?.type] += p.intensity || 0;
        });
        let totalDamageDealt = 0;
        const damageTally = [];
        // ----- hit armor first -----
        if (remainingDamage)
            for (let armor of this.armor) {
                let adjustedRemainingDamage = remainingDamage;
                if (itemTypeDamageMultipliers.armor)
                    adjustedRemainingDamage *=
                        itemTypeDamageMultipliers.armor;
                const { remaining, taken } = armor.blockDamage(adjustedRemainingDamage);
                totalDamageDealt += taken;
                const damageRemovedFromTotal = adjustedRemainingDamage - remaining;
                remainingDamage -= damageRemovedFromTotal;
                if (armor.hp === 0 && armor.announceWhenBroken) {
                    this.logEntry([
                        `Your`,
                        {
                            text: armor.displayName,
                            color: `var(--item)`,
                            tooltipData: armor.toLogStub(),
                        },
                        `has been broken!`,
                    ], `high`);
                    if (`logEntry` in attacker)
                        attacker.logEntry([
                            `You have broken through`,
                            {
                                text: this.name,
                                color: this.faction.color,
                                tooltipData: this.toLogStub(),
                            },
                            `&nospace's`,
                            {
                                text: armor.displayName,
                                color: `var(--item)`,
                                tooltipData: {
                                    type: `armor`,
                                    description: armor.description,
                                    displayName: armor.displayName,
                                    id: armor.id,
                                },
                            },
                            `&nospace!`,
                        ], `high`);
                    armor.announceWhenBroken = false;
                }
                damageTally.push({
                    targetType: `armor`,
                    targetDisplayName: armor.displayName,
                    damage: taken,
                    damageBlocked: damageRemovedFromTotal,
                    destroyed: armor.hp === 0,
                });
            }
        // ----- distribute remaining damage -----
        while (remainingDamage > 0) {
            let attackableEquipment = [];
            if (attack.targetType)
                attackableEquipment = this.items.filter((i) => i.repair > 0 && i.type === attack.targetType);
            if (!attackableEquipment.length)
                attackableEquipment = this.items.filter((i) => i.repair > 0);
            // nothing to attack, so we're done
            if (!attackableEquipment.length) {
                remainingDamage = 0;
                break;
            }
            const equipmentToAttack = dist_1.default.randomFromArray(attackableEquipment);
            // apply passive damage boost to item types
            let adjustedRemainingDamage = remainingDamage;
            if (itemTypeDamageMultipliers[equipmentToAttack.type] !== undefined) {
                adjustedRemainingDamage *=
                    itemTypeDamageMultipliers[equipmentToAttack.type];
                dist_1.default.log(`damage to`, equipmentToAttack.type, `boosted by passive:`, remainingDamage, `became`, adjustedRemainingDamage);
            }
            const remainingHp = equipmentToAttack.hp;
            // ----- item not destroyed -----
            if (remainingHp >= adjustedRemainingDamage) {
                // c.log(
                //   `hitting ${equipmentToAttack.displayName} with ${adjustedRemainingDamage} damage`,
                // )
                equipmentToAttack.hp -= adjustedRemainingDamage;
                equipmentToAttack._stub = null;
                remainingDamage = 0;
                totalDamageDealt += adjustedRemainingDamage;
                damageTally.push({
                    targetType: equipmentToAttack.type,
                    targetDisplayName: equipmentToAttack.displayName,
                    damage: adjustedRemainingDamage,
                    destroyed: false,
                });
            }
            // ----- item destroyed -----
            else {
                // c.log(
                //   `destroying ${equipmentToAttack.displayName} with ${remainingHp} damage`,
                // )
                equipmentToAttack.hp = 0;
                equipmentToAttack._stub = null;
                remainingDamage -= remainingHp;
                totalDamageDealt += remainingHp;
                damageTally.push({
                    targetType: equipmentToAttack.type,
                    targetDisplayName: equipmentToAttack.displayName,
                    damage: remainingHp,
                    destroyed: true,
                });
            }
            // ----- notify both sides -----
            if (equipmentToAttack.hp === 0 &&
                equipmentToAttack.announceWhenBroken) {
                this.logEntry([
                    `Your`,
                    {
                        text: equipmentToAttack.displayName,
                        color: `var(--item)`,
                        tooltipData: equipmentToAttack.toLogStub(),
                    },
                    `has been disabled!`,
                ], `high`);
                if (`logEntry` in attacker)
                    attacker.logEntry([
                        `You have disabled`,
                        {
                            text: this.name,
                            color: this.faction.color,
                            tooltipData: this.toLogStub(),
                        },
                        `&nospace's`,
                        {
                            text: equipmentToAttack.displayName,
                            color: `var(--item)`,
                            tooltipData: {
                                displayName: equipmentToAttack.displayName,
                                description: equipmentToAttack.description,
                                type: equipmentToAttack.type,
                            },
                        },
                        `&nospace!`,
                    ], `high`);
                equipmentToAttack.announceWhenBroken = false;
            }
        }
        this.toUpdate.items = this.items.map((i) => dist_1.default.stubify(i));
        const didDie = previousHp > 0 && this.hp <= 0;
        if (didDie)
            this.die(attacker instanceof CombatShip
                ? attacker
                : undefined);
        this.addStat(`damageTaken`, totalDamageDealt);
        // c.log(
        //   `gray`,
        //   `${this.name} takes ${c.r2(
        //     totalDamageDealt,
        //   )} damage from ${attacker.name}'s ${
        //     attack.weapon
        //       ? attack.weapon.displayName
        //       : `passive effect`
        //   }, and ${
        //     didDie ? `dies` : `has ${this.hp} hp left`
        //   }.`,
        // )
        this.toUpdate._hp = this.hp;
        this.toUpdate.dead = this.dead;
        const damageResult = {
            miss: attackDamageAfterPassives === 0,
            damageTaken: totalDamageDealt,
            didDie: didDie,
            weapon: attack.weapon?.stubify(),
            damageTally,
        };
        // ship damage
        if (attack.weapon)
            this.logEntry([
                attack.miss
                    ? `Missed by an attack from`
                    : `Hit by an attack from`,
                {
                    text: attacker.name,
                    color: attacker.faction.color,
                    tooltipData: attacker.toLogStub(),
                },
                `&nospace's`,
                {
                    text: attack.weapon.displayName,
                    color: `var(--item)`,
                    tooltipData: {
                        type: `weapon`,
                        description: attack.weapon.description,
                        displayName: attack.weapon.displayName,
                        id: attack.weapon.id,
                    },
                },
                `&nospace.`,
                ...(attack.miss
                    ? [``]
                    : [
                        `You took`,
                        {
                            text: `${dist_1.default.r2(totalDamageDealt)} damage`,
                            color: `var(--warning)`,
                            tooltipData: {
                                type: `damage`,
                                ...damageResult,
                            },
                        },
                        `&nospace.`,
                    ]),
            ], attack.miss ? `low` : `high`);
        // zone or passive damage
        else
            this.logEntry([
                attack.miss ? `Missed by` : `Hit by`,
                {
                    text: attacker.name,
                    color: attacker.color || `var(--warning)`,
                    tooltipData: attacker.stubify
                        ? attacker.stubify()
                        : undefined,
                },
                `&nospace.`,
                ...(attack.miss
                    ? [``]
                    : [
                        `You took`,
                        {
                            text: `${dist_1.default.r2(totalDamageDealt)} damage`,
                            color: `var(--warning)`,
                            tooltipData: {
                                type: `damage`,
                                ...damageResult,
                            },
                        },
                        `&nospace.`,
                    ]),
            ], attack.miss ? `low` : `high`);
        return damageResult;
    }
    die(attacker) {
        this.addStat(`deaths`, 1);
        this.dead = true;
    }
    repair(baseRepairAmount, repairPriority = `most damaged`) {
        let totalRepaired = 0;
        const repairableItems = this.items.filter((i) => i.repair <= 0.9995);
        if (!repairableItems.length)
            return { totalRepaired, overRepair: false };
        const itemsToRepair = [];
        if (repairPriority === `engines`) {
            const r = repairableItems.filter((i) => i.type === `engine`);
            itemsToRepair.push(...r);
        }
        else if (repairPriority === `weapons`) {
            const r = repairableItems.filter((i) => i.type === `weapon`);
            itemsToRepair.push(...r);
        }
        else if (repairPriority === `scanners`) {
            const r = repairableItems.filter((i) => i.type === `scanner`);
            itemsToRepair.push(...r);
        }
        else if (repairPriority === `communicators`) {
            const r = repairableItems.filter((i) => i.type === `communicator`);
            itemsToRepair.push(...r);
        }
        if (itemsToRepair.length === 0 ||
            repairPriority === `most damaged`)
            itemsToRepair.push(repairableItems.reduce((mostBroken, ri) => ri.repair < mostBroken.repair ? ri : mostBroken, repairableItems[0]));
        const repairBoost = (this.passives.find((p) => p.id === `boostRepairSpeed`)?.intensity || 0) + 1;
        const amountToRepair = (baseRepairAmount * repairBoost) /
            (dist_1.default.deltaTime / dist_1.default.tickInterval) /
            itemsToRepair.length;
        // c.log(
        //   repairPriority,
        //   amountToRepair,
        //   itemsToRepair.map((i) => i.type),
        // )
        let overRepair = false;
        itemsToRepair.forEach((ri) => {
            const previousRepair = ri.repair;
            const res = ri.applyRepair(amountToRepair);
            overRepair = overRepair || res;
            totalRepaired += ri.repair - previousRepair;
        });
        this.updateThingsThatCouldChangeOnItemChange();
        return { totalRepaired, overRepair };
    }
}
exports.CombatShip = CombatShip;
CombatShip.percentOfCreditsLostOnDeath = 0.5;
CombatShip.percentOfCreditsDroppedOnDeath = 0.25;
//# sourceMappingURL=CombatShip.js.map