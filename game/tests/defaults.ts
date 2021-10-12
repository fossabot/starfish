export function crewMemberData(): BaseCrewMemberData {
  const randomId = Math.random().toString(36).substring(7)
  return {
    name: `Test User ` + randomId,
    id: `testUser` + randomId,
  }
}
export function humanShipData(): BaseHumanShipData {
  const randomId = Math.random().toString(36).substring(7)
  return {
    id: `testShip` + randomId,
    name: `Test Ship ` + randomId,
  }
}
