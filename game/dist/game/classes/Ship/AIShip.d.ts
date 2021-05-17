import { Game } from '../../Game';
import { Faction } from '../Faction';
import { CombatShip } from './CombatShip';
export declare class AIShip extends CombatShip {
    readonly human: boolean;
    readonly id: string;
    readonly faction: Faction | false;
    level: number;
    obeysGravity: boolean;
    constructor(data: BaseShipData, game: Game);
    tick(): void;
    cumulativeSkillIn(l: CrewLocation, s: SkillName): number;
}
//# sourceMappingURL=AIShip.d.ts.map