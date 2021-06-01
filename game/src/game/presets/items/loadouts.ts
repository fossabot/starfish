import c from '../../../../../common/dist'

const loadouts: { [key in LoadoutName]: Loadout } = {
  humanDefault: {
    chassis: `starter`,
    items: [
      { type: `weapon`, id: `cannon` },
      { type: `engine`, id: `starter` },
      { type: `scanner`, id: `starter` },
      { type: `communicator`, id: `starter` },
      // { type: `armor`, id: `starter` },
    ],
  },
  aiDefault: {
    chassis: `starter`,
    items: [
      { type: `weapon`, id: `cannon` },
      { type: `engine`, id: `starter` },
      { type: `scanner`, id: `starter` },
    ],
  },
}

export default loadouts

//
//
// weapon: [`cannon`],
//     engine: [`starter`],
//     scanner: [`starter`],
//     communicator: [`starter`],
//     armor: [`starter`],
// },
//
// aiDefault: {
//     chassis: `starter`,
//     weapon: [`cannon`],
//     engine: [`starter`],
//     scanner: [`starter`],
// },
//
