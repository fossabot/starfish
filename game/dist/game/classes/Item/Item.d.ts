import { Ship } from '../Ship/Ship';
export declare class Item {
    readonly id: string;
    readonly displayName: string;
    readonly description: string;
    repair: number;
    readonly ship: Ship;
    constructor({ id, displayName, description, repair }: BaseItemData, ship: Ship);
    use(): void;
}
//# sourceMappingURL=Item.d.ts.map