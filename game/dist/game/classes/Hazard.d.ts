import type { Game } from '../Game';
import type { HumanShip } from './Ship/HumanShip';
import { Stubbable } from './Stubbable';
export declare class Cache extends Stubbable {
    static readonly rePickUpTime: number;
    readonly id: string;
    readonly contents: CacheContents[];
    readonly location: CoordinatePair;
    readonly message: string;
    readonly time: number;
    readonly game: Game;
    readonly droppedBy: string | undefined;
    readonly onlyVisibleToShipId?: string;
    constructor({ contents, location, message, time, id, droppedBy, onlyVisibleToShipId, }: BaseCacheData, game: Game);
    canBePickedUpBy(ship: HumanShip): boolean;
}
//# sourceMappingURL=Hazard.d.ts.map