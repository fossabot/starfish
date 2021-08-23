type CargoId =
  | `salt`
  | `water`
  | `oxygen`
  | `plastic`
  | `carbon`
  | `steel`
  | `titanium`
  | `uranium`

type CargoData = {
  id: CargoId
  name: string
  basePrice: number
  rarity: number
}

interface Cargo {
  id: CargoId
  amount: number
}
