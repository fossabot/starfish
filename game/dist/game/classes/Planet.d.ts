import type { Game } from '../Game';
import type { Faction } from './Faction';
import { Stubbable } from './Stubbable';
export declare class Planet extends Stubbable {
    static readonly fluctuatorIntensity = 0.8;
    readonly name: string;
    readonly color: string;
    readonly location: CoordinatePair;
    readonly game: Game;
    readonly vendor: Vendor;
    readonly faction?: Faction;
    readonly creatures: string[];
    readonly repairCostMultiplier: number;
    readonly radius: number;
    readonly homeworld?: Faction;
    mass: number;
    priceFluctuator: number;
    constructor({ name, color, location, vendor, factionId, homeworld, creatures, repairCostMultiplier, radius, }: BasePlanetData, game: Game);
    identify(): void;
    shipsAt(): import("./Ship/HumanShip").HumanShip[];
    updateFluctuator(): void;
}
//# sourceMappingURL=Planet.d.ts.map