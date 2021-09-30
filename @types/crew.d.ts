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

type CrewPassiveId =
  | `cargoSpace`
  | `boostCockpitChargeSpeed`
  | `boostThrust`
  | `boostMineSpeed`
  | `boostRepairSpeed`
  | `boostWeaponChargeSpeed`
  | `boostStaminaRegeneration`
  | `boostXpGain`
  | `generalImprovementWhenAlone`
  | `generalImprovementPerCrewMemberInSameRoom`
  | `boostDropAmounts`
  | `boostBroadcastRange`
  | `lessDamageOnEquipmentUse`
  | `boostBrake`

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
  speciesId?: SpeciesId
  lastActive?: number
  skills?: XPData[]
  location?: CrewLocation
  stamina?: number
  inventory?: Cargo[]
  credits?: number
  permanentPassives?: BaseCrewPassiveData[]
  cockpitCharge?: number
  combatTactic?: CombatTactic
  targetItemType?: ItemType
  minePriority?: MinePriorityType
  attackFactions?: FactionId[]
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

interface CrewPassiveData {
  id: CrewPassiveId
  intensity?: number
  displayName?: string
  description?: (data: CrewPassiveData) => string
  buyable?: {
    rarity: number
    basePrice: number
    baseIntensity: number
    wholeNumbersOnly: boolean
  }
  data?: {
    source?: {
      planetName?: string
      speciesId?: SpeciesId
      chassisId?: ChassisId
      item?: {
        type: ItemType
        id: ItemId
      }
    }
    type?: ItemType
    distance?: number
  }
}
