import * as roomActions from './addins/rooms';
import { HumanShip } from '../Ship/HumanShip';
export declare class CrewMember {
    static readonly passiveStaminaLossPerSecond = 0.0001;
    static readonly levelXPNumbers: number[];
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
    cockpitAction: typeof roomActions.cockpit;
    repairAction: typeof roomActions.repair;
    weaponsAction: typeof roomActions.weapons;
    bunkAction: typeof roomActions.bunk;
    tick(): void;
    addXp(skill: SkillName, xp?: number): void;
    get tired(): boolean;
    get maxStamina(): number;
    get staminaRefillPerHour(): number;
    get piloting(): XPData | undefined;
    get linguistics(): XPData | undefined;
    get munitions(): XPData | undefined;
    get mechanics(): XPData | undefined;
}
//# sourceMappingURL=CrewMember.d.ts.map