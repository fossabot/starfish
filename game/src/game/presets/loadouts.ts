import c from '../../../../common/dist'

const loadouts: { [key in LoadoutName]?: Loadout } = {
  humanDefault: [
    { type: `weapon`, id: `cannon` },
    { type: `engine`, id: `starter` },
  ],
  aiDefault: [
    { type: `weapon`, id: `cannon` },
    { type: `engine`, id: `starter` },
  ],
}

export default loadouts
