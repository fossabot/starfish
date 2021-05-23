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

type RepairPriority = `most damaged` | `engines` | `weapons`

type ActiveName = `boost`

type StatKey = `totalContributedToCommonFund`
interface CrewStatEntry {
  stat: StatKey
  amount: number
}

type PassiveCrewUpgradeKey = `storage1`
interface PassiveCrewUpgrade {
  type: PassiveCrewUpgradeKey
  level: number
}

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
  targetLocation?: CoordinatePair | null
  repairPriority?: RepairPriority
  stats?: CrewStatEntry[]
}

interface XPData {
  skill: SkillName
  level: number
  xp: number
}

interface BaseActiveData {
  id: ActiveName
}
