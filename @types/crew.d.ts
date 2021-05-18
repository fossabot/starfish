type CrewLocation =
  | `bunk`
  | `cockpit`
  | `repair`
  | `weapons`

type SkillName =
  | `piloting`
  | `munitions`
  | `mechanics`
  | `linguistics`

type Tactic = `defensive` | `aggressive`

type ActiveName = `boost`

interface BaseCrewMemberData {
  name: string
  id: string
  skills?: XPData[]
  location?: CrewLocation
  stamina?: number
  inventory?: Cargo[]
  credits?: number
  actives?: BaseActiveData[]
  tactic?: Tactic
  attackFactions?: FactionKey[]
}

interface XPData {
  skill: SkillName
  level: number
  xp: number
}

interface BaseActiveData {
  id: ActiveName
}
