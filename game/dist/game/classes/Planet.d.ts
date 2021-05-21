import type { Game } from '../Game';
export declare class Planet {
    readonly name: string;
    readonly color: string;
    readonly location: CoordinatePair;
    readonly game: Game;
    readonly vendor: Vendor | null;
    constructor({ name, color, location, vendor }: BasePlanetData, game: Game);
    identify(): void;
}
//# sourceMappingURL=Planet.d.ts.map