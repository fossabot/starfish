import type { Game } from '../Game';
import type { Planet } from './Planet';
import type { Ship } from './Ship/Ship';
export declare class Faction {
    readonly name: string;
    readonly color: string;
    readonly homeworld: Planet | null;
    readonly ai: boolean;
    readonly game: Game;
    constructor({ name, color, homeworld, ai }: BaseFactionData, game: Game);
    get members(): Ship[];
}
//# sourceMappingURL=Faction.d.ts.map