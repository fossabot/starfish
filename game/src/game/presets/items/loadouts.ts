import c from '../../../../../common/dist'

const loadouts: { [key in LoadoutName]: Loadout } = {
  tutorial1: {
    chassis: `starter1`,
    items: [
      { type: `engine`, id: `tutorial1` },
      { type: `scanner`, id: `starter1` },
    ],
  },
  tutorial2: {
    chassis: `starter1`,
    items: [
      { type: `engine`, id: `tutorial1` },
      { type: `weapon`, id: `tutorial1` },
      { type: `scanner`, id: `starter1` },
    ],
  },
  tutorial3: {
    chassis: `starter1`,
    items: [
      { type: `engine`, id: `tutorial1` },
      { type: `weapon`, id: `tutorial1` },
      { type: `scanner`, id: `starter1` },
      { type: `communicator`, id: `starter1` },
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
      { type: `engine`, id: `starter1` },
      { type: `scanner`, id: `starter1` },
      // { type: `scanner`, id: `starter2` },
      { type: `communicator`, id: `starter1` },
      // { type: `armor`, id: `starter` },
    ],
  },
}

export default loadouts
