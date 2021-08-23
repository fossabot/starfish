import type { CrewMember } from '../CrewMember';
export declare class CrewActive {
    readonly crewMember: CrewMember;
    readonly id: string;
    readonly baseCooldown: number;
    cooldownRemaining: number;
    ready: Boolean;
    constructor({ id }: BaseCrewActiveData, crewMember: CrewMember);
    tick(): void;
}
//# sourceMappingURL=CrewActive.d.ts.map