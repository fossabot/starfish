import c from '../../common'
import { Weapon } from '../classes/Item/Weapon'
import { weapons, engines } from './items'

const loadouts: { [key: string]: Loadout } = {}

function addLoadout(
  name: string,
  weaponIds: string[],
  engineIds: string[],
): void {
  const w = weaponIds
    .map((id: string) => weapons[id])
    .filter((w) => w)
  const e = engineIds
    .map((id: string) => engines[id])
    .filter((e) => e)
  loadouts[name] = { name, weapons: w, engines: e }
}

// ----- declare preset loadouts -----

addLoadout(`human_default`, [`cannon`], [`starter`])
addLoadout(`ai_default`, [`cannon`], [`starter`])

export default loadouts
