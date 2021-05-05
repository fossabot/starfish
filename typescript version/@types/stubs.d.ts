interface ShipStub {
  id: string
  name: string
  weapons: WeaponStub[]
  engines: EngineStub[]
  previousLocations: CoordinatePair[]
  location: CoordinatePair
  velocity: CoordinatePair
  human: boolean
  attackable: boolean
  dead: boolean
  hp: number
  obeysGravity: boolean
  planet: PlanetStub
  faction: FactionStub
  [key: string]: any
}

interface PlanetStub {
  [key: string]: any
}

interface FactionStub {
  [key: string]: any
}

interface WeaponStub {
  [key: string]: any
}
interface EngineStub {
  [key: string]: any
}
