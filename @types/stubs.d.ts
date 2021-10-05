interface BaseStub {}

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
  guildId: GuildId
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

  guildRankings?: GuildRanking[]
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
  orders?: ShipOrders | false
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
  speciesId?: SpeciesId
  stamina: number
  stats: CrewStatEntry[]
  inventory: Cargo[]
  credits: number
  passives: CrewPassiveData[]
  cockpitCharge: number
  combatTactic: CombatTactic | `none`
  targetItemType: ItemType | `any`
  attackTargetId: string
  attackGuilds?: GuildId[]
  targetLocation: CoordinatePair | false
  repairPriority: RepairPriority
  [key: string]: any
}

interface PlanetStub extends BaseStub {
  location: CoordinatePair
  name: string
  guildId?: GuildId
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

interface ItemStub extends BaseStub {
  type: ItemType
  id: ItemId
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
