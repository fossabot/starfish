import { membersIn, cumulativeSkillIn } from './addins/crew';
import { CombatShip } from './CombatShip';
import type { Game } from '../../Game';
import { CrewMember } from '../CrewMember/CrewMember';
import type { AttackRemnant } from '../AttackRemnant';
import type { Planet } from '../Planet';
import type { Cache } from '../Cache';
import type { Ship } from './Ship';
import type { Item } from '../Item/Item';
export declare class HumanShip extends CombatShip {
    static maxLogLength: number;
    readonly id: string;
    readonly log: LogEntry[];
    logAlertLevel: LogAlertLevel;
    readonly crewMembers: CrewMember[];
    captain: string | null;
    rooms: {
        [key in CrewLocation]?: BaseRoomData;
    };
    maxScanProperties: ShipScanDataShape | null;
    visible: {
        ships: Partial<ShipStub>[];
        planets: Planet[];
        caches: Cache[];
        attackRemnants: AttackRemnant[];
    };
    commonCredits: number;
    mainTactic: Tactic | undefined;
    itemTarget: ItemType | undefined;
    constructor(data: BaseHumanShipData, game: Game);
    tick(): void;
    logEntry(text: string, level?: LogLevel): void;
    move(toLocation?: CoordinatePair): void;
    updateVisible(): void;
    updatePlanet(silent?: boolean): void;
    updateBroadcastRadius(): void;
    updateThingsThatCouldChangeOnItemChange(): void;
    addCommonCredits(amount: number, member: CrewMember): void;
    broadcast(message: string, crewMember: CrewMember): number;
    addRoom(room: CrewLocation): void;
    removeRoom(room: CrewLocation): void;
    addItem(itemData: Partial<BaseItemData>): boolean;
    removeItem(item: Item): boolean;
    addCrewMember(data: BaseCrewMemberData): CrewMember;
    removeCrewMember(id: string): void;
    membersIn: typeof membersIn;
    cumulativeSkillIn: typeof cumulativeSkillIn;
    distributeCargoAmongCrew(cargo: CacheContents[]): void;
    updateMaxScanProperties(): void;
    shipToValidScanResult(ship: Ship): Partial<ShipStub>;
    respawn(): void;
    autoAttack(): void;
    die(): void;
}
//# sourceMappingURL=HumanShip.d.ts.map