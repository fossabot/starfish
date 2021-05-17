import { Ship } from './Ship';
import { Weapon } from '../Item/Weapon';
import { attack, takeDamage, canAttack } from './addins/combat';
export declare class CombatShip extends Ship {
    attackable: boolean;
    attackRange(): number;
    availableWeapons(): Weapon[];
    enemiesInAttackRange(): CombatShip[];
    attack: typeof attack;
    takeDamage: typeof takeDamage;
    canAttack: typeof canAttack;
}
//# sourceMappingURL=CombatShip.d.ts.map