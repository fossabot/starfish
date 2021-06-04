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
  actives?: BaseCrewActiveData[]
  passives?: BaseCrewPassiveData[]
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
