import type { CrewMember } from '../CrewMember';
export declare class CrewActive {
    readonly crewMember: CrewMember;
    readonly type: string;
    readonly baseCooldown: number;
    cooldownRemaining: number;
    ready: Boolean;
    constructor({ type }: BaseCrewActiveData, crewMember: CrewMember);
    tick(): void;
}
//# sourceMappingURL=CrewActive.d.ts.map