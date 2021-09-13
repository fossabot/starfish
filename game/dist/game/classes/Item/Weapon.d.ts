import type { Ship } from '../Ship/Ship';
import { Item } from './Item';
export declare class Weapon extends Item {
    readonly id: WeaponId;
    readonly range: number;
    readonly damage: number;
    lastUse: number;
    baseCooldown: number;
    cooldownRemaining: number;
    rooms: CrewLocation[];
    constructor(data: BaseWeaponData, ship: Ship, props?: Partial<BaseWeaponData>);
    use(): number;
}
//# sourceMappingURL=Weapon.d.ts.map