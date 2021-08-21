import type { Game } from '../Game';
import type { Planet } from './Planet';
import type { Ship } from './Ship/Ship';
import { Stubbable } from './Stubbable';
export declare class Faction extends Stubbable {
    readonly type = "faction";
    readonly name: string;
    readonly id: FactionKey;
    readonly color: string;
    homeworld: Planet | null;
    readonly ai: boolean;
    readonly game: Game;
    constructor({ name, id, ai, color }: BaseFactionData, game: Game);
    get members(): Ship[];
}
//# sourceMappingURL=Faction.d.ts.map