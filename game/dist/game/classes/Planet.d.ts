import type { Game } from '../Game';
import type { Faction } from './Faction';
import { Stubbable } from './Stubbable';
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
    class: `passives`;
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
export declare class Planet extends Stubbable {
    static readonly fluctuatorIntensity = 0.8;
    static readonly massAdjuster = 1;
    readonly type = "planet";
    readonly name: string;
    readonly color: string;
    readonly mass: number;
    readonly location: CoordinatePair;
    readonly game: Game;
    readonly vendor?: PlanetVendor;
    readonly faction?: Faction;
    readonly creatures: string[];
    readonly radius: number;
    readonly allegiances: PlanetAllegianceData[];
    readonly homeworld?: Faction;
    readonly leanings: PlanetLeaning[];
    landingRadiusMultiplier: number;
    repairFactor: number;
    xp: number;
    level: number;
    priceFluctuator: number;
    toUpdate: {
        allegiances?: PlanetAllegianceData[];
        priceFluctuator?: number;
        repairFactor?: number;
        landingRadiusMultiplier?: number;
    };
    constructor({ name, color, location, mass, landingRadiusMultiplier, repairFactor, vendor, homeworld, creatures, radius, allegiances, leanings, xp, level, baseLevel, }: BasePlanetData, game: Game);
    get shipsAt(): import("./Ship/HumanShip").HumanShip[];
    addXp(amount: number, straightUp?: boolean): Promise<void>;
    levelUp(): Promise<void>;
    getAddableToVendor(): AddableElement[];
    updateFrontendForShipsAt(): void;
    getVisibleStub(): PlanetStub;
    incrementAllegiance(faction: Faction | FactionStub, amount?: number): void;
    decrementAllegiances(): void;
    updateFluctuator(): void;
    toLogStub(): PlanetStub;
}
export {};
//# sourceMappingURL=Planet.d.ts.map