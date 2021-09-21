import { Ship } from './classes/Ship/Ship';
import { Planet } from './classes/Planet/Planet';
import { Cache } from './classes/Cache';
import { Faction } from './classes/Faction';
import { Species } from './classes/Species';
import { AttackRemnant } from './classes/AttackRemnant';
import { Zone } from './classes/Zone';
import { HumanShip } from './classes/Ship/HumanShip';
import { AIShip } from './classes/Ship/AIShip';
import { BasicPlanet } from './classes/Planet/BasicPlanet';
import { MiningPlanet } from './classes/Planet/MiningPlanet';
export declare class Game {
    static saveTimeInterval: number;
    readonly startTime: number;
    readonly ships: Ship[];
    readonly planets: Planet[];
    readonly caches: Cache[];
    readonly zones: Zone[];
    readonly factions: Faction[];
    readonly species: Species[];
    readonly attackRemnants: AttackRemnant[];
    factionRankings: FactionRanking[];
    paused: boolean;
    constructor();
    startGame(): void;
    save(): Promise<void>;
    daily(): Promise<void>;
    private tickCount;
    private lastTickTime;
    private lastTickExpectedTime;
    private averageTickLag;
    private averageWorstShipTickLag;
    private averageTickTime;
    tick(): any;
    scanCircle(center: CoordinatePair, radius: number, ignoreSelf: string | null, types?: (`ship` | `planet` | `cache` | `attackRemnant` | `trail` | `zone`)[], includeTrails?: boolean, tutorial?: boolean): {
        ships: Ship[];
        trails: CoordinatePair[][];
        planets: Planet[];
        caches: Cache[];
        attackRemnants: AttackRemnant[];
        zones: Zone[];
    };
    get gameSoftRadius(): number;
    get gameSoftArea(): number;
    expireOldAttackRemnantsAndCaches(): void;
    spawnNewPlanets(): Promise<void>;
    spawnNewZones(): void;
    spawnNewCaches(): void;
    spawnNewAIs(): void;
    addHumanShip(data: BaseHumanShipData, save?: boolean): Promise<HumanShip>;
    addAIShip(data: BaseAIShipData, save?: boolean): Promise<AIShip>;
    removeShip(ship: Ship): Promise<void>;
    addBasicPlanet(data: BaseBasicPlanetData, save?: boolean): Promise<Planet>;
    addMiningPlanet(data: BaseMiningPlanetData, save?: boolean): Promise<Planet>;
    addFaction(data: BaseFactionData): Faction;
    addSpecies(data: BaseSpeciesData): Species;
    addCache(data: BaseCacheData, save?: boolean): Cache;
    removeCache(cache: Cache): void;
    addZone(data: BaseZoneData, save?: boolean): Zone;
    removeZone(zone: Zone): void;
    addAttackRemnant(data: BaseAttackRemnantData, save?: boolean): AttackRemnant;
    removeAttackRemnant(ar: AttackRemnant): void;
    get humanShips(): HumanShip[];
    get aiShips(): AIShip[];
    get basicPlanets(): BasicPlanet[];
    get miningPlanets(): MiningPlanet[];
    recalculateFactionRankings(): void;
}
//# sourceMappingURL=Game.d.ts.map