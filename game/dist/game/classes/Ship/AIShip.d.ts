import { Game } from '../../Game';
import { Faction } from '../Faction';
import { CombatShip } from './CombatShip';
export declare class AIShip extends CombatShip {
    readonly human: boolean;
    readonly id: string;
    readonly faction: Faction | null;
    obeysGravity: boolean;
    constructor(data: BaseShipData, game: Game);
    tick(): void;
}
//# sourceMappingURL=AIShip.d.ts.map