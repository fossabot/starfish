interface BaseStub {}

interface GameStub extends BaseStub {
  ships: ShipStub[]
  planets: PlanetStub[]
  factions: FactionStub[]
  caches: CacheStub[]
  attackRemnants: AttackRemnantStub[]
  [key: string]: any
}

interface ShipStub extends BaseStub {
  id: string
  name: string
  chassis?: BaseChassisData
  items?: ItemStub[]
  previousLocations: CoordinatePair[]
  location: CoordinatePair
  velocity?: CoordinatePair
  visible?: VisibleStub
  human: boolean
  ai: boolean
  attackable: boolean
  dead: boolean
  hp?: number
  radii?: { [key in RadiusType]?: number }
  obeysGravity?: boolean
  planet?: PlanetStub | false
  faction: FactionStub
  species: SpeciesStub
  rooms: { [key in CrewLocation]?: BaseRoomData }
  crewMembers?: CrewMemberStub[]
  log?: LogEntry[]
  channelReferences?: GameChannelReference[]
  speed?: number
  direction?: number
  seenPlanets?: PlanetStub[]
  seenLandmarks?: any[]
  _hp?: number
  _maxHp?: number
  shownPanels?: FrontendPanelType[] | false
  commonCredits?: number

  combatTactic?: CombatTactic
  targetItemType?: ItemType | `any`
  targetShip?: Reference | null

  factionRankings?: FactionRanking[]
  passives?: ShipPassiveEffect[]
  slots?: number
  mass?: number
  availableTaglines?: string[]
  tagline?: string | null
  availableHeaderBackgrounds?: string[]
  headerBackground?: string | null
  stats?: ShipStatEntry[]
  tutorial?: any
  captain?: string
  guildName?: string
  guildIcon?: string
  orders?: ShipOrders | null
  gameSettings?: AdminGameSettings
}
interface VisibleStub extends BaseStub {
  ships: ShipStub[]
  trails: { color?: string; points: CoordinatePair[] }[]
  planets: Partial<PlanetStub>[]
  caches: CacheStub[] | Partial<CacheStub>[]
  attackRemnants: AttackRemnantStub[]
  zones: ZoneStub[]
}

interface CrewMemberStub extends BaseStub {
  id: string
  name: string
  skills: XPData[]
  location?: CrewLocation
  stamina: number
  stats: CrewStatEntry[]
  inventory: Cargo[]
  credits: number
  passives: BaseCrewPassiveData[]
  cockpitCharge: number
  tactic: CombatTactic
  itemTarget: ItemType
  attackFactions?: FactionId[]
  targetLocation: CoordinatePair | null
  repairPriority: RepairPriority
  [key: string]: any
}

interface PlanetStub extends BaseStub {
  location: CoordinatePair
  name: string
  vendor?: PlanetVendor
  allegiances: PlanetAllegianceData[]
  priceFluctuator: number
  [key: string]: any
}
interface PlanetLogStub extends BaseStub {
  type: `planet`
  name: string
  id: string
}
interface CacheStub extends BaseStub {
  location: CoordinatePair
  [key: string]: any
}
interface ZoneStub extends BaseStub {
  location: CoordinatePair
  radius: number
  color: string
  name: string
  [key: string]: any
}
interface AttackRemnantStub extends BaseStub {
  attacker: ShipStub
  defender: ShipStub
  damageTaken: TakenDamageResult
  start: CoordinatePair
  end: CoordinatePair
  time: number
  id: string
  [key: string]: any
}
interface FactionStub extends BaseStub {
  id: FactionId
  name?: string
  color?: string
  ai?: boolean
  [key: string]: any
}

interface ItemStub extends BaseStub {
  type: ItemType
  id: string
  repair?: number
  ownerId?: string
  displayName?: string
}
interface WeaponStub extends ItemStub {
  cooldownRemaining?: number
  [key: string]: any
}
interface EngineStub extends ItemStub {
  [key: string]: any
}
