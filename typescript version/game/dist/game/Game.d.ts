/// <reference types="node" />
import EventEmitter from 'events';
import { Ship } from './classes/Ship/Ship';
import { Planet } from './classes/Planet';
import { Cache } from './classes/Cache';
import { Faction } from './classes/Faction';
import { AttackRemnant } from './classes/AttackRemnant';
import { HumanShip } from './classes/Ship/HumanShip';
import { AIShip } from './classes/Ship/AIShip';
export declare class Game extends EventEmitter {
    readonly startTime: Date;
    readonly ships: Ship[];
    readonly planets: Planet[];
    readonly caches: Cache[];
    readonly factions: Faction[];
    readonly attackRemnants: AttackRemnant[];
    lastTickTime: number;
    constructor();
    startGame(): void;
    identify(): void;
    tickCount: number;
    tick(): void;
    scanCircle(center: CoordinatePair, radius: number, type?: `ship` | `planet` | `cache`): {
        ships: Ship[];
        planets: Planet[];
        caches: Cache[];
    };
    addHumanShip(data: BaseHumanShipData): HumanShip;
    addAIShip(data: BaseShipData): AIShip;
    addPlanet(data: BasePlanetData): Planet;
    addFaction(data: BaseFactionData): Faction;
    addCache(data: BaseCacheData): Cache;
    addAttackRemnant(data: BaseAttackRemnantData): AttackRemnant;
}
//# sourceMappingURL=Game.d.ts.map