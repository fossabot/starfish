import type { CrewMember } from '../CrewMember';
export declare class CrewPassive {
    readonly displayName: string;
    readonly crewMember: CrewMember;
    readonly id: CrewPassiveId;
    level: number;
    readonly factor: number;
    constructor({ displayName, id, level, factor }: BaseCrewPassiveData, crewMember: CrewMember);
    get changeAmount(): number;
}
//# sourceMappingURL=CrewPassive.d.ts.map