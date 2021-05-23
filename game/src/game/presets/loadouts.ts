import c from '../../../../common/dist'
import { weapons, engines } from './items'

const loadouts: { [key in LoadoutName]?: Loadout } = {}

function addLoadout(
  name: LoadoutName,
  weaponIds: WeaponType[],
  engineIds: EngineType[],
): void {
  const w = weaponIds
    .map((id: WeaponType) => weapons[id])
    .filter((w) => w) as BaseWeaponData[]
  const e = engineIds
    .map((id: EngineType) => engines[id])
    .filter((e) => e) as BaseEngineData[]
  loadouts[name] = { name, weapons: w, engines: e }
}

// ----- declare preset loadouts -----

addLoadout(`human_default`, [`cannon`], [`starter`])
addLoadout(`ai_default`, [`cannon`], [`starter`])

export default loadouts
