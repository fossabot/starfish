import type { Ship } from '../Ship/Ship';
import { Item } from './Item';
export declare class Engine extends Item {
    readonly id: EngineId;
    readonly thrustAmplification: number;
    lastUse: number;
    constructor(data: BaseEngineData, ship: Ship, props?: Partial<BaseEngineData>);
    use(usePercent?: number): number;
}
//# sourceMappingURL=Engine.d.ts.map