import type { Ship } from '../Ship/Ship';
import { Item } from './Item';
export declare class Communicator extends Item {
    readonly id: CommunicatorId;
    readonly range: number;
    readonly antiGarble: number;
    lastUse: number;
    constructor(data: BaseCommunicatorData, ship: Ship, props?: Partial<BaseCommunicatorData>);
    use(): number;
}
//# sourceMappingURL=Communicator.d.ts.map