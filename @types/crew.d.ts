type CrewLocation =
  | `bunk`
  | `cockpit`
  | `repair`
  | `weapons`
interface BaseRoomData {
  id: CrewLocation
  description: string
}

type SkillType =
  | `piloting`
  | `munitions`
  | `mechanics`
  | `linguistics`

type Tactic = `defensive` | `aggressive`

type RepairPriority =
  | `most damaged`
  | `engines`
  | `weapons`
  | `communicators`
  | `scanners`

type CrewActiveType = `boost` | `quickFix` | `sightRange`
type CrewPassiveType = `cargoSpace`

type CrewStatKey =
  | `totalContributedToCommonFund`
  | `cargoTransactions`
interface CrewStatEntry {
  stat: CrewStatKey
  amount: number
}

interface PassiveCrewUpgrade {
  type: CrewPassiveType
  level: number
}

interface BaseCrewMemberData {
  name: string
  id: string
  lastActive?: number
  skills?: XPData[]
  location?: CrewLocation
  stamina?: number
  inventory?: Cargo[]
  credits?: number
  actives?: BaseCrewActiveData[]
  passives?: BaseCrewPassiveData[]
  cockpitCharge?: number
  tactic?: Tactic
  itemTarget?: ItemType
  attackFactions?: FactionKey[]
  targetLocation?: CoordinatePair | null
  repairPriority?: RepairPriority
  stats?: CrewStatEntry[]
}

interface XPData {
  skill: SkillType
  level: number
  xp: number
}

interface BaseCrewActiveData {
  displayName: string
  type: CrewActiveType
  basePrice: number
  rarity: number
}
interface BaseCrewPassiveData {
  displayName: string
  type: CrewPassiveType
  basePrice: number
  level?: number
  factor: number
  rarity: number
}
