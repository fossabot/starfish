const species: { [key in SpeciesId]: BaseSpeciesData } = {
  octopi: {
    icon: `🐙`,
    id: `octopi`,
    singular: `octopus`,
    description: `Known for their adaptibility, octopi have a natural advantage when it comes to cognition.`,
    passives: [
      {
        id: `boostXpGain`,
        data: { source: { speciesId: `octopi` } },
        intensity: 0.1,
      },
    ],
  },
  lobsters: {
    icon: `🦞`,
    id: `lobsters`,
    singular: `lobster`,
    description: `Lobsters' speed is no issue when it comes to mining for materials.`,
    passives: [
      {
        id: `boostMineSpeed`,
        data: { source: { speciesId: `lobsters` } },
        intensity: 0.3,
      },
    ],
  },
  crabs: {
    icon: `🦀`,
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
  'sea turtles': {
    icon: `🐢`,
    id: `sea turtles`,
    singular: `sea turtle`,
    description: `Turtles may be slow, but they can keep going, and going, and going...`,
    passives: [
      {
        id: `boostStaminaRegeneration`,
        data: { source: { speciesId: `sea turtles` } },
        intensity: 0.1,
      },
    ],
  },
  sharks: {
    icon: `🦈`,
    id: `sharks`,
    singular: `shark`,
    description: `Sharks do some of their best work solo.`,
    passives: [
      {
        id: `generalImprovementWhenAlone`,
        data: { source: { speciesId: `sharks` } },
        intensity: 0.2,
      },
    ],
  },
  dolphins: {
    icon: `🐬`,
    id: `dolphins`,
    singular: `dolphin`,
    description: `The chattiest of all undersea creatures.`,
    passives: [
      {
        id: `boostBroadcastRange`,
        data: { source: { speciesId: `dolphins` } },
        intensity: 0.1,
      },
    ],
  },
  whales: {
    icon: `🐋`,
    id: `whales`,
    singular: `whale`,
    description: `Whales put their brawn to good use.`,
    passives: [
      {
        id: `cargoSpace`,
        data: { source: { speciesId: `whales` } },
        intensity: 30,
      },
    ],
  },
  angelfish: {
    icon: `🐠`,
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
    id: `blowfish`,
    singular: `blowfish`,
    description: `Tired of pretending to be scary, the blowfish decided to learn their way around a weapons bay.`,
    passives: [
      {
        id: `boostWeaponChargeSpeed`,
        data: { source: { speciesId: `blowfish` } },
      },
    ],
  },
  shrimp: {
    icon: `🦐`,
    id: `shrimp`,
    singular: `shrimp`,
    description: `For something so small, strength lies in numbers.`,
    passives: [
      {
        id: `generalImprovementPerCrewMemberInSameRoom`,
        intensity: 0.02,
        data: {
          source: { speciesId: `shrimp` },
        },
      },
    ],
  },
  eagles: {
    aiOnly: true,
    icon: `🦅`,
    id: `eagles`,
    singular: `eagle`,
    description: ``,
    passives: [],
  },
  seagulls: {
    aiOnly: true,
    icon: `🐦`,
    id: `seagulls`,
    singular: `seagull`,
    description: ``,
    passives: [],
  },
  chickens: {
    aiOnly: true,
    icon: `🐓`,
    id: `chickens`,
    singular: `chicken`,
    description: ``,
    passives: [],
  },
  flamingos: {
    aiOnly: true,
    icon: `🦩`,
    id: `flamingos`,
    singular: `flamingo`,
    description: ``,
    passives: [],
  },
}
export default species
