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
        this.targetShip = null;
        this.targetItemType = `any`;
        this.combatTactic = `defensive`;
        this.attackable = true;
        // todo replace when there are passives
        // if (this.factionId) c.factions[this.factionId]?.passives.forEach((p) =>
        //   this.applyPassive(p),
        // )
        this.updateAttackRadius();
    }
    // move(toLocation?: CoordinatePair) {
    //   const previousLocation: CoordinatePair = [
    //     ...this.location,
    //   ]
    //   super.move(toLocation)
    //   // * this does nothing yet, just chilling
    // }
    updateThingsThatCouldChangeOnItemChange() {
        super.updateThingsThatCouldChangeOnItemChange();
        this.updateAttackRadius();
    }
    updateAttackRadius() {
        this.radii.attack = this.weapons.reduce((highest, curr) => Math.max(curr.effectiveRange, highest), 0);
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
            .filter((s) => s &&
            (!this.onlyVisibleToShipId ||
                s.id === this.onlyVisibleToShipId))
            .filter((s) => s && this.canAttack(s, true));
        return combatShipsInRange;
    }
    recalculateTargetShip() {
        const enemies = this.getEnemiesInAttackRange();
        if (!enemies.length) {
            this.targetShip = null;
            return this.targetShip;
        }
        this.targetShip = dist_1.default.randomFromArray(enemies);
        return this.targetShip;
    }
    async respawn() {
        dist_1.default.log(`Respawning`, this.name);
        this.items = [];
        this.previousLocations = [];
        this.recalculateMaxHp();
        this.hp = this.maxHp;
        this.dead = false;
        this.move([
            ...(this.game.getHomeworld(this.factionId)
                ?.location || [0, 0]),
        ].map((pos) => pos +
            dist_1.default.randomBetween(this.game.settings.arrivalThreshold * -0.4, this.game.settings.arrivalThreshold * 0.4)));
        await db_1.db.ship.addOrUpdateInDb(this);
    }
    canAttack(otherShip, ignoreWeaponState = false) {
        // self
        if (this === otherShip)
            return false;
        // not attackable
        if (!otherShip.attackable)
            return false;
        // can't see it
        if (!this.visible.ships.find((s) => s.id === otherShip.id))
            return false;
        // either is at pacifist planet
        if ((otherShip.planet && otherShip.planet.pacifist) ||
            (this.planet && this.planet.pacifist))
            return false;
        // dead
        if (otherShip.dead || this.dead)
            return false;
        // same faction
        if (otherShip.factionId &&
            otherShip.factionId === this.factionId)
            return false;
        // too far, or not in sight range
        if (dist_1.default.distance(otherShip.location, this.location) >
            Math.min(this.radii.attack, this.radii.sight))
            return false;
        // no weapons available
        if (!ignoreWeaponState &&
            !this.availableWeapons().length)
            return false;
        return true;
    }
    attack(target, weapon, targetType = `any`) {
        if (!this.canAttack(target))
            return {
                damageTaken: 0,
                didDie: false,
                weapon,
                miss: true,
            };
        weapon.use(1, this.membersIn(`weapons`));
        const totalMunitionsSkill = this.cumulativeSkillIn(`weapons`, `munitions`);
        const range = dist_1.default.distance(this.location, target.location);
        const rangeAsPercent = range / weapon.effectiveRange;
        const minHitChance = 0.95;
        const enemyAgility = target.chassis.agility +
            (target.passives.find((p) => p.id === `boostChassisAgility`)?.intensity || 0);
        const hitRoll = Math.random();
        let miss = hitRoll * enemyAgility <
            Math.min(rangeAsPercent, minHitChance);
        const didCrit = Math.random() <=
            (weapon.critChance === undefined
                ? this.game.settings.baseCritChance
                : weapon.critChance);
        let damage = miss
            ? 0
            : dist_1.default.getHitDamage(weapon, totalMunitionsSkill) *
                (didCrit
                    ? this.game.settings.baseCritDamageMultiplier
                    : 1);
        if (!miss) {
            // ----- apply passives -----
            const factionMembersWithinDistancePassives = this.passives.filter((p) => p.id ===
                `boostDamageWithNumberOfFactionMembersWithinDistance`) || [];
            if (factionMembersWithinDistancePassives.length) {
                let damageMultiplier = 1;
                factionMembersWithinDistancePassives.forEach((p) => {
                    let factionMembersInRange = 0;
                    const range = p.data?.distance || 0;
                    this.visible.ships.forEach((s) => {
                        if (s?.factionId &&
                            s?.factionId === this.factionId &&
                            dist_1.default.distance(s.location, this.location) <=
                                range)
                            factionMembersInRange++;
                    });
                    dist_1.default.log(`damage boosted by`, (p.intensity || 0) * factionMembersInRange, `because there are`, factionMembersInRange, `faction members within`, range);
                    damageMultiplier +=
                        (p.intensity || 0) * factionMembersInRange;
                });
                damage *= damageMultiplier;
            }
            const soloPassives = this.passives.filter((p) => p.id ===
                `boostDamageWhenNoAlliesWithinDistance`) || [];
            if (soloPassives.length) {
                let damageMultiplier = 1;
                soloPassives.forEach((p) => {
                    let factionMembersInRange = 0;
                    const range = p.data?.distance || 0;
                    this.visible.ships.forEach((s) => {
                        if (s?.factionId &&
                            s?.factionId === this.factionId &&
                            dist_1.default.distance(s.location, this.location) <= range)
                            factionMembersInRange++;
                    });
                    if (!factionMembersInRange)
                        damageMultiplier += p.intensity || 0;
                });
                if (damageMultiplier > 1)
                    dist_1.default.log(`damage multiplied by`, damageMultiplier, `because there are no faction members within`, range);
                damage *= damageMultiplier;
            }
            const boostDamagePassiveMultiplier = this.getPassiveIntensity(`boostDamage`) + 1;
            if (boostDamagePassiveMultiplier > 1)
                dist_1.default.log(`damage multiplied by`, boostDamagePassiveMultiplier, `because of damage boost passive(s)`);
            damage *= boostDamagePassiveMultiplier;
            // ----- done with passives -----
        }
        // * using weapon repair level only for damage rolls. hit rolls are unaffected to keep the excitement alive, know what I mean?
        if (damage === 0)
            miss = true;
        dist_1.default.log(`gray`, `need to beat ${Math.min(rangeAsPercent, minHitChance)}, rolled ${hitRoll} for a ${miss
            ? `miss`
            : `${didCrit ? `crit` : `hit`} of damage ${damage}`}`);
        const damageResult = {
            miss,
            damage,
            weapon,
            targetType: targetType || `any`,
            didCrit,
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
                    color: target.factionId &&
                        dist_1.default.factions[target.factionId].color,
                    tooltipData: target.toReference(),
                },
                `with`,
                {
                    text: weapon.displayName,
                    color: `var(--item)`,
                    tooltipData: {
                        ...weapon.toReference(),
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
                    color: target.factionId &&
                        dist_1.default.factions[target.factionId].color,
                    tooltipData: target.toReference(),
                },
                `with`,
                {
                    text: weapon.displayName,
                    color: `var(--item)`,
                    tooltipData: {
                        ...weapon.toReference(),
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
                `&nospace${didCrit ? ` in a critical hit` : ``}.`,
                attackResult.didDie
                    ? `${target.name} died in the exchange.`
                    : ``,
            ], `high`);
        this.addStat(`damageDealt`, attackResult.damageTaken);
        // extra combat xp on attack for all crew members in the weapons bay
        const xpBoostMultiplier = this.passives
            .filter((p) => p.id === `boostXpGain`)
            .reduce((total, p) => (p.intensity || 0) + total, 0) + 1;
        this.crewMembers
            .filter((cm) => cm.location === `weapons`)
            .forEach((cm) => {
            cm.addXp(`munitions`, this.game.settings.baseXpGain *
                Math.round(weapon.damage * 40) *
                xpBoostMultiplier);
        });
        if (attackResult.didDie) {
            // extra combat xp on kill for all crew members in the weapons bay
            this.crewMembers
                .filter((cm) => cm.location === `weapons`)
                .forEach((cm) => {
                cm.addXp(`munitions`, this.game.settings.baseXpGain *
                    3000 *
                    xpBoostMultiplier);
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
                            tooltipData: armor.toReference(),
                        },
                        `has been broken!`,
                    ], `high`);
                    if (`logEntry` in attacker)
                        attacker.logEntry([
                            `You have broken through`,
                            {
                                text: this.name,
                                color: this.factionId &&
                                    dist_1.default.factions[this.factionId].color,
                                tooltipData: this.toReference(),
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
                dist_1.default.log(`gray`, `hitting ${equipmentToAttack.displayName} with ${adjustedRemainingDamage} damage (${remainingHp} hp remaining)`);
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
                dist_1.default.log(`gray`, `destroying ${equipmentToAttack.displayName} with ${remainingHp} damage`);
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
                // timeout so the hit message comes first
                setTimeout(() => {
                    this.logEntry([
                        `Your`,
                        {
                            text: equipmentToAttack.displayName,
                            color: `var(--item)`,
                            tooltipData: equipmentToAttack.toReference(),
                        },
                        `has been disabled!`,
                    ], `high`);
                    if (`logEntry` in attacker && !didDie)
                        attacker.logEntry([
                            `You have disabled`,
                            {
                                text: this.name,
                                color: this.factionId &&
                                    dist_1.default.factions[this.factionId].color,
                                tooltipData: this.toReference(),
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
                }, 100);
                equipmentToAttack.announceWhenBroken = false;
            }
        }
        this.toUpdate.items = this.items.map((i) => i.stubify());
        const didDie = previousHp > 0 && this.hp <= 0;
        if (didDie)
            this.die(attacker instanceof CombatShip
                ? attacker
                : undefined);
        this.addStat(`damageTaken`, totalDamageDealt);
        dist_1.default.log(`gray`, `${this.name} takes ${dist_1.default.r2(totalDamageDealt)} damage from ${attacker.name}'s ${attack.weapon
            ? attack.weapon.displayName
            : `passive effect`}, and ${didDie ? `dies` : `has ${this.hp} hp left`}.`);
        this.toUpdate._hp = this.hp;
        this.toUpdate.dead = this.dead;
        const damageResult = {
            miss: attackDamageAfterPassives === 0,
            damageTaken: totalDamageDealt,
            didDie: didDie,
            weapon: attack.weapon?.toReference(),
            damageTally,
        };
        // ship damage
        if (attack.weapon)
            this.logEntry([
                attack.miss
                    ? `Missed by an attack from`
                    : `${attack.didCrit
                        ? `Critical hit`
                        : `Hit by an attack`} from`,
                {
                    text: attacker.name,
                    color: attacker.faction.color,
                    tooltipData: attacker?.toReference(),
                },
                `&nospace's`,
                {
                    text: attack.weapon.displayName,
                    color: `var(--item)`,
                    tooltipData: attack.weapon.toReference(),
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
                                ...{
                                    ...damageResult,
                                    weapon: undefined,
                                },
                            },
                        },
                        `&nospace.`,
                    ]),
            ], attack.miss ? `low` : `high`);
        // zone or passive damage
        else
            this.logEntry([
                attack.miss
                    ? `Missed by`
                    : `${attack.didCrit ? `Critical hit` : `Hit`} by`,
                {
                    text: attacker.name,
                    color: attacker.color || `var(--warning)`,
                    tooltipData: attacker.toReference
                        ? attacker.toReference()
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
                                ...{
                                    ...damageResult,
                                    weapon: undefined,
                                },
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