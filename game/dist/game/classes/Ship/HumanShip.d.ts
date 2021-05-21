import { membersIn, cumulativeSkillIn } from './addins/crew';
import { CombatShip } from './CombatShip';
import type { Game } from '../../Game';
import { CrewMember } from '../CrewMember/CrewMember';
export declare class HumanShip extends CombatShip {
    static maxLogLength: number;
    readonly id: string;
    readonly log: LogEntry[];
    readonly crewMembers: CrewMember[];
    captain: string | null;
    availableRooms: CrewLocation[];
    mainTactic: Tactic | undefined;
    constructor(data: BaseHumanShipData, game: Game);
    tick(): void;
    logEntry(text: string, level?: LogLevel): void;
    move(toLocation?: CoordinatePair): void;
    addRoom(room: CrewLocation): void;
    removeRoom(room: CrewLocation): void;
    addCrewMember(data: BaseCrewMemberData): CrewMember;
    removeCrewMember(id: string): void;
    membersIn: typeof membersIn;
    cumulativeSkillIn: typeof cumulativeSkillIn;
    distributeCargoAmongCrew(cargo: CacheContents[]): void;
    respawn(): void;
}
//# sourceMappingURL=HumanShip.d.ts.map