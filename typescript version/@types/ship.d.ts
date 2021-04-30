interface BaseShipData {
  name: string
  id?: string
  planet?: string
  faction?: string
  loadout?: string
}
interface BaseHumanShipData extends BaseShipData {
  id: string
  faction?: string
}
