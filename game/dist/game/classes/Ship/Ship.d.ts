import type { Game } from '../../Game';
import type { Faction } from '../Faction';
import type { Planet } from '../Planet';
import type { Cache } from '../Cache';
import type { AttackRemnant } from '../AttackRemnant';
import type { CrewMember } from '../CrewMember/CrewMember';
import type { CombatShip } from './CombatShip';
import { Engine } from '../Item/Engine';
import type { Item } from '../Item/Item';
import { Weapon } from '../Item/Weapon';
import { Scanner } from '../Item/Scanner';
import { Communicator } from '../Item/Communicator';
import { Armor } from '../Item/Armor';
import type { Species } from '../Species';
import { Stubbable } from '../Stubbable';
import type { Tutorial } from './addins/Tutorial';
export declare class Ship extends Stubbable {
    static maxPreviousLocations: number;
    name: string;
    planet: Planet | false;
    readonly faction: Faction;
    readonly species: Species;
    readonly game: Game;
    readonly radii: {
        [key in RadiusType]: number;
    };
    onlyVisibleToShipId?: string;
    ai: boolean;
    human: boolean;
    readonly crewMembers: CrewMember[];
    tutorial: Tutorial | undefined;
    toUpdate: Partial<ShipStub>;
    visible: {
        ships: Ship[] | Partial<ShipStub>[];
        planets: Planet[];
        caches: Cache[];
        attackRemnants: AttackRemnant[];
        trails?: CoordinatePair[][];
    };
    readonly seenPlanets: Planet[];
    chassis: BaseChassisData;
    items: Item[];
    previousLocations: CoordinatePair[];
    id: string;
    location: CoordinatePair;
    velocity: CoordinatePair;
    speed: number;
    direction: number;
    tagline: string | null;
    attackable: boolean;
    _hp: number;
    _maxHp: number;
    dead: boolean;
    obeysGravity: boolean;
    mass: number;
    constructor({ name, species, chassis, items, loadout, seenPlanets, location, previousLocations, tagline, }: BaseShipData, game: Game);
    identify(): void;
    tick(): void;
    rename(newName: string): void;
    get engines(): Engine[];
    get weapons(): Weapon[];
    get scanners(): Scanner[];
    get communicators(): Communicator[];
    get armor(): Armor[];
    swapChassis(this: Ship, chassisData: Partial<BaseChassisData>): void;
    addItem(this: Ship, itemData: Partial<BaseItemData>): boolean;
    removeItem(this: Ship, item: Item): boolean;
    equipLoadout(this: Ship, name: LoadoutName): boolean;
    updateThingsThatCouldChangeOnItemChange(): void;
    updateSightAndScanRadius(): void;
    lastMoveAngle: number;
    get canMove(): boolean;
    move(toLocation?: CoordinatePair): void;
    addPreviousLocation(this: Ship, locationBeforeThisTick: CoordinatePair): void;
    isAt(this: Ship, coords: CoordinatePair): boolean;
    applyTickOfGravity(this: Ship): void;
    membersIn(l: CrewLocation): CrewMember[];
    cumulativeSkillIn(l: CrewLocation, s: SkillType): number;
    canAttack(s: CombatShip): boolean;
    get maxHp(): number;
    recalculateMaxHp(): void;
    get hp(): number;
    set hp(newValue: number);
    logEntry(s: string, lv: LogLevel): void;
    updateMaxScanProperties(): void;
}
//# sourceMappingURL=Ship.d.ts.map