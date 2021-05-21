import type { Ship } from '../Ship/Ship';
import { Item } from './Item';
export declare class Weapon extends Item {
    readonly id: WeaponType;
    readonly range: number;
    readonly damage: number;
    lastUse: number;
    baseCooldown: number;
    cooldownRemaining: number;
    constructor(data: BaseWeaponData, ship: Ship, props?: Partial<BaseWeaponData>);
    use(): void;
}
//# sourceMappingURL=Weapon.d.ts.map