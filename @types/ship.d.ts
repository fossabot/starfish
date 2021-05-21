interface BaseShipData {
  name: string
  id?: string
  location?: CoordinatePair
  faction?: { color: FactionKey }
  seenPlanets?: { name: PlanetName }[]
  loadout?: string
  engines?: BaseEngineData[]
  weapons?: BaseWeaponData[]
  ai?: Boolean
  previousLocations?: CoordinatePair[]
  spawnPoint?: CoordinatePair
}

interface BaseHumanShipData extends BaseShipData {
  id: string
  crewMembers?: BaseCrewMemberData[]
  captain?: string
  log?: LogEntry[]
}

type RadiusType = `sight` | `attack`

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
