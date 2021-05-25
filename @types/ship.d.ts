interface BaseShipData {
  name: string
  id?: string
  location?: CoordinatePair
  faction?: { color: FactionKey }
  seenPlanets?: { name: PlanetName }[]
  loadout?: LoadoutName
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
  commonCredits?: number
}

type GameChannelType = `alert` | `chat` | `broadcast`
interface GameChannelReference {
  id?: string
  type: GameChannelType
}

type RadiusType = `sight` | `attack` | `scan` | `broadcast`

type LogLevel = `low` | `medium` | `high` | `critical`
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
