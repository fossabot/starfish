const guilds: {
  [key in GuildId]: BaseGuildData
} = {
  trader: {
    name: `Traders`,
    id: `trader`,
    color: `hsl(300, 60%, 45%)`,
    passives: [
      {
        id: `broadcastRangeCargoPrices`,
        data: { source: { guildId: `trader` } },
      },
      {
        id: `boostCargoSpace`,
        intensity: 15,
        data: { source: { guildId: `trader` } },
      },
      {
        id: `boostBroadcastRange`,
        intensity: 0.3,
        data: { source: { guildId: `trader` } },
      },
      {
        id: `boostDamageWithNumberOfGuildMembersWithinDistance`,
        intensity: 0.1,
        data: {
          distance: 0.2,
          source: { guildId: `trader` },
        },
      },
      {
        id: `boostRepairSpeed`,
        intensity: -0.1,
        data: { source: { guildId: `trader` } },
      },
    ],
  },
  hunter: {
    name: `Hunters`,
    id: `hunter`,
    color: `hsl(260, 60%,65%)`,
    passives: [
      {
        id: `alwaysSeeTrailColors`,
        data: { source: { guildId: `hunter` } },
      },
      {
        id: `boostChassisAgility`,
        intensity: 0.1,
        data: { source: { guildId: `hunter` } },
      },
      {
        id: `boostDropAmount`,
        intensity: 0.2,
        data: { source: { guildId: `hunter` } },
      },
      {
        id: `boostDamageWhenNoAlliesWithinDistance`,
        intensity: 0.2,
        data: {
          distance: 0.3,
          source: { guildId: `hunter` },
        },
      },
      {
        id: `boostMineSpeed`,
        intensity: -0.15,
        data: { source: { guildId: `hunter` } },
      },
    ],
  },
  miner: {
    name: `Miners`,
    id: `miner`,
    color: `hsl(190, 60%, 50%)`,
    passives: [
      {
        id: `boostMinePayouts`,
        intensity: 0.3,
        data: { source: { guildId: `miner` } },
      },
      {
        id: `boostMineSpeed`,
        intensity: 0.2,
        data: { source: { guildId: `miner` } },
      },
      {
        id: `boostCargoSpace`,
        intensity: 10,
        data: { source: { guildId: `miner` } },
      },
      {
        id: `flatDamageReduction`,
        intensity: 0.2,
        data: { source: { guildId: `miner` } },
      },
      {
        id: `boostChassisAgility`,
        intensity: -0.1,
        data: { source: { guildId: `miner` } },
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
        intensity: 0.3,
        data: { source: { guildId: `explorer` } },
      },
      {
        id: `boostScanRange`,
        intensity: 0.2,
        data: { source: { guildId: `explorer` } },
      },
      {
        id: `boostThrust`,
        intensity: 0.1,
        data: { source: { guildId: `explorer` } },
      },
      {
        id: `boostXpGain`,
        intensity: 0.08,
        data: { source: { guildId: `explorer` } },
      },
    ],
  },
  peacekeeper: {
    name: `Peacekeepers`,
    id: `peacekeeper`,
    color: `hsl(40, 60%, 50%)`,
    passives: [
      {
        id: `boostDamageToItemType`,
        intensity: 0.5,
        data: {
          type: `weapon`,
          source: { guildId: `peacekeeper` },
        },
      },
      {
        id: `boostDamageToItemType`,
        intensity: -0.3,
        data: {
          type: `engine`,
          source: { guildId: `peacekeeper` },
        },
      },
      {
        id: `scaledDamageReduction`,
        intensity: 0.1,
        data: { source: { guildId: `peacekeeper` } },
      },
      {
        id: `autoRepair`,
        intensity: 0.15,
        data: { source: { guildId: `peacekeeper` } },
      },
      {
        id: `boostRepairSpeed`,
        intensity: 0.1,
        data: { source: { guildId: `peacekeeper` } },
      },
    ],
  },
  fowl: {
    name: `Fowls`,
    id: `fowl`,
    color: `hsl(0, 75%, 60%)`,
    aiOnly: true,
    passives: [],
  },
}

export default guilds
