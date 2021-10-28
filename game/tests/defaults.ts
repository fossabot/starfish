export function crewMemberData(): BaseCrewMemberData {
  const randomId = Math.random().toString(36).substring(7)
  return {
    name: `Test User ` + randomId,
    id: `testUser` + randomId,
  }
}

let shipIdCount = 0
export function humanShipData(
  loadout: LoadoutId = `humanDefault`,
): BaseHumanShipData {
  const id = shipIdCount++
  return {
    id: `testShip` + id,
    name: `Test Ship ` + id,
    location: [0, 0],
    loadout,
  }
}
export function aiShipData(
  level: number = 1,
  speciesId: AISpeciesId = `eagles`,
): BaseAIShipData {
  const id = shipIdCount++
  return {
    id: `aiShip` + speciesId + id,
    name: `${speciesId} ` + id,
    location: [0, 0],
    level,
    speciesId,
  }
}

function planetData(): BasePlanetData {
  const randomId = Math.random().toString(36).substring(7)
  return {
    planetType: `basic`,
    id: `planet` + randomId,
    name: `Planet ` + randomId,
    color: `red`,
    location: [0, 0],
    radius: 1000000,
    mass: 6e31,
    landingRadiusMultiplier: 1,
    level: 0,
    xp: 0,
    baseLevel: 1,
    creatures: [],
  }
}

export function basicPlanetData(): BaseBasicPlanetData {
  return {
    ...planetData(),
    planetType: `basic`,
    leanings: [],
    allegiances: [],
    vendor: {
      cargo: [],
      items: [],
      chassis: [],
      passives: [],
      shipCosmetics: [],
    },
    bank: true,
  }
}

export function miningPlanetData(): BaseMiningPlanetData {
  return {
    ...planetData(),
    planetType: `mining`,
  }
}
