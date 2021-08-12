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
        const damage = miss
            ? 0
            : dist_1.default.getHitDamage(weapon, totalMunitionsSkill);
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
        this.logEntry(`${attackResult.miss ? `Missed` : `Attacked`} ${target.name} with ${weapon.displayName}${attackResult.miss
            ? `.`
            : `, dealing ${dist_1.default.r2(dist_1.default.r2(attackResult.damageTaken))} damage.`}${attackResult.didDie
            ? ` ${target.name} died in the exchange.`
            : ``}`, `high`);
        this.addStat(`damageDealt`, attackResult.damageTaken);
        if (attackResult.didDie)
            this.addStat(`kills`, 1);
        return attackResult;
    }
    takeDamage(attacker, attack) {
        const previousHp = this.hp;
        let remainingDamage = attack.damage;
        // apply passives
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
        // ----- hit armor first -----
        if (remainingDamage)
            for (let armor of this.armor) {
                const { remaining } = armor.blockDamage(remainingDamage);
                remainingDamage = remaining;
                if (armor.hp === 0 && armor.announceWhenBroken) {
                    this.logEntry(`Your ${armor.displayName} has been broken!`, `high`);
                    if (`logEntry` in attacker)
                        attacker.logEntry(`You have broken through ${this.name}'s ${armor.displayName}!`, `high`);
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
            if (!attackableEquipment.length)
                remainingDamage = 0;
            else {
                const equipmentToAttack = dist_1.default.randomFromArray(attackableEquipment);
                const remainingHp = equipmentToAttack.hp;
                // ----- not destroyed -----
                if (remainingHp >= remainingDamage) {
                    dist_1.default.log(`hitting ${equipmentToAttack.displayName} with ${remainingDamage} damage`);
                    equipmentToAttack.hp -= remainingDamage;
                    equipmentToAttack._stub = null;
                    remainingDamage = 0;
                }
                // ----- destroyed -----
                else {
                    dist_1.default.log(`destroying ${equipmentToAttack.displayName} with ${remainingHp} damage`);
                    equipmentToAttack.hp = 0;
                    equipmentToAttack._stub = null;
                    remainingDamage -= remainingHp;
                }
                // ----- notify both sides -----
                if (equipmentToAttack.hp === 0 &&
                    equipmentToAttack.announceWhenBroken) {
                    this.logEntry(`Your ${equipmentToAttack.displayName} has been disabled!`, `high`);
                    if (`logEntry` in attacker)
                        attacker.logEntry(`You have disabled ${this.name}'s ${equipmentToAttack.displayName}!`, `high`);
                    equipmentToAttack.announceWhenBroken = false;
                }
            }
        }
        this.toUpdate.items = this.items.map((i) => dist_1.default.stubify(i));
        const didDie = previousHp > 0 && this.hp <= 0;
        if (didDie)
            this.die();
        this.addStat(`damageTaken`, previousHp - this.hp);
        dist_1.default.log(`gray`, `${this.name} takes ${dist_1.default.r2(attackDamageAfterPassives)} damage from ${attacker.name}'s ${attack.weapon
            ? attack.weapon.displayName
            : `passive effect`}, and ${didDie ? `dies` : `has ${this.hp} hp left`}.`);
        this.toUpdate._hp = this.hp;
        this.toUpdate.dead = this.dead;
        // ship damage
        if (attack.weapon)
            this.logEntry(`${attack.miss
                ? `Missed by an attack from`
                : `Hit by an attack from`} ${attacker.name}'s ${attack.weapon.displayName}${attack.miss
                ? `.`
                : `, taking ${dist_1.default.r2(attackDamageAfterPassives)} damage.`}`, attack.miss ? `medium` : `high`);
        // zone or passive damage
        else
            this.logEntry(`${attack.miss ? `Missed by` : `Hit by`} ${attacker.name}${attack.miss
                ? `.`
                : `, taking ${dist_1.default.r2(attackDamageAfterPassives, 2)} damage.`}`, attack.miss ? `medium` : `high`);
        return {
            miss: attackDamageAfterPassives === 0,
            damageTaken: attackDamageAfterPassives,
            didDie: didDie,
            weapon: attack.weapon,
        };
    }
    die() {
        this.addStat(`deaths`, 1);
        this.dead = true;
    }
}
exports.CombatShip = CombatShip;
CombatShip.percentOfCreditsLostOnDeath = 0.5;
CombatShip.percentOfCreditsDroppedOnDeath = 0.25;
//# sourceMappingURL=CombatShip.js.map