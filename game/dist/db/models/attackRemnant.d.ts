import type { AttackRemnant } from '../../game/classes/AttackRemnant';
export declare function addOrUpdateInDb(data: AttackRemnant): Promise<BaseAttackRemnantData>;
export declare function wipe(): Promise<void>;
export declare function removeFromDb(id: string): Promise<void>;
export declare function getAllConstructible(): Promise<BaseAttackRemnantData[]>;
//# sourceMappingURL=attackRemnant.d.ts.map