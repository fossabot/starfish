import { Game } from '../../Game';
import { CrewMember } from '../CrewMember/CrewMember';
import { CombatShip } from './CombatShip';
import { membersIn } from './addins/crew';
export declare class HumanShip extends CombatShip {
    readonly human: boolean;
    readonly id: string;
    crewMembers: CrewMember[];
    captain: string | null;
    constructor(data: BaseHumanShipData, game: Game);
    tick(): void;
    addCrewMember(data: BaseCrewMemberData): CrewMember;
    removeCrewMember(id: string): void;
    membersIn: typeof membersIn;
}
//# sourceMappingURL=HumanShip.d.ts.map