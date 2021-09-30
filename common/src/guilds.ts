import species from './species'
type SpacecrabGuildKey =
  | `fowl`
  | `trader`
  | `hunter`
  | `miner`
  | `explorer`
  | `peacekeeper`
interface SpacecrabBaseGuildData {
  name: string
  id: SpacecrabGuildKey
  color: string
  aiOnly?: undefined | true
  passives: ShipPassiveEffect[]
}

const guilds: {
  [key in SpacecrabGuildKey]: SpacecrabBaseGuildData
} = {
  trader: {
    name: `Traders`,
    id: `trader`,
    color: `#ffd700`,
    passives: [
      {
        id: `boostCargoSpace`,
        intensity: 15,
      },
      {
        id: `boostBroadcastRange`,
        intensity: 0.3,
      },
      {
        id: `boostDamageWithNumberOfFactionMembersWithinDistance`,
        intensity: 0.1,
        data: {
          distance: 0.2,
        },
      },
    ],
  },
  hunter: {
    name: `Hunters`,
    id: `hunter`,
    color: `#ff0000`,
    passives: [
      {
        id: `alwaysSeeTrailColors`,
      },
      {
        id: `boostChassisAgility`,
        intensity: 0.1,
      },
      {
        id: `boostDropAmount`,
        intensity: 0.2,
      },
      {
        id: `boostDamageWhenNoAlliesWithinDistance`,
        intensity: 0.2,
        data: {
          distance: 0.3,
        },
      },
    ],
  },
  miner: {
    name: `Miners`,
    id: `miner`,
    color: `#00ff00`,
    passives: [
      {
        id: `boostMinePayouts`,
        intensity: 0.3,
      },
      {
        id: `boostMineSpeed`,
        intensity: 0.2,
      },
      {
        id: `boostCargoSpace`,
        intensity: 10,
      },
      {
        id: `flatDamageReduction`,
        intensity: 0.3,
      },
    ],
  },
  explorer: {
    name: `Explorers`,
    id: `explorer`,
    color: `#0000ff`,
    passives: [
      {
        id: `boostSightRange`,
        intensity: 0.2,
      },
      {
        id: `boostCockpitChargeSpeed`,
        intensity: 0.1,
      },
      {
        id: `boostXpGain`,
        intensity: 0.08,
      },
      {
        id: `boostScanRange`,
        intensity: 0.2,
      },
    ],
  },
  peacekeeper: {
    name: `Peacekeepers`,
    id: `peacekeeper`,
    color: `#ffff00`,
    passives: [
      {
        id: `scaledDamageReduction`,
        intensity: 0.1,
      },
      {
        id: `boostDamageToItemType`,
        intensity: 0.3,
        data: {
          type: `weapon`,
        },
      },
      {
        id: `autoRepair`,
        intensity: 0.15,
      },
      {
        id: `boostRepairSpeed`,
        intensity: 0.1,
      },
    ],
  },
  fowl: {
    name: `Fowls`,
    id: `fowl`,
    color: `hsl(0, 60%, 50%)`,
    aiOnly: true,
    passives: [],
  },
}

export default guilds
