import { Game } from '../../Game';
import { CombatShip } from './CombatShip';
export declare class AIShip extends CombatShip {
    readonly human: boolean;
    readonly id: string;
    readonly spawnPoint: CoordinatePair;
    level: number;
    keyAngle: number;
    targetLocation: CoordinatePair;
    obeysGravity: boolean;
    constructor(data: BaseShipData, game: Game);
    tick(): void;
    cumulativeSkillIn(l: CrewLocation, s: SkillType): number;
    move(toLocation?: CoordinatePair): void;
    die(): void;
}
//# sourceMappingURL=AIShip.d.ts.map