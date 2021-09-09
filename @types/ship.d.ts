interface BaseShipData {
  name: string
  id?: string
  location?: CoordinatePair
  velocity?: CoordinatePair
  species: { id: SpeciesKey }
  seenPlanets?: { name: string }[]
  seenLandmarks?: { id: string; type: `zone` }[]
  loadout?: LoadoutId
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

type ShipPassiveEffectType =
  | `boostDropAmount`
  | `boostDropRarity`
  | `boostScanRange`
  | `boostSightRange`
  | `boostBroadcastRange`
  | `boostRepairSpeed`
  | `boostRestSpeed`
  | `boostMineSpeed`
  | `boostBrake`
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
  | `boostDamageToItemType`
interface ShipPassiveEffect {
  id: ShipPassiveEffectType
  intensity?: number
  data?: {
    source?: {
      planetName?: string
      speciesId?: SpeciesKey
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
  | `seenLandmarks`
  | `damageDealt`
  | `damageTaken`
  | `distanceTraveled`
  | `cachesRecovered`
  | `planetTime`
  | `totalTonsMined`
interface ShipStatEntry {
  stat: ShipStatKey
  amount: number
}
