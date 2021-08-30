type CrewLocation =
  | `bunk`
  | `cockpit`
  | `repair`
  | `weapons`
interface BaseRoomData {
  id: CrewLocation
  description: string
}

type SkillId =
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

type CrewActiveId = `boost` | `quickFix` | `sightRange`
type CrewPassiveId = `cargoSpace`

type CrewStatKey =
  | `totalContributedToCommonFund`
  | `cargoTransactions`
interface CrewStatEntry {
  stat: CrewStatKey
  amount: number
}

interface PassiveCrewUpgrade {
  id: CrewPassiveId
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
  skill: SkillId
  level: number
  xp: number
}

interface BaseCrewActiveData {
  displayName: string
  id: CrewActiveId
  basePrice: number
  rarity: number
}
interface BaseCrewPassiveData {
  displayName: string
  description: string
  id: CrewPassiveId
  basePrice: number
  level?: number
  factor: number
  rarity: number
}
