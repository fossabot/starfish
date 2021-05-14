type CargoType = 'metals' | 'food' | 'textiles'

type CargoData = {
  type: CargoType
  name: string
  basePrice: number
}

interface Cargo {
  type: CargoType
  amount: number
}
