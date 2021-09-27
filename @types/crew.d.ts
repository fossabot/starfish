type CrewLocation =
  | `bunk`
  | `cockpit`
  | `repair`
  | `weapons`
  | `mine`
interface BaseRoomData {
  id: CrewLocation
  description: string
}

type SkillId =
  | `piloting`
  | `munitions`
  | `mechanics`
  | `linguistics`
  | `mining`

type CombatTactic = `defensive` | `aggressive` | `pacifist`

type RepairPriority =
  | `most damaged`
  | `engines`
  | `weapons`
  | `communicators`
  | `scanners`
  | `armor`

type MinePriorityType = CargoId | `closest`

type CrewActiveId = `boost` | `quickFix` | `sightRange`
type CrewPassiveId = `cargoSpace`

type CrewStatKey =
  | `totalContributedToCommonFund`
  | `cargoTransactions`
  | `totalHpRepaired`
  | `totalTonsMined`
  | `timeInBunk`
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
  combatTactic?: CombatTactic
  targetItemType?: ItemType
  minePriority?: MinePriorityType
  attackFactions?: FactionKey[]
  targetLocation?: CoordinatePair | null
  repairPriority?: RepairPriority
  stats?: CrewStatEntry[]
  tutorialShipId?: string
  mainShipId?: string
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
