type GuildId =
  | `fowl`
  | `trader`
  | `hunter`
  | `miner`
  | `explorer`
  | `peacekeeper`

interface BaseGuildData {
  name: string
  id: GuildId
  color: string
  aiOnly?: undefined | true
  passives: ShipPassiveEffect[]
}

type GuildRankingCategory =
  | `netWorth`
  | `control`
  | `members`

interface GuildRankingScoreEntry {
  guildId: GuildId
  score: number
}
interface GuildRankingTopEntry {
  name: string
  color: string
  score: number
}
interface GuildRanking {
  category: GuildRankingCategory
  scores: GuildRankingScoreEntry[]
  top?: GuildRankingTopEntry[]
}
