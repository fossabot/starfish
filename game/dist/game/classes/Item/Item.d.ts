import type { Ship } from '../Ship/Ship';
export declare class Item {
    readonly type: ItemType;
    readonly id: string;
    readonly displayName: string;
    readonly description: string;
    repair: number;
    maxHp: number;
    readonly ship: Ship;
    announceWhenRepaired: boolean;
    constructor({ type, id, displayName, description, repair, maxHp, hp, }: BaseItemData, ship: Ship, props?: Partial<BaseItemData>);
    get hp(): number;
    set hp(newHp: number);
    use(): void;
}
//# sourceMappingURL=Item.d.ts.map