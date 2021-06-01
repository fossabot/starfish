import type { Ship } from '../Ship/Ship';
import { Item } from './Item';
export declare class Armor extends Item {
    readonly id: ArmorId;
    readonly damageReduction: number;
    constructor(data: BaseArmorData, ship: Ship, props?: Partial<BaseArmorData>);
    blockDamage(totalDamage: number): {
        taken: number;
        mitigated: number;
        remaining: number;
    };
}
//# sourceMappingURL=Armor.d.ts.map