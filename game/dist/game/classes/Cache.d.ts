import type { Game } from '../Game';
export declare class Cache {
    static readonly expireTime: number;
    readonly id: string;
    readonly contents: CacheContents[];
    readonly location: CoordinatePair;
    readonly message: string;
    readonly time: number;
    readonly game: Game;
    constructor({ contents, location, message, time, id, }: BaseCacheData, game: Game);
}
//# sourceMappingURL=Cache.d.ts.map