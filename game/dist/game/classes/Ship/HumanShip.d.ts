import { membersIn, cumulativeSkillIn } from './addins/crew';
import { CombatShip } from './CombatShip';
import type { Game } from '../../Game';
import { CrewMember } from '../CrewMember/CrewMember';
import type { AttackRemnant } from '../AttackRemnant';
import type { Planet } from '../Planet';
import type { Cache } from '../Cache';
import type { Ship } from './Ship';
import type { Item } from '../Item/Item';
import { Tutorial } from './addins/Tutorial';
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
        ships: ShipStub[];
        planets: Planet[];
        caches: Cache[];
        attackRemnants: AttackRemnant[];
        trails?: CoordinatePair[][];
    };
    shownPanels?: any[];
    commonCredits: number;
    mainTactic: Tactic | undefined;
    itemTarget: ItemType | undefined;
    tutorial: Tutorial | undefined;
    constructor(data: BaseHumanShipData, game: Game);
    tick(): void;
    logEntry(text: string, level?: LogLevel): void;
    discoverPlanet(p: Planet): void;
    applyThrust(targetLocation: CoordinatePair, charge: number, // 0 to 1 % of AVAILABLE charge to use
    thruster: CrewMember): void;
    brake(charge: number, thruster: CrewMember): void;
    move(toLocation?: CoordinatePair): void;
    hardStop(): void;
    updateVisible(): void;
    generateVisiblePayload(previousVisible?: {
        ships: ShipStub[];
        planets: Planet[];
        caches: Cache[];
        attackRemnants: AttackRemnant[];
        trails?: CoordinatePair[][];
    }): void;
    updatePlanet(silent?: boolean): Promise<void>;
    updateBroadcastRadius(): void;
    updateThingsThatCouldChangeOnItemChange(): void;
    recalculateShownPanels(): void;
    equipLoadout(l: LoadoutName, removeExisting?: boolean): boolean;
    addCommonCredits(amount: number, member: CrewMember): void;
    broadcast(message: string, crewMember: CrewMember): number;
    receiveBroadcast(message: string): void;
    resolveRooms(): void;
    addRoom(room: CrewLocation): void;
    removeRoom(room: CrewLocation): void;
    addItem(itemData: Partial<BaseItemData>): boolean;
    removeItem(item: Item): boolean;
    addCrewMember(data: BaseCrewMemberData, silent?: boolean): CrewMember;
    removeCrewMember(id: string): void;
    membersIn: typeof membersIn;
    cumulativeSkillIn: typeof cumulativeSkillIn;
    distributeCargoAmongCrew(cargo: CacheContents[]): void;
    updateMaxScanProperties(): void;
    shipToValidScanResult(ship: Ship): ShipStub;
    respawn(silent?: boolean): void;
    autoAttack(): void;
    die(): void;
    get factionRankings(): FactionRanking[];
}
//# sourceMappingURL=HumanShip.d.ts.map