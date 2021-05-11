interface BaseShipData {
  name: string
  id?: string
  planet?: PlanetKey
  faction?: FactionKey
  loadout?: string
}

interface BaseHumanShipData extends BaseShipData {
  id: string
  crewMembers?: BaseCrewMemberData[]
  captain?: string
}

interface TakenDamageResult extends ResponseWithMessage {
  damageTaken: number
  didDie: boolean
  weapon: Weapon
}

interface ThrustRequest {
  id: string
  angle: number
  powerPercent: number
}
interface ThrustResult extends ResponseWithMessage {
  angle: number
  velocity: number
}

interface AttackRequest {
  id: string
  enemyId: string
  weaponId: string
  efficacy: number
}
