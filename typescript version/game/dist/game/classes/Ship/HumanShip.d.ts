import { Game } from '../../Game';
import { CrewMember } from '../CrewMember/CrewMember';
import { CombatShip } from './CombatShip';
export declare class HumanShip extends CombatShip {
    readonly human: boolean;
    readonly id: string;
    crewMembers: CrewMember[];
    constructor(data: BaseHumanShipData, game: Game);
    tick(): void;
    addCrewMember(data: BaseCrewMemberData): void;
    removeCrewMember(id: string): void;
}
//# sourceMappingURL=HumanShip.d.ts.map