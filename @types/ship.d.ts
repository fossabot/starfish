interface BaseShipData {
  name: string
  id?: string
  location?: CoordinatePair
  species: { id: SpeciesKey }
  seenPlanets?: { name: PlanetName }[]
  loadout?: LoadoutName
  chassis?: { id: ChassisId }
  items?: BaseItemData[]
  ai?: boolean
  previousLocations?: CoordinatePair[]
  spawnPoint?: CoordinatePair
  level?: number
}

interface BaseHumanShipData extends BaseShipData {
  id: string
  crewMembers?: BaseCrewMemberData[]
  captain?: string
  log?: LogEntry[]
  logAlertLevel?: LogLevel
  commonCredits?: number
}

type GameChannelType = `alert` | `chat` | `broadcast`
interface GameChannelReference {
  id?: string
  type: GameChannelType
}

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

interface TakenDamageResult extends ResponseWithMessage {
  damageTaken: number
  didDie: boolean
  weapon: Weapon
  miss: boolean
}
