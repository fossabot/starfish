import { Ship } from './classes/Ship/Ship';
import { Planet } from './classes/Planet';
import { Cache } from './classes/Cache';
import { Faction } from './classes/Faction';
import { AttackRemnant } from './classes/AttackRemnant';
import { HumanShip } from './classes/Ship/HumanShip';
import { AIShip } from './classes/Ship/AIShip';
export declare class Game {
    static saveTimeInterval: number;
    readonly startTime: Date;
    readonly ships: Ship[];
    readonly planets: Planet[];
    readonly caches: Cache[];
    readonly factions: Faction[];
    readonly attackRemnants: AttackRemnant[];
    constructor();
    startGame(): void;
    save(): Promise<void>;
    identify(): void;
    private tickCount;
    private lastTickTime;
    private lastTickExpectedTime;
    private averageTickLag;
    tick(): void;
    scanCircle(center: CoordinatePair, radius: number, ignoreSelf: string | null, type?: `ship` | `planet` | `cache` | `attackRemnant`): {
        ships: Ship[];
        planets: Planet[];
        caches: Cache[];
        attackRemnants: AttackRemnant[];
    };
    get gameSoftRadius(): number;
    get gameSoftArea(): number;
    expireOldAttackRemnantsAndCaches(): void;
    spawnNewCaches(): void;
    addHumanShip(data: BaseHumanShipData, save?: boolean): HumanShip;
    addAIShip(data: BaseShipData, save?: boolean): AIShip;
    addPlanet(data: BasePlanetData): Planet;
    addFaction(data: BaseFactionData): Faction;
    addCache(data: BaseCacheData, save?: boolean): Cache;
    removeCache(cache: Cache): void;
    addAttackRemnant(data: BaseAttackRemnantData, save?: boolean): AttackRemnant;
    removeAttackRemnant(ar: AttackRemnant): void;
    get humanShips(): Ship[];
    get aiShips(): Ship[];
}
//# sourceMappingURL=Game.d.ts.map