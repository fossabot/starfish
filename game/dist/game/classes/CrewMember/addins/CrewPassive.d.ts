import type { CrewMember } from '../CrewMember';
export declare class CrewPassive {
    readonly displayName: string;
    readonly crewMember: CrewMember;
    readonly type: "cargoSpace";
    level: number;
    readonly factor: number;
    constructor({ displayName, type, level, factor, }: BaseCrewPassiveData, crewMember: CrewMember);
    get changeAmount(): number;
}
//# sourceMappingURL=CrewPassive.d.ts.map