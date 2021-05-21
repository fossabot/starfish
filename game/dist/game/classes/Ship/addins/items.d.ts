import { Ship } from '../Ship';
import { Item } from '../../Item/Item';
export declare function addWeapon(this: Ship, id: WeaponType, props?: Partial<BaseWeaponData>): boolean;
export declare function addEngine(this: Ship, id: EngineType, props?: Partial<BaseEngineData>): boolean;
export declare function removeItem(this: Ship, item: Item): boolean;
export declare function equipLoadout(this: Ship, name: string): boolean;
//# sourceMappingURL=items.d.ts.map