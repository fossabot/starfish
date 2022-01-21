const loadouts: { [key in LoadoutId]: Loadout } = {
  tutorial1: {
    chassisId: `starter1`,
    items: [
      { itemType: `engine`, itemId: `tutorial1` },
      { itemType: `scanner`, itemId: `tutorial1` },
    ],
  },
  tutorial2: {
    chassisId: `starter1`,
    items: [
      { itemType: `engine`, itemId: `tutorial1` },
      { itemType: `weapon`, itemId: `tutorial1` },
      { itemType: `scanner`, itemId: `tutorial1` },
    ],
  },
  aiTutorial1: {
    chassisId: `starter1`,
    items: [{ itemType: `weapon`, itemId: `tiny1` }],
  },
  humanDefault: {
    chassisId: `starter1`,
    items: [
      { itemType: `weapon`, itemId: `cannon1` },
      // { itemType: `weapon`, itemId: `tiny1` },
      { itemType: `engine`, itemId: `starter1` },
      { itemType: `scanner`, itemId: `starter1` },
      // { itemType: `scanner`, itemId: `starter2` },
      { itemType: `communicator`, itemId: `starter1` },
      // { itemType: `armor`, itemId: `starter` },
    ],
  },

  // ----- loadouts for testing -----

  testManualEngine: {
    chassisId: `starter1`,
    items: [
      { itemType: `weapon`, itemId: `saber3` },
      { itemType: `engine`, itemId: `glass3` },
    ],
  },
  testPassiveEngine: {
    chassisId: `starter1`,
    items: [
      { itemType: `weapon`, itemId: `saber3` },
      { itemType: `engine`, itemId: `passive1` },
    ],
  },
  testSlowingWeapon: {
    chassisId: `starter1`,
    items: [
      { itemType: `weapon`, itemId: `slowing1` },
      { itemType: `scanner`, itemId: `shipscanner3` },
    ],
  },
  testMega: {
    chassisId: `mega3`,
    items: [
      { itemType: `weapon`, itemId: `saber3` },
      { itemType: `weapon`, itemId: `sniper3` },
      { itemType: `communicator`, itemId: `distance3` },
      { itemType: `scanner`, itemId: `shipscanner3` },
      { itemType: `engine`, itemId: `basic3` },
      { itemType: `engine`, itemId: `duo3` },
      { itemType: `engine`, itemId: `duo3` },
      { itemType: `engine`, itemId: `duo3` },
      { itemType: `engine`, itemId: `glass3` },
      { itemType: `engine`, itemId: `glass3` },
      { itemType: `engine`, itemId: `glass3` },
      { itemType: `engine`, itemId: `glass3` },
      { itemType: `engine`, itemId: `glass3` },
      { itemType: `engine`, itemId: `glass3` },
      { itemType: `engine`, itemId: `glass3` },
      { itemType: `engine`, itemId: `glass3` },
      { itemType: `engine`, itemId: `glass3` },
      { itemType: `engine`, itemId: `glass3` },
      { itemType: `armor`, itemId: `block4` },
    ],
  },
}

export default loadouts
