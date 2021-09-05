import type { Planet } from '../../game/classes/Planet/Planet';
export declare function addOrUpdateInDb(data: Planet): Promise<BasePlanetData>;
export declare function removeFromDb(name: string): Promise<void>;
export declare function wipe(): Promise<void>;
export declare function getAllConstructible(): Promise<BasePlanetData[]>;
//# sourceMappingURL=planet.d.ts.map