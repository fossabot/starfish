type CrewLocation =
  | `bunk`
  | `cockpit`
  | `repair`
  | `weapons`
  | `mine`
  | `lab`
interface BaseRoomData {
  id: CrewLocation
  description: string
}

type SkillId =
  | `strength`
  | `dexterity`
  | `intellect`
  | `charisma`
// | `piloting`
// | `munitions`
// | `mechanics`
// | `linguistics`
// | `mining`

type CombatTactic =
  | `defensive`
  | `aggressive`
  | `onlyNonPlayers`
  | `onlyPlayers`
  | `pacifist`

type RepairPriority =
  | `most damaged`
  | `engines`
  | `weapons`
  | `communicators`
  | `scanners`
  | `armor`

type MineableResource =
  | CargoId
  | `shipCosmeticCurrency`
  | `crewCosmeticCurrency`
type MinePriorityType = MineableResource | `closest`

type CrewStatKey =
  | `totalContributedToCommonFund`
  | `cargoTransactions`
  | `totalHpRepaired`
  | `totalTonsMined`
  | `timeInBunk`
  | `totalSpeedApplied`
  | `totalResearched`
interface CrewStatEntry {
  stat: CrewStatKey
  amount: number
}

interface BaseCrewMemberData {
  name: string
  id: string
  joinDate?: number
  discordIcon?: string
  speciesId?: SpeciesId
  lastActive?: number
  skills?: XPData[]
  location?: CrewLocation
  stamina?: number
  inventory?: Cargo[]
  credits?: number
  crewCosmeticCurrency?: number
  actives?: CrewActive[]
  lastActiveUse?: number
  permanentPassives?: CrewPassiveData[]
  timedPassives?: CrewPassiveData[]
  cockpitCharge?: number
  combatTactic?: CombatTactic
  targetItemType?: ItemType
  minePriority?: MinePriorityType
  targetLocation?: CoordinatePair | null
  repairPriority?: RepairPriority
  stats?: CrewStatEntry[]
  researchTargetId?: string

  tutorialShipId?: string
  mainShipId?: string

  background?: string
  availableBackgrounds?: CrewBackground[]
  tagline?: string
  availableTaglines?: string[]
}

interface XPData {
  skill: SkillId
  level: number
  xp: number
}

type CrewPassiveId =
  | `boostSkillLevel`
  | `cargoSpace`
  | `boostCockpitChargeSpeed`
  | `boostPassiveThrust`
  | `boostThrust`
  | `boostMineSpeed`
  | `boostRepairSpeed`
  | `boostWeaponChargeSpeed`
  | `boostStaminaRegeneration`
  | `reduceStaminaDrain`
  | `boostXpGain`
  | `generalImprovementWhenAlone`
  | `generalImprovementPerCrewMemberInSameRoom`
  | `boostDropAmounts`
  | `boostBroadcastRange`
  | `lessDamageOnEquipmentUse`
  | `boostBrake`
  | `boostMaxStamina`
interface CrewPassiveData {
  id: CrewPassiveId
  intensity?: number
  displayName?: string
  until?: number
  description?: (data: CrewPassiveData) => string
  buyable?: {
    rarity: number
    basePrice: Price
    scaledCrewCosmeticCurrency: {
      fromLevel: number
      amount: number
    }
    baseIntensity: number
    wholeNumbersOnly: boolean
  }
  data?: {
    source?:
      | {
          planetName?: string
          speciesId?: SpeciesId
          chassisId?: ChassisId
          crewActivePlusCrewId?: string
          item?: {
            type: ItemType
            id: ItemId
          }
        }
      | `secondWind`
      | `permanent`
    type?: ItemType
    skill?: SkillId
    distance?: number
  }
}

type CrewActiveId =
  | `instantStamina`
  | `cargoSweep`
  | `boostShipSightRange`
interface CrewActive {
  id: CrewActiveId
  lastUsed: number
  intensity: number
}
interface CrewActiveData {
  id: CrewActiveId
  displayName: string
  description: (a: CrewActive) => string
  cooldown: number
  duration?: number
  notify?: boolean
}

interface BaseSpeciesData {
  icon: string
  id: SpeciesId
  aiOnly?: true
  singular: string
  description: string
  passives: CrewPassiveData[]
}

type AISpeciesId =
  | `eagles`
  | `seagulls`
  | `chickens`
  | `flamingos`
  | `vultures`

type HumanSpeciesId =
  | `octopi`
  | `lobsters`
  | `crabs`
  | `sea turtles`
  | `sharks`
  | `dolphins`
  | `snails`
  | `whales`
  | `angelfish`
  | `blowfish`
  | `shrimp`
type SpeciesId = AISpeciesId | HumanSpeciesId

interface CrewBackground {
  id: string
  url: `${string}.${`svg` | `webp` | `png` | `jpg`}`
}
interface CrewCosmetic {
  tagline?: string
  background?: CrewBackground
}
