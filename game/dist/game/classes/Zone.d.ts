import type { Game } from '../Game';
import type { CombatShip } from './Ship/CombatShip';
import { Stubbable } from './Stubbable';
export declare class Zone extends Stubbable {
    readonly id: string;
    readonly name: string;
    readonly location: CoordinatePair;
    readonly radius: number;
    readonly game: Game;
    readonly effects: ZoneEffect[];
    readonly color: string;
    constructor({ location, radius, id, color, name, effects, }: BaseZoneData, game: Game);
    affectShip(ship: CombatShip): void;
}
//# sourceMappingURL=Zone.d.ts.map