import { Game } from '../../Game';
import { Faction } from '../Faction';
import { CombatShip } from './CombatShip';
export declare class AIShip extends CombatShip {
    readonly human: boolean;
    readonly id: string;
    readonly faction: Faction | false;
    readonly ai: Boolean;
    level: number;
    obeysGravity: boolean;
    constructor(data: BaseShipData, game: Game);
    tick(): void;
    cumulativeSkillIn(l: CrewLocation, s: SkillName): number;
}
//# sourceMappingURL=Log.d.ts.map