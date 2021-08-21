import type { Game } from '../Game';
import type { Faction } from './Faction';
import type { Ship } from './Ship/Ship';
export declare class Species {
    readonly type = "species";
    readonly id: SpeciesKey;
    readonly icon: string;
    readonly singular: string;
    readonly game: Game;
    readonly passives: ShipPassiveEffect[];
    readonly description: string;
    faction: Faction;
    constructor({ id, factionId, icon, singular, description, passives, }: BaseSpeciesData, game: Game);
    get members(): Ship[];
}
//# sourceMappingURL=Species.d.ts.map