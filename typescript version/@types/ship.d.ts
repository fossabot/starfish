interface BaseShipData {
  name: string
  id?: string
  planet?: string
  faction?: string
  loadout?: string
}
interface BaseHumanShipData extends BaseShipData {
  id: string
}

interface TakenDamageResult {
  damageTaken: number
  didDie: boolean
  weapon: Weapon
}
