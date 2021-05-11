import { Ship } from './Ship';
import { Weapon } from '../Item/Weapon';
import { attack, takeDamage, canAttack, die } from './addins/combat';
export declare class CombatShip extends Ship {
    attackable: boolean;
    hp: number;
    get attackRange(): number;
    get availableWeapons(): Weapon[];
    get enemiesInAttackRange(): CombatShip[];
    get alive(): boolean;
    attack: typeof attack;
    takeDamage: typeof takeDamage;
    canAttack: typeof canAttack;
    die: typeof die;
}
//# sourceMappingURL=CombatShip.d.ts.map