import { Game } from '../Game';
export declare class Cache {
    readonly ownerId: string;
    readonly contents: CacheContents[];
    readonly location: CoordinatePair;
    readonly message: string;
    readonly game: Game;
    constructor({ contents, location, ownerId, message }: BaseCacheData, game: Game);
}
//# sourceMappingURL=Cache.d.ts.map