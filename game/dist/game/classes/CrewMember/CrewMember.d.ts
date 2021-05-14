import { HumanShip } from '../Ship/HumanShip';
export declare class CrewMember {
    static readonly passiveStaminaLossPerSecond = 0.0001;
    readonly id: string;
    readonly ship: HumanShip;
    name: string;
    location: CrewLocation;
    skills: XPData[];
    stamina: number;
    lastActive: number;
    targetLocation: CoordinatePair | null;
    inventory: Cargo[];
    credits: number;
    constructor(data: BaseCrewMemberData, ship: HumanShip);
    rename(newName: string): void;
    goTo(location: CrewLocation): void;
    tick(): void;
    addXp(skill: SkillName, xp?: number): void;
    get tired(): boolean;
    get maxStamina(): number;
    get staminaRefillPerHour(): number;
}
//# sourceMappingURL=CrewMember.d.ts.map