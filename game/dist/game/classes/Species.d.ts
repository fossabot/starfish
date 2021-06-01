import type { Game } from '../Game';
import type { Faction } from './Faction';
import type { Ship } from './Ship/Ship';
export declare class Species {
    readonly id: SpeciesKey;
    readonly icon: string;
    readonly singular: string;
    readonly game: Game;
    faction: Faction;
    constructor({ id, factionId, icon, singular }: BaseSpeciesData, game: Game);
    get members(): Ship[];
}
//# sourceMappingURL=Species.d.ts.map