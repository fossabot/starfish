import * as roomActions from './addins/rooms';
import type { HumanShip } from '../Ship/HumanShip';
import { CrewActive } from './addins/CrewActive';
import { CrewPassive } from './addins/CrewPassive';
import type { CombatShip } from '../Ship/CombatShip';
import { Stubbable } from '../Stubbable';
export declare class CrewMember extends Stubbable {
    static readonly levelXPNumbers: number[];
    static readonly basemaxCargoSpace = 10;
    readonly id: string;
    readonly ship: HumanShip;
    name: string;
    location: CrewLocation;
    skills: XPData[];
    stamina: number;
    maxStamina: number;
    lastActive: number;
    targetLocation: CoordinatePair | null;
    tactic: Tactic;
    attackFactions: FactionKey[];
    attackTarget: CombatShip | null;
    itemTarget: ItemType | null;
    cockpitCharge: number;
    repairPriority: RepairPriority;
    inventory: Cargo[];
    credits: number;
    actives: CrewActive[];
    passives: CrewPassive[];
    upgrades: PassiveCrewUpgrade[];
    stats: CrewStatEntry[];
    maxCargoSpace: number;
    toUpdate: {
        [key in keyof CrewMember]?: any;
    };
    constructor(data: BaseCrewMemberData, ship: HumanShip);
    rename(newName: string): void;
    goTo(location: CrewLocation): boolean;
    cockpitAction: typeof roomActions.cockpit;
    repairAction: typeof roomActions.repair;
    weaponsAction: typeof roomActions.weapons;
    bunkAction: typeof roomActions.bunk;
    tick(): void;
    active(): void;
    addXp(skill: SkillType, xp?: number): void;
    addCargo(type: CargoType, amount: number): number;
    removeCargo(type: CargoType, amount: number): void;
    get heldWeight(): number;
    recalculateMaxCargoSpace(): void;
    addPassive(data: Partial<BaseCrewPassiveData>): void;
    recalculateAll(): void;
    addStat(statname: CrewStatKey, amount: number): void;
    get tired(): boolean;
    get piloting(): XPData | undefined;
    get linguistics(): XPData | undefined;
    get munitions(): XPData | undefined;
    get mechanics(): XPData | undefined;
}
//# sourceMappingURL=CrewMember.d.ts.map