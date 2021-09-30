const guilds: {
  [key in GuildId]: BaseGuildData
} = {
  trader: {
    name: `Traders`,
    id: `trader`,
    color: `hsl(250, 60%, 50%)`,
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
        id: `boostDamageWithNumberOfGuildMembersWithinDistance`,
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
    color: `hsl(200, 60%, 50%)`,
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
    color: `hsl(150, 60%, 50%)`,
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
    color: `hsl(100, 60%, 50%)`,
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
    color: `hsl(50, 60%, 50%)`,
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
    color: `hsl(0, 60%, 70%)`,
    aiOnly: true,
    passives: [],
  },
}

export default guilds
