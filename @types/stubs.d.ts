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
  radii?: {
    sight: number
    scan: number
    broadcast: number
    gameSize: number
    safeZone: number
    attack: number[]
  }
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
  shipCosmeticCurrency?: number

  combatTactic?: CombatTactic
  targetItemType?: ItemType | `any`
  targetShip?: Reference | null

  guildRankings?: GuildRanking[]
  passives?: ShipPassiveEffect[]
  slots?: number
  mass?: number
  availableTaglines?: string[]
  tagline?: string | null
  availableHeaderBackgrounds?: { id: string; url: string }[]
  headerBackground?: string | null
  achievements: string[]
  stats?: ShipStatEntry[]
  tutorial?: any
  captain?: string
  guildName?: string
  guildIcon?: string
  orders?: ShipOrders | false
  orderReactions?: ShipOrderReaction[]
  gameSettings?: AdminGameSettings
  banked?: BankEntry[]
  contracts?: Contract[]

  spawnPoint?: CoordinatePair
  level?: number

  debugLocations?: {
    point: CoordinatePair
    label?: string
  }[]
}
interface VisibleStub extends BaseStub {
  ships: ShipStub[]
  trails: { color?: string; points: CoordinatePair[] }[]
  planets: Partial<PlanetStub>[]
  comets: Partial<PlanetStub>[]
  caches: CacheStub[] | Partial<CacheStub>[]
  attackRemnants: AttackRemnantStub[]
  zones: ZoneStub[]
}

interface CrewMemberStub extends BaseStub {
  id: string
  name: string
  skills: XPData[]
  discordIcon?: string
  location?: CrewLocation
  speciesId?: SpeciesId
  stamina: number
  stats: CrewStatEntry[]
  inventory: Cargo[]
  credits: number
  crewCosmeticCurrency?: number
  passives: CrewPassiveData[]
  cockpitCharge: number
  combatTactic: CombatTactic | `none`
  targetItemType: ItemType | `any`
  attackTargetId: string
  attackGuilds?: GuildId[]
  targetLocation: CoordinatePair | false
  targetObject?:
    | { id: string; type: string; location: CoordinatePair }
    | false
  repairPriority: RepairPriority
  bottomedOutOnStamina: boolean
  maxCargoSpace: number
  lastActive?: number
  tagline?: string | null
  background?: string
  availableTaglines?: string[]
  availableBackgrounds?: { id: string; url: string }[]
}

interface PlanetStub extends BaseStub {
  location: CoordinatePair
  name: string
  id: string
  color?: string
  guildId?: GuildId
  vendor?: PlanetVendor
  allegiances?: PlanetAllegianceData[]
  priceFluctuator?: number
  bank?: boolean
  defense?: number
  level?: number
  radius?: number
  mass?: number
  contracts?: PlanetContractAvailable[]
  passives?: ShipPassiveEffect[]
  landingRadiusMultiplier?: number
  planetType?: PlanetType
  trail?: CoordinatePair[]
  mine?: PlanetMine
  velocity?: CoordinatePair
  speed?: number
  direction?: number
}
interface PlanetLogStub extends BaseStub {
  type: `planet`
  name: string
  id: string
  planetType: string
}
interface CacheStub extends BaseStub {
  location: CoordinatePair
  [key: string]: any
}
interface ZoneStub extends BaseStub {
  type: `zone`
  id: string
  location: CoordinatePair
  radius: number
  color: string
  name: string
  effects?: ZoneEffect[]
}
interface AttackRemnantStub extends BaseStub {
  attacker?: ShipStub
  defender?: ShipStub
  damageTaken: TakenDamageResult
  start: CoordinatePair
  end: CoordinatePair
  time: number
  id: string
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
}
interface EngineStub extends ItemStub {
  thrustAmplification?: number
}
