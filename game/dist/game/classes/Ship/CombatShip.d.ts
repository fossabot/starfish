import { Ship } from './Ship';
import type { Weapon } from '../Item/Weapon';
import type { Game } from '../../Game';
interface DamageResult {
    miss: boolean;
    damage: number;
    weapon: Weapon;
    targetType?: ItemType;
}
export declare abstract class CombatShip extends Ship {
    attackable: boolean;
    constructor(props: BaseShipData, game: Game);
    updateAttackRadius(): void;
    availableWeapons(): Weapon[];
    getEnemiesInAttackRange(): CombatShip[];
    respawn(): void;
    canAttack(this: CombatShip, otherShip: Ship, ignoreWeaponState?: boolean): boolean;
    attack(this: CombatShip, target: CombatShip, weapon: Weapon, targetType?: ItemType): TakenDamageResult;
    takeDamage(this: CombatShip, attacker: CombatShip, attack: DamageResult): TakenDamageResult;
    die(): void;
}
export {};
//# sourceMappingURL=CombatShip.d.ts.map