interface BaseShipData {
  name: string
  id?: string
  location?: CoordinatePair
  velocity?: CoordinatePair
  species: { id: SpeciesKey }
  seenPlanets?: { name: PlanetName }[]
  loadout?: LoadoutName
  chassis?: { id: ChassisId }
  items?: BaseItemData[]
  ai?: boolean
  previousLocations?: CoordinatePair[]
  spawnPoint?: CoordinatePair
  level?: number
  tagline?: string
  availableTaglines?: string[]
  headerBackground?: string
  availableHeaderBackgrounds?: string[]
  stats?: ShipStatEntry[]
}

interface BaseHumanShipData extends BaseShipData {
  id: string
  crewMembers?: BaseCrewMemberData[]
  captain?: string
  log?: LogEntry[]
  logAlertLevel?: LogLevel
  commonCredits?: number
  tutorial?: { step: number }
}

interface BaseAIShipData extends BaseShipData {
  onlyVisibleToShipId?: string
}

type GameChannelType = `alert` | `chat` | `broadcast`
interface GameChannelReference {
  id?: string
  type: GameChannelType
}
type GameRoleType = `crew`

type RadiusType =
  | `sight`
  | `attack`
  | `scan`
  | `broadcast`
  | `game`

type LogLevel = `low` | `medium` | `high` | `critical`
type LogAlertLevel = LogLevel | `off`
interface LogEntry {
  time: number
  level: LogLevel
  text: string
}

type ShipPassiveEffectType =
  | `boostDropAmount`
  | `boostDropRarity`
  | `boostScanRange`
  | `boostSightRange`
  | `boostBroadcastRange`
  | `boostRepairSpeed`
  | `boostRestSpeed`
  // | `boostThrust`
  | `boostCockpitChargeSpeed`
  | `boostXpGain`
  | `flatSkillBoost`
  | `scaledDamageReduction`
  | `flatDamageReduction`
  | `extraEquipmentSlots`
  | `boostCargoSpace`
  | `boostChassisAgility`
  | `disguiseCrewMemberCount`
  | `disguiseChassisType`
  | `boostAttackWithNumberOfFactionMembersWithinDistance`
interface ShipPassiveEffect {
  id: ShipPassiveEffectType
  intensity?: number
  [key: string]: any
}

interface TakenDamageResult extends ResponseWithMessage {
  damageTaken: number
  didDie: boolean
  weapon: Weapon
  miss: boolean
}

interface TargetLocation {
  coordinates: CoordinatePair
  label: string
  color?: string
}

type ShipStatKey =
  | `kills`
  | `deaths`
  | `seenPlanets`
  | `damageDealt`
  | `damageTaken`
  | `distanceTraveled`
  | `cachesRecovered`
interface ShipStatEntry {
  stat: ShipStatKey
  amount: number
}
