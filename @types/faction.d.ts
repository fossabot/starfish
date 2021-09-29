type FactionId = `green` | `blue` | `purple` | `red`

interface BaseFactionData {
  name: string
  id: FactionId
  color: string
  homeworld?: string
  ai?: boolean
  species?: Species[]
}

interface SpeciesStub {
  id: SpeciesId
  type?: `species`
}
interface BaseSpeciesData {
  icon: string
  id: SpeciesId
  aiOnly?: true
  singular: string
  description: string
  passives: CrewPassiveData[]
}
type SpeciesId =
  | `octopi`
  | `lobsters`
  | `crabs`
  | `sea turtles`
  | `sharks`
  | `dolphins`
  | `whales`
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
