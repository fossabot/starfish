import c from '../../../../../common/dist'

const loadouts: { [key in LoadoutName]: Loadout } = {
  humanDefault: {
    chassis: `starter1`,
    items: [
      { type: `weapon`, id: `cannon1` },
      { type: `engine`, id: `starter1` },
      { type: `scanner`, id: `starter1` },
      { type: `scanner`, id: `starter2` },
      // { type: `communicator`, id: `starter1` },
      // { type: `armor`, id: `starter` },
    ],
  },
}

export default loadouts
