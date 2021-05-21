import c from '../../../../../../common/dist'
import { Ship } from '../Ship'

import { weapons, engines } from '../../../presets/items'
import { Item } from '../../Item/Item'
import { Weapon } from '../../Item/Weapon'
import { Engine } from '../../Item/Engine'
import loadouts from '../../../presets/loadouts'

export function addWeapon(
  this: Ship,
  id: WeaponType,
  props?: Partial<BaseWeaponData>,
): boolean {
  const baseData = weapons[id]
  if (!baseData) return false
  const item = new Weapon(baseData, this, props)
  this.weapons.push(item)
  this.recalculateMaxHp()
  this.toUpdate.attackRadius = this.radii.attack
  return true
}

export function addEngine(
  this: Ship,
  id: EngineType,
  props?: Partial<BaseEngineData>,
): boolean {
  const baseData = engines[id]
  if (!baseData) return false
  const item = new Engine(baseData, this, props)
  this.engines.push(item)
  this.recalculateMaxHp()
  return true
}

export function removeItem(
  this: Ship,
  item: Item,
): boolean {
  const weaponIndex = this.weapons.findIndex(
    (w) => w === item,
  )
  if (weaponIndex !== -1) {
    this.weapons.splice(weaponIndex, 1)
    return true
  }
  const engineIndex = this.engines.findIndex(
    (e) => e === item,
  )
  if (engineIndex !== -1) {
    this.engines.splice(engineIndex, 1)
    return true
  }
  this.recalculateMaxHp()
  return false
}

export function equipLoadout(
  this: Ship,
  name: string,
): boolean {
  const loadout = loadouts[name]
  if (!loadout) return false
  loadout.weapons.forEach((baseData: BaseWeaponData) =>
    this.addWeapon(baseData.id),
  )
  loadout.engines.forEach((baseData: BaseEngineData) =>
    this.addEngine(baseData.id),
  )
  return true
}
