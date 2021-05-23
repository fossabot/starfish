import { Game } from '../../Game';
import { Faction } from '../Faction';
import { CombatShip } from './CombatShip';
export declare class AIShip extends CombatShip {
    readonly human: boolean;
    readonly id: string;
    readonly faction: Faction | false;
    readonly spawnPoint: CoordinatePair;
    level: number;
    keyAngle: number;
    targetLocation: CoordinatePair;
    obeysGravity: boolean;
    constructor(data: BaseShipData, game: Game);
    tick(): void;
    cumulativeSkillIn(l: CrewLocation, s: SkillName): number;
    move(toLocation?: CoordinatePair): void;
    die(): void;
}
//# sourceMappingURL=AIShip.d.ts.map