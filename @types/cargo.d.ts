type CargoType =
  | `salt`
  | `water`
  | `oxygen`
  | `plastic`
  | `carbon`
  | `steel`
  | `titanium`
  | `uranium`

type CargoData = {
  type: CargoType
  name: string
  basePrice: number
  rarity: number
}

interface Cargo {
  type: CargoType
  amount: number
}
