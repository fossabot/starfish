import type { Zone } from '../../game/classes/Zone';
export declare function addOrUpdateInDb(data: Zone): Promise<BaseZoneData>;
export declare function wipe(): Promise<void>;
export declare function removeFromDb(id: string): Promise<void>;
export declare function getAllConstructible(): Promise<BaseZoneData[]>;
//# sourceMappingURL=zone.d.ts.map