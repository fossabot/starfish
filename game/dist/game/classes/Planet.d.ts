import type { Game } from '../Game';
import type { Faction } from './Faction';
export declare class Planet {
    readonly name: string;
    readonly color: string;
    readonly location: CoordinatePair;
    readonly game: Game;
    readonly vendor: Vendor | null;
    readonly faction: Faction | null;
    readonly races: string[];
    readonly repairCostMultiplier: number;
    readonly radius: number;
    mass: number;
    constructor({ name, color, location, vendor, faction, races, repairCostMultiplier, radius, }: BasePlanetData, game: Game);
    identify(): void;
    shipsAt(): import("./Ship/HumanShip").HumanShip[];
}
//# sourceMappingURL=Planet.d.ts.map