import type { Game } from '../Game';
import type { Faction } from './Faction';
import type { Ship } from './Ship/Ship';
import { Stubbable } from './Stubbable';
export declare class Species extends Stubbable {
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