"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CombatShip = void 0;
const dist_1 = __importDefault(require("../../../../../common/dist"));
const io_1 = require("../../../server/io");
const Ship_1 = require("./Ship");
class CombatShip extends Ship_1.Ship {
    constructor() {
        super(...arguments);
        this.attackable = true;
    }
    attackRange() {
        return this.weapons.reduce((highest, curr) => Math.max(curr.range, highest), 0);
    }
    availableWeapons() {
        return this.weapons.filter((w) => w.cooldownRemaining <= 0);
    }
    getEnemiesInAttackRange() {
        const combatShipsInRange = this.visible.ships.filter((s) => this.canAttack(s, true));
        return combatShipsInRange;
    }
    respawn() {
        while (this.weapons.length)
            this.weapons.pop();
        while (this.engines.length)
            this.engines.pop();
        this.equipLoadout(`human_default`);
        this.recalculateMaxHp();
        this.hp = this.maxHp;
        this.dead = false;
        let moveTo;
        if (this.faction) {
            moveTo = [
                ...(this.faction.homeworld?.location || [0, 0]),
            ];
        }
        else
            moveTo = [0, 0];
        this.move(moveTo);
        while (this.previousLocations.length)
            this.previousLocations.pop();
    }
    canAttack(otherShip, ignoreWeaponState = false) {
        if (!(otherShip instanceof CombatShip))
            return false;
        if (otherShip.planet || this.planet)
            return false;
        if (otherShip.dead || this.dead)
            return false;
        if (!otherShip?.attackable)
            return false;
        if (otherShip.faction &&
            this.faction &&
            otherShip.faction.color === this.faction.color)
            return false;
        if (dist_1.default.distance(otherShip.location, this.location) >
            this.attackRange())
            return false;
        if (!ignoreWeaponState &&
            !this.availableWeapons().length)
            return false;
        return true;
    }
    attack(target, weapon, targetType) {
        if (!this.canAttack(target))
            return { damageTaken: 0, didDie: false, weapon };
        weapon.use();
        const totalMunitionsSkill = this.cumulativeSkillIn(`weapons`, `munitions`);
        const range = dist_1.default.distance(this.location, target.location);
        const rangeAsPercent = range / weapon.range;
        const miss = Math.random() > rangeAsPercent;
        const damage = miss
            ? 0
            : weapon.damage * totalMunitionsSkill;
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
        });
        return attackResult;
    }
    takeDamage(attacker, attack) {
        const previousHp = this.hp;
        let remainingDamage = attack.damage;
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
                if (remainingHp >= remainingDamage) {
                    equipmentToAttack.hp -= remainingDamage;
                    remainingDamage = 0;
                }
                else {
                    equipmentToAttack.hp = 0;
                    remainingDamage -= remainingHp;
                }
            }
        }
        this.toUpdate.weapons = io_1.stubify(this.weapons);
        this.toUpdate.engines = io_1.stubify(this.engines);
        const didDie = previousHp > 0 && this.hp <= 0;
        if (didDie) {
            // ----- notify listeners -----
            io_1.io.to(`ship:${this.id}`).emit(`ship:die`, io_1.stubify(this));
            this.dead = true;
        }
        else
            this.dead = false;
        dist_1.default.log(`${this.name} takes ${attack.damage} damage from ${attacker.name}'s ${attack.weapon.displayName}, and ${didDie ? `dies` : `has ${this.hp} hp left`}.`);
        // ----- notify listeners -----
        io_1.io.to(`ship:${this.id}`).emit(`ship:update`, {
            id: this.id,
            updates: { dead: this.dead, _hp: this.hp },
        });
        this.toUpdate._hp = this.hp;
        return {
            damageTaken: attack.damage,
            didDie: didDie,
            weapon: attack.weapon,
        };
    }
}
exports.CombatShip = CombatShip;
//# sourceMappingURL=CombatShip.js.map