import type { Ship } from '../Ship/Ship';
import { Stubbable } from '../Stubbable';
export declare class Item extends Stubbable {
    readonly type: ItemType;
    readonly id: ItemId;
    readonly displayName: string;
    readonly description: string;
    readonly repairDifficulty: number;
    readonly reliability: number;
    repair: number;
    maxHp: number;
    readonly ship: Ship;
    announceWhenRepaired: boolean;
    announceWhenBroken: boolean;
    constructor({ type, id, displayName, description, repair, maxHp, hp, repairDifficulty, reliability, }: BaseItemData, ship: Ship, props?: Partial<BaseItemData>);
    get hp(): number;
    set hp(newHp: number);
    use(): number;
}
//# sourceMappingURL=Item.d.ts.map