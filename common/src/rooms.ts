export const rooms: {
  [key in CrewLocation]: BaseRoomData
} = {
  bunk: {
    id: `bunk`,
    description: `Catch some sleep and recharge your stamina.`,
  },
  weapons: {
    id: `weapons`,
    description: `Charge, target, and fire the ship's weapons.`,
  },
  repair: {
    id: `repair`,
    description: `Fix the ship's equipment.`,
  },
  cockpit: {
    id: `cockpit`,
    description: `Set a course and contribute your thrust to the ship.`,
  },
  mine: {
    id: `mine`,
    description: `Mine the planet's surface for resources.`,
  },
  lab: {
    id: `lab`,
    description: `Research upgrades for the ship's equipment.`,
  },
}

export default rooms
