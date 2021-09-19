type FactionKey = `green` | `blue` | `purple` | `red`

interface BaseFactionData {
  name: string
  id: FactionKey
  color: string
  homeworld?: string
  ai?: boolean
  species?: Species[]
}

interface BaseSpeciesData {
  icon: string
  factionId: FactionKey
  id: SpeciesKey
  singular: string
  description: string
  passives?: ShipPassiveEffect[]
}
type SpeciesKey =
  | `octopi`
  | `squids`
  | `lobsters`
  | `crabs`
  | `seals`
  | `sea turtles`
  | `dolphins`
  | `whales`
  | `tuna`
  | `angelfish`
  | `blowfish`
  | `shrimp`
  | `eagles`
  | `seagulls`
  | `chickens`
  | `flamingos`

type FactionRankingCategory =
  | `netWorth`
  | `control`
  | `members`
interface FactionRankingScoreEntry {
  faction: Faction
  score: number
}
interface FactionRankingTopEntry {
  name: string
  color: string
  score: number
}
interface FactionRanking {
  category: FactionRankingCategory
  scores: FactionRankingScoreEntry[]
  top?: FactionRankingTopEntry[]
}
