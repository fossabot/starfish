const species: { [key in SpeciesKey]: BaseSpeciesData } = {
  octopi: {
    icon: `🐙`,
    factionId: `green`,
    id: `octopi`,
    singular: `octopus`,
    description: `Known for their adaptibility, octopi have learned to make the most of any scap of resources they find in space.`,
    passives: [
      {
        id: `boostDropAmount`,
        data: { source: { speciesId: `octopi` } },
        intensity: 0.3,
      },
    ],
  },
  squids: {
    icon: `🦑`,
    factionId: `green`,
    id: `squids`,
    singular: `squid`,
    description: `Tentacles are useful for grappling enemies, stifling their mobility.`,
    passives: [
      {
        id: `boostDamageToItemType`,
        intensity: 0.3,
        data: {
          source: { speciesId: `squids` },
          type: `engine`,
        },
      },
    ],
  },
  lobsters: {
    icon: `🦞`,
    factionId: `green`,
    id: `lobsters`,
    singular: `lobster`,
    description: `The antennae on lobsters' ships are attuned to pick up the slightest variance in electromagnetic energy.`,
    passives: [
      {
        id: `boostScanRange`,
        data: { source: { speciesId: `lobsters` } },
        intensity: 0.3,
      },
    ],
  },
  crabs: {
    icon: `🦀`,
    factionId: `green`,
    id: `crabs`,
    singular: `crab`,
    description: `Unbuffeted by the pounding of tides, crabs can gain traction anywhere.`,
    passives: [
      {
        id: `boostBrake`,
        data: { source: { speciesId: `crabs` } },
        intensity: 2,
      },
    ],
  },
  seals: {
    icon: `🦭`,
    factionId: `blue`,
    id: `seals`,
    singular: `seal`,
    description: `Nimble at manipulating anything from tools to toys.`,
    passives: [
      {
        id: `boostRepairSpeed`,
        data: { source: { speciesId: `seals` } },
        intensity: 0.25,
      },
    ],
  },
  'sea turtles': {
    icon: `🐢`,
    factionId: `blue`,
    id: `sea turtles`,
    singular: `sea turtle`,
    description: `Naturally armored, sea turtles' ships can take a bigger beating.`,
    passives: [
      {
        id: `scaledDamageReduction`,
        data: { source: { speciesId: `sea turtles` } },
        intensity: 0.1,
      },
    ],
  },
  dolphins: {
    icon: `🦈`,
    factionId: `blue`,
    id: `dolphins`,
    singular: `dolphin`,
    description: `By far the most intelligent creature in the cosmos.`,
    passives: [
      {
        id: `boostXpGain`,
        data: { source: { speciesId: `dolphins` } },
        intensity: 0.1,
      },
    ],
  },
  whales: {
    icon: `🐋`,
    factionId: `blue`,
    id: `whales`,
    singular: `whale`,
    description: `Whales support an ecosystem of smaller animals around them. Their ships, similarly, can support a broader ecosystem of items.`,
    passives: [
      {
        id: `extraEquipmentSlots`,
        data: { source: { speciesId: `whales` } },
        intensity: 1,
      },
    ],
  },
  tuna: {
    icon: `🐟`,
    factionId: `purple`,
    id: `tuna`,
    singular: `tuna`,
    description: `Schooling characteristics make the tuna a naturally evasive species.`,
    passives: [
      {
        id: `boostChassisAgility`,
        data: { source: { speciesId: `tuna` } },
        intensity: 0.1,
      },
    ],
  },
  angelfish: {
    icon: `🐠`,
    factionId: `purple`,
    id: `angelfish`,
    singular: `angelfish`,
    description: `Just like their namesake, angelfish are natural-born fliers.`,
    passives: [
      {
        id: `boostCockpitChargeSpeed`,
        data: { source: { speciesId: `angelfish` } },
        intensity: 0.15,
      },
    ],
  },
  blowfish: {
    icon: `🐡`,
    factionId: `purple`,
    id: `blowfish`,
    singular: `blowfish`,
    description: `The true size of a blowfish is forever unclear.`,
    passives: [
      {
        id: `disguiseChassisType`,
        data: { source: { speciesId: `blowfish` } },
      },
      {
        id: `disguiseCrewMemberCount`,
        data: { source: { speciesId: `blowfish` } },
      },
    ],
  },
  shrimp: {
    icon: `🦐`,
    factionId: `purple`,
    id: `shrimp`,
    singular: `shrimp`,
    description: `For something so small, strength lies in numbers.`,
    passives: [
      {
        id: `boostDamageWithNumberOfFactionMembersWithinDistance`,
        intensity: 0.1,
        data: {
          source: { speciesId: `shrimp` },
          distance: 0.3,
        },
      },
    ],
  },
  eagles: {
    icon: `🦅`,
    factionId: `red`,
    id: `eagles`,
    singular: `eagle`,
    description: ``,
    passives: [],
  },
  seagulls: {
    icon: `🐦`,
    factionId: `red`,
    id: `seagulls`,
    singular: `seagull`,
    description: ``,
    passives: [],
  },
  chickens: {
    icon: `🐓`,
    factionId: `red`,
    id: `chickens`,
    singular: `chicken`,
    description: ``,
    passives: [],
  },
  flamingos: {
    icon: `🦩`,
    factionId: `red`,
    id: `flamingos`,
    singular: `flamingo`,
    description: ``,
    passives: [],
  },
}
export default species
