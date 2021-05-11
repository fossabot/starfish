type FactionKey = 'green' | 'gray'

interface BaseFactionData {
  name: string
  color: string
  homeworld?: string
  ai?: boolean
}
