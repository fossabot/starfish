import type { CrewMember } from './CrewMember';
export declare class Active {
    readonly crewMember: CrewMember;
    readonly id: string;
    readonly baseCooldown: number;
    cooldownRemaining: number;
    ready: Boolean;
    constructor({ id }: BaseActiveData, crewMember: CrewMember);
    tick(): void;
}
//# sourceMappingURL=Active.d.ts.map