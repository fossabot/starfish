import { Ship } from '../Ship/Ship';
import { Item } from './Item';
export declare class Weapon extends Item {
    readonly range: number;
    lastUse: number;
    cooldownInMs: number;
    constructor(data: BaseWeaponData, ship: Ship);
}
//# sourceMappingURL=Weapon.d.ts.map