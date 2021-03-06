interface BaseShipData {
  name: string
  id?: string
  spawnedAt?: number
  guildId?: GuildId
  location?: CoordinatePair
  velocity?: CoordinatePair
  seenPlanets?: { id: string; name?: string }[]
  seenLandmarks?: { id: string; type: `zone` }[]
  loadout?: LoadoutId
  chassis?: { chassisId: ChassisId }
  items?: BaseItemData[]
  ai?: boolean
  previousLocations?: PreviousLocation[]
  spawnPoint?: CoordinatePair
  level?: number
  tagline?: string
  headerBackground?: string
  boughtHeaderBackgrounds?: ShipBackground[]
  achievements?: string[]
  stats?: ShipStatEntry[]
  timedPassives?: ShipPassiveEffect[]
}

interface BaseHumanShipData extends BaseShipData {
  id: string
  crewMembers?: BaseCrewMemberData[]
  captain?: string
  log?: LogEntry[]
  logAlertLevel?: LogLevel
  commonCredits?: number
  shipCosmeticCurrency?: number
  tutorial?: { step: number }
  guildIcon?: string
  guildName?: string
  orders?: ShipOrders
  banked?: BankEntry[]
  orderReactions?: ShipOrderReaction[]
  seenCrewMembers?: string[]
  boughtHeaderBackgrounds?: ShipBackground[]
  boughtTaglines?: string[]
  contracts?: Contract[]
  hasNotifiedAboutInactivity?: boolean
}

interface BaseAIShipData extends BaseShipData {
  onlyVisibleToShipId?: string
  speciesId?: SpeciesId
  until?: number
  neverAttackIds?: string[]
  spawnedById?: string
}

type GameChannelType = `alert` | `chat` | `broadcast`
interface GameChannelReference {
  id?: string
  type: GameChannelType
}
type GameRoleType = `crew`

type RadiusType = `sight` | `attack` | `scan` | `broadcast` | `gameSize`

type ShipPassiveEffectId =
  | `boostDropAmount`
  | `boostDropRarity`
  | `boostScanRange`
  | `boostSightRange`
  | `boostBroadcastRange`
  | `boostRepairSpeed`
  | `boostMineSpeed`
  | `boostMinePayouts`
  | `boostBrake`
  | `boostThrust`
  | `boostPassiveThrust`
  | `boostCockpitChargeSpeed`
  | `boostWeaponChargeSpeed`
  | `boostXpGain`
  | `flatSkillBoost`
  | `scaledDamageReduction`
  | `flatDamageReduction`
  | `extraEquipmentSlots`
  | `boostCargoSpace`
  | `boostChassisAgility`
  | `disguiseCrewMemberCount`
  | `disguiseChassisType`
  | `alwaysSeeTrailColors`
  | `boostAccuracy`
  | `boostDamage`
  | `boostDamageWhenNoAlliesWithinDistance`
  | `boostDamageWithNumberOfGuildMembersWithinDistance`
  | `boostDamageToItemType`
  | `boostStaminaRegeneration`
  | `autoRepair`
  | `visibleCargoPrices`
  | `broadcastRangeCargoPrices`
  | `boostMoraleGain`
  | `attacksSlow`
interface ShipPassiveEffect {
  id: ShipPassiveEffectId
  intensity?: number
  until?: number
  data?: {
    source?: {
      crewActive?: {
        activeId: CrewActiveId
        crewMemberId: string
      }
      planetName?: string
      zoneName?: string
      speciesId?: SpeciesId
      chassisId?: ChassisId
      guildId?: GuildId
      item?: {
        type: ItemType
        id: ItemId
      }
    }
    type?: ItemType
    distance?: number
  }
}

interface TakenDamageResult extends ResponseWithMessage {
  damageTaken: number
  didDie: boolean
  weapon: {
    id?: string
    itemType?: ItemType
    itemId?: ItemId
    displayName: string
  }
  miss: boolean
  didCrit?: boolean
}
interface AttackDamageResult {
  miss: boolean
  damage: number
  weapon?: Weapon
  targetType: ItemType | `any`
  didCrit?: boolean
}

interface TargetLocation {
  location: CoordinatePair
  label?: string
  labelTop?: string
  color?: string
  radius?: number
}

type ShipStatKey =
  | `kills`
  | `deaths`
  | `seenPlanets`
  | `seenLandmarks`
  | `damageDealt`
  | `damageTaken`
  | `distanceTraveled`
  | `cachesRecovered`
  | `planetTime`
  | `totalTonsMined`
  | `highestSpeed`
  | `tutorials`
  | `netWorth`
  | `completedContracts`
  | `leftUniverse`
interface ShipStatEntry {
  stat: ShipStatKey
  amount: number
}

interface ShipOrders {
  verb: string
  target?: {
    id?: string
    type?: string
    name?: string
    speciesId?: string
    [key: string]: any
  }
  addendum?: string
}

interface ShipOrderReaction {
  id: string
  reaction: string
}

interface BankEntry {
  id: string
  amount: number
  timestamp: number
}

interface Achievement {
  id: string
  for: string
  condition?: true | AchievementCondition
  reward: ShipCosmetic | ShipCosmetic[]
  silent?: true
}

interface ShipBackground {
  id: string
  url: `${string}.${`svg` | `webp` | `png` | `jpg`}`
}

interface ShipCosmetic {
  tagline?: string
  headerBackground?: ShipBackground
}

interface AchievementCondition {
  stat?: AchievementStatCondition | AchievementStatCondition[]
  prop?: AchievementPropCondition | AchievementPropCondition[]
  membersIn?: AchievementMembersInCondition | AchievementMembersInCondition[]
}

interface AchievementStatCondition {
  id: ShipStatKey
  lte?: false
  amount: number
}

interface AchievementPropCondition {
  id: keyof ShipStub

  is?: number | string | boolean | null

  secondaryId?: string

  length?: true
  lte?: false
  amount?: number
}

interface AchievementMembersInCondition {
  roomId: CrewLocation
  amount: `all` | number
}

interface Contract extends PlanetContractAvailable {
  claimableExpiresAt: undefined
  timeAccepted: number
  fromPlanetId: string
  status: `active` | `done` | `stolen`
  lastSeenLocation: CoordinatePair
}
