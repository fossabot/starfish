import { Ship } from '../Ship';
import { CombatShip } from '../CombatShip';
import { Weapon } from '../../Item/Weapon';
export declare function canAttack(this: CombatShip, otherShip: Ship): boolean;
interface DamageResult {
    damage: number;
    weapon: Weapon;
}
export declare function attack(this: CombatShip, target: CombatShip, weapon: Weapon): TakenDamageResult;
export declare function takeDamage(this: CombatShip, attacker: CombatShip, damage: DamageResult): TakenDamageResult;
export {};
//# sourceMappingURL=combat.d.ts.map