import type { Ship } from '../Ship/Ship';
import { Item } from './Item';
export declare class Scanner extends Item {
    readonly id: ScannerId;
    readonly sightRange: number;
    readonly shipScanRange: number;
    constructor(data: BaseScannerData, ship: Ship, props?: Partial<BaseScannerData>);
    use(): number;
}
//# sourceMappingURL=Scanner.d.ts.map