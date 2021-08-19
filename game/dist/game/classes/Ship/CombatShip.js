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
        this.radii.attack = this.weapons.reduce((highest, curr) => Math.max(curr.range, highest), 0);
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
        const index = this.passives.findIndex((ep) => {
            for (let key in ep)
                if (ep[key] !== p[key])
                    return false;
            return true;
        });
        if (index === -1)
            return;
        dist_1.default.log(`removing passive`, p);
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
    respawn() {
        dist_1.default.log(`Respawning`, this.name);
        this.items = [];
        this.previousLocations = [];
        this.recalculateMaxHp();
        this.hp = this.maxHp;
        this.dead = false;
        this.move([...(this.faction.homeworld?.location || [0, 0])].map((pos) => pos + dist_1.default.randomBetween(-0.00001, 0.00001)));
        db_1.db.ship.addOrUpdateInDb(this);
    }
    canAttack(otherShip, ignoreWeaponState = false) {
        if (this === otherShip)
            return false;
        if (!otherShip.attackable)
            return false;
        if (otherShip.planet || this.planet)
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
        const rangeAsPercent = range / weapon.range;
        const enemyAgility = target.chassis.agility +
            (target.passives.find((p) => p.id === `boostChassisAgility`)?.intensity || 0);
        const hitRoll = Math.random();
        let miss = hitRoll * enemyAgility < rangeAsPercent;
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
                (curr.distance || 0) / relevantPassives.length, 0);
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
                    tooltipData: {
                        type: `ship`,
                        name: target.name,
                        faction: target.faction,
                        species: target.species,
                        tagline: target.tagline,
                        headerBackground: target.headerBackground,
                    },
                },
                `with`,
                {
                    text: weapon.displayName,
                    tooltipData: weapon.stubify(),
                },
                `&nospace.`,
            ], `high`);
        else
            this.logEntry([
                `Attacked`,
                {
                    text: target.name,
                    color: target.faction.color,
                    tooltipData: {
                        type: `ship`,
                        name: target.name,
                        faction: target.faction,
                        species: target.species,
                        tagline: target.tagline,
                        headerBackground: target.headerBackground,
                    },
                },
                `with`,
                {
                    text: weapon.displayName,
                    tooltipData: weapon.stubify(),
                },
                `&nospace, dealing`,
                {
                    text: dist_1.default.r2(dist_1.default.r2(attackResult.damageTaken)) +
                        ` damage`,
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
            this.addStat(`kills`, 1);
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
            if (!itemTypeDamageMultipliers[p.type])
                itemTypeDamageMultipliers[p.type] =
                    1 + (p.intensity || 0);
            else
                itemTypeDamageMultipliers[p.type] +=
                    p.intensity || 0;
        });
        let totalDamageDealt = 0;
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
                            tooltipData: armor.stubify(),
                        },
                        `has been broken!`,
                    ], `high`);
                    if (`logEntry` in attacker)
                        attacker.logEntry([
                            `You have broken through`,
                            {
                                text: this.name,
                                color: this.faction.color,
                                tooltipData: {
                                    type: `ship`,
                                    name: this.name,
                                    faction: this.faction,
                                    species: this.species,
                                    tagline: this.tagline,
                                    headerBackground: this.headerBackground,
                                },
                            },
                            `&nospace's`,
                            {
                                text: armor.displayName,
                                tooltipData: armor.stubify(),
                            },
                            `&nospace!`,
                        ], `high`);
                    armor.announceWhenBroken = false;
                }
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
                dist_1.default.log(`hitting ${equipmentToAttack.displayName} with ${adjustedRemainingDamage} damage`);
                equipmentToAttack.hp -= adjustedRemainingDamage;
                equipmentToAttack._stub = null;
                remainingDamage = 0;
                totalDamageDealt += adjustedRemainingDamage;
            }
            // ----- item destroyed -----
            else {
                dist_1.default.log(`destroying ${equipmentToAttack.displayName} with ${remainingHp} damage`);
                equipmentToAttack.hp = 0;
                equipmentToAttack._stub = null;
                remainingDamage -= remainingHp;
                totalDamageDealt += remainingHp;
            }
            // ----- notify both sides -----
            if (equipmentToAttack.hp === 0 &&
                equipmentToAttack.announceWhenBroken) {
                this.logEntry([
                    `Your`,
                    {
                        text: equipmentToAttack.displayName,
                        tooltipData: equipmentToAttack.stubify(),
                    },
                    `has been disabled!`,
                ], `high`);
                if (`logEntry` in attacker)
                    attacker.logEntry([
                        `You have disabled`,
                        {
                            text: this.name,
                            color: this.faction.color,
                            tooltipData: {
                                type: `ship`,
                                name: this.name,
                                faction: this.faction,
                                species: this.species,
                                tagline: this.tagline,
                                headerBackground: this.headerBackground,
                            },
                        },
                        `&nospace's`,
                        {
                            text: equipmentToAttack.displayName,
                            tooltipData: equipmentToAttack.stubify(),
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
        dist_1.default.log(`gray`, `${this.name} takes ${dist_1.default.r2(totalDamageDealt)} damage from ${attacker.name}'s ${attack.weapon
            ? attack.weapon.displayName
            : `passive effect`}, and ${didDie ? `dies` : `has ${this.hp} hp left`}.`);
        this.toUpdate._hp = this.hp;
        this.toUpdate.dead = this.dead;
        const damageResult = {
            miss: attackDamageAfterPassives === 0,
            damageTaken: totalDamageDealt,
            didDie: didDie,
            weapon: attack.weapon?.stubify(),
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
                    tooltipData: {
                        type: `ship`,
                        name: attacker.name,
                        faction: attacker.faction,
                        species: attacker.species,
                        tagline: attacker.tagline,
                        headerBackground: attacker.headerBackground,
                    },
                },
                `&nospace's`,
                {
                    text: attack.weapon.displayName,
                    tooltipData: {
                        type: `weapon`,
                        damage: attack.weapon.damage,
                        description: attack.weapon.description,
                        range: attack.weapon.range,
                        displayName: attack.weapon.displayName,
                        id: attack.weapon.id,
                        mass: attack.weapon.mass,
                    },
                },
                `&nospace.`,
                ...(attack.miss
                    ? [``]
                    : [
                        `You took`,
                        {
                            text: `${dist_1.default.r2(totalDamageDealt)}`,
                            tooltipData: {
                                type: `damage`,
                                ...damageResult,
                            },
                        },
                        `damage.`,
                    ]),
            ], attack.miss ? `medium` : `high`);
        // zone or passive damage
        else
            this.logEntry([
                attack.miss ? `Missed by` : `Hit by`,
                {
                    text: attacker.name,
                    color: attacker.color || `red`,
                },
                `&nospace.`,
                ...(attack.miss
                    ? [``]
                    : [
                        `You took`,
                        {
                            text: `${dist_1.default.r2(totalDamageDealt)}`,
                            tooltipData: {
                                type: `damage`,
                                ...damageResult,
                            },
                        },
                        `damage.`,
                    ]),
            ], attack.miss ? `medium` : `high`);
        return damageResult;
    }
    die(attacker) {
        this.addStat(`deaths`, 1);
        this.dead = true;
    }
}
exports.CombatShip = CombatShip;
CombatShip.percentOfCreditsLostOnDeath = 0.5;
CombatShip.percentOfCreditsDroppedOnDeath = 0.25;
//# sourceMappingURL=CombatShip.js.map