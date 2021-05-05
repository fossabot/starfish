import { Game } from '../Game';
export declare class Planet {
    readonly name: string;
    readonly color: string;
    readonly location: CoordinatePair;
    readonly game: Game;
    constructor({ name, color, location }: BasePlanetData, game: Game);
    identify(): void;
}
//# sourceMappingURL=Planet.d.ts.map