type ZoneEffectType =
  | `damage over time`
  | `repair over time`
  | `stamina regeneration`
  | `accelerate`
  | `decelerate`
  | `wormhole`
  | `broadcast boost`
  | `sight boost`

interface ZoneEffect {
  type: ZoneEffectType
  intensity: number
  basedOnProximity?: boolean
  dodgeable?: boolean
  procChancePerTick: number
}

interface BaseZoneData {
  id: string
  name: string
  location: CoordinatePair
  color: string
  radius: number
  effects: ZoneEffect[]
  passives?: ShipPassiveEffect[]
}
