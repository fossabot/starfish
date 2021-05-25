import type { Game } from '../Game';
import type { HumanShip } from './Ship/HumanShip';
export declare class Cache {
    static readonly rePickUpTime: number;
    static readonly expireTime: number;
    readonly id: string;
    readonly contents: CacheContents[];
    readonly location: CoordinatePair;
    readonly message: string;
    readonly time: number;
    readonly game: Game;
    readonly droppedBy: string | undefined;
    constructor({ contents, location, message, time, id, droppedBy, }: BaseCacheData, game: Game);
    canBePickedUpBy(ship: HumanShip): boolean;
}
//# sourceMappingURL=Cache.d.ts.map