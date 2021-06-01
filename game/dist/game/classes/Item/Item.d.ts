import type { Ship } from '../Ship/Ship';
export declare class Item {
    readonly type: ItemType;
    readonly id: ItemId;
    readonly displayName: string;
    readonly description: string;
    repair: number;
    maxHp: number;
    readonly ship: Ship;
    announceWhenRepaired: boolean;
    announceWhenBroken: boolean;
    constructor({ type, id, displayName, description, repair, maxHp, hp, }: BaseItemData, ship: Ship, props?: Partial<BaseItemData>);
    get hp(): number;
    set hp(newHp: number);
    use(): number;
}
//# sourceMappingURL=Item.d.ts.map