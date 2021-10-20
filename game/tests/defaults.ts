export function crewMemberData(): BaseCrewMemberData {
  const randomId = Math.random().toString(36).substring(7)
  return {
    name: `Test User ` + randomId,
    id: `testUser` + randomId,
  }
}

export function humanShipData(
  loadout: LoadoutId = `humanDefault`,
): BaseHumanShipData {
  const randomId = Math.random().toString(36).substring(7)
  return {
    id: `testShip` + randomId,
    name: `Test Ship ` + randomId,
    loadout,
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
