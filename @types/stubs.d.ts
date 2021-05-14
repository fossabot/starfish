interface BaseStub {
  lastUpdated: number
}

interface GameStub extends BaseStub {
  ships: ShipStub[]
  planets: PlanetStub[]
  factions: FactionStub[]
  caches: CacheStub[]
  attackRemnants: AttackRemnantStub[]
  [key: string]: any
}

interface ShipStub extends BaseStub {
  id: string
  name: string
  weapons: WeaponStub[]
  engines: EngineStub[]
  previousLocations: CoordinatePair[]
  location: CoordinatePair
  velocity: CoordinatePair
  targetLocation: CoordinatePair
  visible: VisibleStub
  human: boolean
  attackable: boolean
  dead: boolean
  hp: number
  obeysGravity: boolean
  planet: PlanetStub | false
  faction: FactionStub | false
  crewMembers: CrewMemberStub[]
  [key: string]: any
}
interface VisibleStub extends BaseStub {
  ships: ShipStub[]
  planets: PlanetStub[]
  caches: CacheStub[]
  attackRemnants: AttackRemnantStub[]
}

interface CrewMemberStub extends BaseStub {
  id: string
  name: string
  skills: XPData[]
  location?: CrewLocation
  stamina: number
  [key: string]: any
}

interface PlanetStub extends BaseStub {
  [key: string]: any
}
interface CacheStub extends BaseStub {
  [key: string]: any
}
interface AttackRemnantStub extends BaseStub {
  [key: string]: any
}
interface FactionStub extends BaseStub {
  [key: string]: any
}

interface WeaponStub extends BaseStub {
  [key: string]: any
}
interface EngineStub extends BaseStub {
  [key: string]: any
}
