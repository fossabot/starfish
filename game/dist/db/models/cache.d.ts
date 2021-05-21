import type { Cache } from '../../game/classes/Cache';
export declare function addOrUpdateInDb(data: Cache): Promise<BaseCacheData>;
export declare function wipe(): Promise<void>;
export declare function removeFromDb(id: string): Promise<void>;
export declare function getAllConstructible(): Promise<BaseCacheData[]>;
//# sourceMappingURL=cache.d.ts.map