type CargoType = `salt` | `water` | `oxygen`

type CargoData = {
  type: CargoType
  name: string
  basePrice: number
}

interface Cargo {
  type: CargoType
  amount: number
}
