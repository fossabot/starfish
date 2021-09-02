import { Ship } from './Ship';
import type { Weapon } from '../Item/Weapon';
import type { Game } from '../../Game';
interface DamageResult {
    miss: boolean;
    damage: number;
    weapon?: Weapon;
    targetType?: ItemType;
}
export declare abstract class CombatShip extends Ship {
    static percentOfCreditsLostOnDeath: number;
    static percentOfCreditsDroppedOnDeath: number;
    attackable: boolean;
    constructor(props: BaseShipData, game: Game);
    updateThingsThatCouldChangeOnItemChange(): void;
    updateAttackRadius(): void;
    applyPassive(p: ShipPassiveEffect): void;
    removePassive(p: ShipPassiveEffect): void;
    applyZoneTickEffects(): void;
    availableWeapons(): Weapon[];
    getEnemiesInAttackRange(): CombatShip[];
    respawn(): void;
    canAttack(this: CombatShip, otherShip: Ship, ignoreWeaponState?: boolean): boolean;
    attack(this: CombatShip, target: CombatShip, weapon: Weapon, targetType?: ItemType): TakenDamageResult;
    takeDamage(this: CombatShip, attacker: {
        name: string;
        [key: string]: any;
    }, attack: DamageResult): TakenDamageResult;
    die(attacker?: CombatShip): void;
    repair(baseRepairAmount: number, repairPriority?: RepairPriority): {
        totalRepaired: number;
        overRepair: boolean;
    };
}
export {};
//# sourceMappingURL=CombatShip.d.ts.map