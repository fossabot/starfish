import type { Ship } from '../../game/classes/Ship/Ship';
export declare function addOrUpdateInDb(data: Ship): Promise<BaseShipData>;
export declare function removeFromDb(id: string): Promise<void>;
export declare function wipe(): Promise<void>;
export declare function wipeAI(): Promise<void>;
export declare function getAllConstructible(): Promise<BaseShipData[]>;
//# sourceMappingURL=ship.d.ts.map