import type { Game } from '../Game';
import type { Faction } from './Faction';
import { Stubbable } from './Stubbable';
export declare class Planet extends Stubbable {
    static readonly fluctuatorIntensity = 0.8;
    readonly type = "planet";
    readonly name: string;
    readonly color: string;
    readonly location: CoordinatePair;
    readonly game: Game;
    readonly vendor?: Vendor;
    readonly faction?: Faction;
    readonly creatures: string[];
    readonly repairCostMultiplier?: number;
    readonly radius: number;
    readonly allegiances: AllegianceData[];
    readonly homeworld?: Faction;
    mass: number;
    priceFluctuator: number;
    toUpdate: {
        allegiances?: AllegianceData[];
        priceFluctuator?: number;
    };
    constructor({ name, color, location, vendor, homeworld, creatures, repairCostMultiplier, radius, allegiances, }: BasePlanetData, game: Game);
    identify(): void;
    get shipsAt(): import("./Ship/HumanShip").HumanShip[];
    updateFrontendForShipsAt(): void;
    getVisibleStub(): PlanetStub;
    incrementAllegiance(faction: Faction | FactionStub, amount?: number): void;
    decrementAllegiances(): void;
    updateFluctuator(): void;
}
//# sourceMappingURL=Planet.d.ts.map