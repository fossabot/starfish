const maritimeEmojis = [
  `🐙`,
  `🦑`,
  `🐟`,
  `🐠`,
  `🦀`,
  `🐬`,
  `🦞`,
  `🦪`,
  `🦈`,
  `🦭`,
  `🐢`,
  `🐋`,
  `🦐`,
  `🐡`,
]

const species: { [key in SpeciesKey]: BaseSpeciesData } = {
  octopi: {
    icon: `🐙`,
    factionId: `green`,
    id: `octopi`,
    singular: `octopus`,
  },
  squids: {
    icon: `🦑`,
    factionId: `green`,
    id: `squids`,
    singular: `squid`,
  },
  lobsters: {
    icon: `🦞`,
    factionId: `green`,
    id: `lobsters`,
    singular: `lobster`,
  },
  crabs: {
    icon: `🦀`,
    factionId: `green`,
    id: `crabs`,
    singular: `crab`,
  },
  seals: {
    icon: `🦭`,
    factionId: `blue`,
    id: `seals`,
    singular: `seal`,
  },
  'sea turtles': {
    icon: `🐢`,
    factionId: `blue`,
    id: `sea turtles`,
    singular: `sea turtle`,
  },
  dolphins: {
    icon: `🦈`,
    factionId: `blue`,
    id: `dolphins`,
    singular: `dolphin`,
  },
  whales: {
    icon: `🐋`,
    factionId: `blue`,
    id: `whales`,
    singular: `whale`,
  },
  tuna: {
    icon: `🐟`,
    factionId: `purple`,
    id: `tuna`,
    singular: `tuna`,
  },
  angelfish: {
    icon: `🐠`,
    factionId: `purple`,
    id: `angelfish`,
    singular: `angelfish`,
  },
  blowfish: {
    icon: `🐡`,
    factionId: `purple`,
    id: `blowfish`,
    singular: `blowfish`,
  },
  shrimp: {
    icon: `🦐`,
    factionId: `purple`,
    id: `shrimp`,
    singular: `shrimp`,
  },
  robots: {
    icon: `🤖`,
    factionId: `red`,
    id: `robots`,
    singular: `robot`,
  },
}
export default species