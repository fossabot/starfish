import type { Game } from '../../Game';
import { Stubbable } from '../Stubbable';
import type { Faction } from '../Faction';
export declare class Planet extends Stubbable {
    static readonly massAdjuster = 1;
    readonly type = "planet";
    readonly pacifist: boolean;
    readonly rooms: CrewLocation[];
    readonly planetType: PlanetType;
    readonly name: string;
    readonly color: string;
    readonly mass: number;
    readonly location: CoordinatePair;
    readonly game: Game;
    readonly creatures?: string[];
    readonly radius: number;
    landingRadiusMultiplier: number;
    passives: ShipPassiveEffect[];
    xp: number;
    level: number;
    toUpdate: {
        allegiances?: PlanetAllegianceData[];
        priceFluctuator?: number;
        repairFactor?: number;
        landingRadiusMultiplier?: number;
    };
    constructor({ planetType, name, color, location, mass, landingRadiusMultiplier, passives, pacifist, creatures, radius, xp, level, baseLevel, }: BasePlanetData, game: Game);
    get shipsAt(): import("../Ship/HumanShip").HumanShip[];
    addXp(amount: number, straightUp?: boolean): Promise<void>;
    levelUp(): Promise<void>;
    updateFrontendForShipsAt(): void;
    getVisibleStub(): PlanetStub;
    toLogStub(): PlanetStub;
    addPassive(passive: ShipPassiveEffect): void;
    incrementAllegiance(faction: Faction | FactionStub, amount?: number): void;
}
//# sourceMappingURL=Planet.d.ts.map