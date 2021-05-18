import { Game } from '../../Game';
import { CrewMember } from '../CrewMember/CrewMember';
import { CombatShip } from './CombatShip';
import { membersIn, cumulativeSkillIn } from './addins/crew';
export declare class HumanShip extends CombatShip {
    readonly human: boolean;
    readonly id: string;
    crewMembers: CrewMember[];
    captain: string | null;
    availableRooms: CrewLocation[];
    mainTactic: Tactic | undefined;
    constructor(data: BaseHumanShipData, game: Game);
    tick(): void;
    addRoom(room: CrewLocation): void;
    removeRoom(room: CrewLocation): void;
    addCrewMember(data: BaseCrewMemberData): CrewMember;
    removeCrewMember(id: string): void;
    membersIn: typeof membersIn;
    cumulativeSkillIn: typeof cumulativeSkillIn;
    respawn(): void;
}
//# sourceMappingURL=HumanShip.d.ts.map