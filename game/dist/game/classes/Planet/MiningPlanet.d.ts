import type { Game } from '../../Game';
import { Planet } from './Planet';
export declare class MiningPlanet extends Planet {
    readonly pacifist: boolean;
    readonly rooms: CrewLocation[];
    mine: PlanetMine;
    constructor(data: BaseMiningPlanetData, game: Game);
    getMineRequirement(cargoId: any): number;
    getPayoutAmount(cargoId: CargoId): number;
    mineResource(cargoId: MinePriorityType, amount: number): void;
    levelUp(): Promise<void>;
    addMineResource(toAdd: CargoId): void;
    toLogStub(): PlanetStub;
}
//# sourceMappingURL=MiningPlanet.d.ts.map