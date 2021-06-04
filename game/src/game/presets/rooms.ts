export const rooms: {
  [key in CrewLocation]: BaseRoomData
} = {
  bunk: {
    id: `bunk`,
    description: `Catch some sleep and rebuild your stamina.`,
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
}
