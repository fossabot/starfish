import type { Ship } from '../Ship/Ship';
import { Item } from './Item';
export declare class Engine extends Item {
    readonly id: EngineId;
    readonly thrustAmplification: number;
    constructor(data: BaseEngineData, ship: Ship, props?: Partial<BaseEngineData>);
}
//# sourceMappingURL=Engine.d.ts.map