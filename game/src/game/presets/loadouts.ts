import c from '../../../../common/dist'

const loadouts: { [key in LoadoutId]: Loadout } = {
  tutorial1: {
    chassis: `starter1`,
    items: [
      { type: `engine`, id: `tutorial1` },
      { type: `scanner`, id: `tutorial1` },
    ],
  },
  tutorial2: {
    chassis: `starter1`,
    items: [
      { type: `engine`, id: `tutorial1` },
      { type: `weapon`, id: `tutorial1` },
      { type: `scanner`, id: `tutorial1` },
    ],
  },
  aiTutorial1: {
    chassis: `starter1`,
    items: [{ type: `weapon`, id: `tiny1` }],
  },
  humanDefault: {
    chassis: `starter1`,
    items: [
      { type: `weapon`, id: `cannon1` },
      // { type: `weapon`, id: `tiny1` },
      { type: `engine`, id: `starter1` },
      { type: `scanner`, id: `starter1` },
      // { type: `scanner`, id: `starter2` },
      { type: `communicator`, id: `starter1` },
      // { type: `armor`, id: `starter` },
    ],
  },

  // ----- loadouts for testing -----

  test1: {
    chassis: `mega2`,
    items: [
      { type: `weapon`, id: `saber3` },
      { type: `weapon`, id: `sniper3` },
      { type: `communicator`, id: `distance3` },
      { type: `scanner`, id: `shipscanner3` },
      { type: `engine`, id: `basic3` },
      { type: `engine`, id: `glass3` },
      { type: `engine`, id: `glass3` },
      { type: `engine`, id: `glass3` },
      { type: `engine`, id: `glass3` },
      { type: `engine`, id: `glass3` },
      { type: `engine`, id: `glass3` },
      { type: `engine`, id: `glass3` },
      { type: `engine`, id: `glass3` },
      { type: `engine`, id: `glass3` },
      { type: `engine`, id: `glass3` },
      { type: `engine`, id: `glass3` },
      { type: `engine`, id: `glass3` },
      { type: `engine`, id: `glass3` },
      { type: `engine`, id: `glass3` },
      { type: `engine`, id: `glass3` },
      { type: `engine`, id: `glass3` },
      { type: `engine`, id: `glass3` },
      { type: `engine`, id: `glass3` },
      { type: `engine`, id: `glass3` },
      { type: `engine`, id: `glass3` },
      { type: `armor`, id: `block4` },
    ],
  },
}

export default loadouts
