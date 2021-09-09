import type { Game } from '../../Game';
import type { Faction } from '../Faction';
import { Planet } from './Planet';
declare type AddableElement = {
    class: `cargo`;
    id: CargoId;
    propensity: number;
} | {
    class: `items`;
    type: ItemType;
    id: ItemId;
    propensity: number;
} | {
    class: `crewPassives`;
    id: CrewPassiveId;
    propensity: number;
} | {
    class: `chassis`;
    id: ChassisId;
    propensity: number;
} | {
    class: `repair`;
    propensity: number;
};
export declare class BasicPlanet extends Planet {
    static readonly priceFluctuatorIntensity = 0.8;
    readonly planetType: PlanetType;
    readonly vendor: PlanetVendor;
    readonly faction?: Faction;
    readonly homeworld?: Faction;
    readonly allegiances: PlanetAllegianceData[];
    readonly leanings: PlanetLeaning[];
    repairFactor: number;
    priceFluctuator: number;
    toUpdate: {
        allegiances?: PlanetAllegianceData[];
        priceFluctuator?: number;
        repairFactor?: number;
        landingRadiusMultiplier?: number;
    };
    constructor(data: BaseBasicPlanetData, game: Game);
    levelUp(): Promise<void>;
    getAddableToVendor(): AddableElement[];
    incrementAllegiance(faction: Faction | FactionStub, amount?: number): void;
    decrementAllegiances(): void;
    updateFluctuator(): void;
    toLogStub(): PlanetStub;
}
export {};
//# sourceMappingURL=BasicPlanet.d.ts.map