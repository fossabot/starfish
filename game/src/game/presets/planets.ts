import c from '../../../../common/dist'
import type { Planet } from '../classes/Planet/Planet'
import type { Game } from '../Game'
import type { Ship } from '../classes/Ship/Ship'
import type { Zone } from '../classes/Zone'

function getName(game?: Game) {
  let name: string | undefined
  const possibleNames = [...planetNames]
  while (!name) {
    if (Math.random() > 0.9) {
      const useSuffix = Math.random() > 0.2
      name = `${
        !useSuffix ? `${c.randomFromArray(planetNamePrefixes)} ` : ``
      }${c.randomFromArray(possibleNames)}${
        useSuffix ? `${c.randomFromArray(planetNameSuffixes)}` : ``
      }`
    } else name = c.randomFromArray(possibleNames)

    if (game?.planets.find((p) => p.name === name)) {
      name = undefined
    }
  }

  return name
}

function getLocation(game?: Game, isHomeworld?: any) {
  let locationSearchRadius = isHomeworld
    ? game?.settings.safeZoneRadius || 1
    : (game?.gameSoftRadius || 1) * 0.75
  let tooClose = 0.2
  let location: CoordinatePair = [0, 0]

  const isTooClose = (p: Planet | Ship | Zone) =>
    c.distance(location, p.location) <
    tooClose + (p.type === `zone` ? p.radius : 0)
  const getClosestPlanet = (closest: Planet, p: Planet) =>
    c.distance(p.location, location) <
    c.distance(closest?.location || [0, 0], location)
      ? p
      : closest
  const tooManyPlanetsInVicinity = () =>
    (game?.planets.reduce(
      (count: number, p: Planet): number =>
        c.distance(p.location, location) > 1 ? count : count + 1,
      0,
    ) || 0) >
    Math.floor(Math.random() * 3) + 1

  while (
    game?.planets.find(isTooClose) ||
    game?.humanShips.find(isTooClose) ||
    game?.zones.find(isTooClose) ||
    tooManyPlanetsInVicinity() ||
    (isHomeworld &&
      c.distance(location, [0, 0]) >
        (game?.settings.safeZoneRadius || Infinity))
  ) {
    location = c.randomInsideCircle(locationSearchRadius)

    // move planets closer to each other to generate clusters
    const closestPlanet = game?.planets.reduce(
      getClosestPlanet,
      game.planets[0],
    )
    if (closestPlanet) {
      const distance = c.distance(location, closestPlanet.location)
      if (distance < 1) {
        const vectorTowardsClosestPlanet =
          c.getUnitVectorFromThatBodyToThisBody({ location }, closestPlanet)

        const magnitude = distance * 0.6 * (isHomeworld ? -1 : 1) // spawn homeworlds as "seeds" so they land farther away from other possible homeworlds
        location[0] -= vectorTowardsClosestPlanet[0] * magnitude
        location[1] -= vectorTowardsClosestPlanet[1] * magnitude
      }
    }

    if (!isHomeworld) locationSearchRadius *= 1.01
    else tooClose *= 0.999
    // if (isHomeworld) c.log(isHomeworld, location)
    // c.log(
    //   `searching...`,
    //   location,
    //   Boolean(game?.planets.find(isTooClose)),
    //   Boolean(game?.humanShips.find(isTooClose)),
    //   Boolean(game?.zones.find(isTooClose)),
    //   Boolean(tooManyPlanetsInVicinity()),
    //   isHomeworld &&
    //     c.distance(location, [0, 0]) >
    //       (game?.settings.safeZoneRadius || Infinity),
    // )
  }
  return location
}

export function generateMiningPlanet(game: Game): BaseMiningPlanetData | false {
  const name = getName(game)
  if (!name) return false
  const location = getLocation(game)
  const level = 0
  const baseLevel = 1
  const xp = 0

  const color = `hsl(${Math.round(Math.random() * 360)}, ${Math.round(
    Math.random() * 40,
  )}%, ${Math.round(Math.random() * 50) + 30}%)`

  const radius = Math.floor(Math.random() * 60000 + 10000)
  const mass = ((4e30 * radius) / 36000) * (1 + 0.2 * (Math.random() - 0.5))

  const creatures: string[] = []
  while (Math.random() > 0.7) {
    const viableCreatures = [...seaCreatures, ...landCreatures]
    const chosen = c.randomFromArray(viableCreatures)
    if (!creatures.find((cre) => cre === chosen.name))
      creatures.push(chosen.name)
  }

  return {
    planetType: `mining`,
    pacifist: false,
    id: `planet` + `${Math.random()}`.slice(2),
    name,
    location,
    color,
    level,
    baseLevel,
    xp,
    creatures,
    radius,
    mass,
    landingRadiusMultiplier: 1,
  }
}

export function generateBasicPlanet(
  game: Game,
  homeworldGuildKey?: GuildId,
): BaseBasicPlanetData | false {
  const planetType: PlanetType = `basic`
  const name = getName(game)
  if (!name) return false
  const location = getLocation(game, homeworldGuildKey)

  const radius = Math.floor(Math.random() * 60000 + 10000)
  const mass = ((5.974e30 * radius) / 36000) * (1 + 0.2 * (Math.random() - 0.5))

  let guildId: GuildId | undefined
  if (homeworldGuildKey) guildId = homeworldGuildKey
  // else {
  //   if (Math.random() > 0.6)
  //     guildId = c.randomFromArray(
  //       Object.keys(c.guilds),
  //     ) as GuildId
  //   if (guildId === `fowl`) guildId = undefined
  // }

  let color
  if (guildId) color = c.guilds[guildId].color
  else {
    let hue = Math.random() * 360

    // don't let color be too close to a guild color
    while (
      Object.values(c.guilds).find((f) => {
        let guildHue: any = /hsl\(([^,]*),.*/g.exec(f.color)?.[1],
          potentialHue = hue
        try {
          guildHue = parseInt(`${guildHue}`)
        } catch (e) {
          c.log(e)
          return false
        }
        if (isNaN(guildHue)) {
          c.log(`Failed to get guild hue from`, f.color)
          return false
        }
        if (guildHue > 180) guildHue -= 360
        if (potentialHue > 180) potentialHue -= 360
        if (Math.abs(guildHue - potentialHue) < 15) return true
        return false
      })
    ) {
      hue = Math.random() * 360
    }

    color = `hsl(${Math.round(hue)}, ${Math.round(Math.random() * 30 + 70)}%, ${
      Math.round(Math.random() * 40) + 50
    }%)`
  }

  const level = 0
  const baseLevel = homeworldGuildKey
    ? c.defaultHomeworldLevel
    : Math.ceil(Math.random() * 5 + c.distance(location, [0, 0]) / 3)
  const xp = 0

  const leanings: PlanetLeaning[] = []
  // homeworlds always CAN have cargo and defense, and lean slightly that way
  if (homeworldGuildKey) {
    leanings.push({
      type: `cargo`,
      never: false,
      propensity: Math.random() * 2 + 1,
    })
    leanings.push({
      type: `defense`,
      never: false,
      propensity: Math.random() * 2 + 1,
    })
  }
  while (leanings.length < 5 || Math.random() > 0.4) {
    const leaningTypes: PlanetLeaningType[] = [
      `items`,
      `weapon`,
      `armor`,
      `scanner`,
      `communicator`,
      `engine`,
      `chassis`,
      `shipPassives`,
      `crewPassives`,
      `cosmetics`,
      `cargo`,
      `repair`,
      `defense`,
    ]
    const leaningType = c.randomFromArray(leaningTypes)
    if (leanings.find((l) => l.type === leaningType)) continue
    const never = c.coinFlip()
    leanings.push({
      type: leaningType,
      never,
      propensity: never ? 0 : Math.random() * 2,
    })
  }
  // if (homeworldGuildKey) c.log(leanings)

  const vendor: PlanetVendor = {
    cargo: [],
    passives: [],
    items: [],
    chassis: [],
    shipCosmetics: [],
    crewCosmetics: [],
  }

  const creatures: string[] = []
  while (creatures.length === 0 || Math.random() > 0.5) {
    const chosen = c.randomFromArray([...seaCreatures, ...landCreatures])
    if (!creatures.find((cre) => cre === chosen.name))
      creatures.push(chosen.name)
  }

  const pacifist = homeworldGuildKey ? true : Math.random() > 0.2

  return {
    planetType,
    id: `planet` + `${Math.random()}`.slice(2),
    name,
    color,
    creatures,
    mass,
    landingRadiusMultiplier: 1,
    allegiances: [],
    pacifist,
    guildId,
    radius,
    location,
    vendor,
    bank: false,
    defense: 0,
    level,
    baseLevel,
    xp,
    leanings,
  }
}

function getBuyAndSellMultipliers(item: boolean = false) {
  const buyMultiplier = c.r2(0.8 + Math.random() * 0.4, 3)
  const sellMultiplier =
    Math.min(
      buyMultiplier * c.guildVendorMultiplier * c.guildVendorMultiplier,
      c.r2(buyMultiplier * (Math.random() * 0.2) + 0.8, 3),
    ) * (item ? 0.4 : 1)
  return { buyMultiplier, sellMultiplier }
}

const planetNames = new Set([
  `Osiris`,
  `Neptune`,
  `Cancer`,
  `Lapis`,
  `Lazuli`,
  `Senara`,
  `Pethea`,
  `Mara`,
  `Trinda`,
  `Raitis`,
  `Chanus`,
  `Siunia`,
  `Bion`,
  `Zonoe`,
  `Zeon`,
  `Lyria`,
  `Churia`,
  `Ozuno`,
  `Deron`,
  `Melion`,
  `Norix`,
  `Aqua`,
  `Solio`,
  `Kogars`,
  `Yaria`,
  `Bolla`,
  `Io`,
  `Artemis`,
  `Hera`,
  `Exodus`,
  `Bonia`,
  `Phides`,
  `Auster`,
  `Sirius`,
  `Alpha`,
  `Omega`,
  `Kappa`,
  `Zeta`,
  `Delta`,
  `Cronus`,
  `Adonis`,
  `Lethe`,
  `Circe`,
  `Thrace`,
  `Pluto`,
  `Achilles`,
  `Hermes`,
  `Zenra`,
  `Cualla`,
  `Vakury`,
  `Cioros`,
  `Ibitas`,
  `Deland`,
  `Kenara`,
  `Daeko`,
  `Artan`,
  `Ceti`,
  `Talaran`,
  `Deepsea`,
  `Mist`,
  `Mire`,
  `Wave`,
  `Aran`,
  `Woaka`,
  `Shalos`,
  `Hon'an`,
  `Maztes`,
  `Meron`,
  `Bevis`,
  `Sotara`,
  `Tza`,
  `Uromi`,
  `Oblas`,
  `Wunan`,
  `S'vas`,
  `Loth`,
  `Mora`,
  `Tavda`,
  `Kepes`,
  `Boon`,
  `Oxtus`,
  `Cortus`,
  `Ca'us`,
  `Sonor`,
  `Ae'o`,
  `K'arth`,
  `Pluthra`,
  `Sotix`,
  `Taleos`,
  `Cynia`,
  `Konar`,
  `C'lax`,
  `Arcton`,
  `Arara`,
  `Ruza`,
  `Tesa`,
  `Onatov`,
  `Eneon`,
  `Hazuno`,
  `Drilia`,
  `Rurn`,
  `Iris`,
  `Zexa`,
  `Nocilia`,
  `Mauti`,
  `Scorpii`,
  `Vorcia`,
  `Cheme`,
  `Dorni`,
  `Alorn`,
  `Endiku`,
  `Upyr`,
  `Europa`,
  `Olympus`,
  `Irra`,
  `Ungol`,
  `Gura`,
  `Drir`,
  `Maw`,
  `Ji`,
  `Ashii`,
  `Ki`,
  `Phir`,
  `Zol`,
  `Tide`,
  `Gulf`,
  `Shore`,
  `Oceana`,
  `Knot`,
  `Mast`,
  `Stern`,
  `Bow`,
  `Keel`,
  `Ronan`,
  `Lilt`,
  `Teizli`,
  `Lalgra`,
  `Illeas`,
  `Vircea`,
  `Ghendra`,
  `Daammud`,
  `Dhumeal`,
  `Sendar`,
  `Morill`,
  `Galvae`,
  `Stela`,
  `Minato`,
  `Umi`,
  `Kawa`,
  `Geos`,
  `Honrax`,
  `Amus`,
  `Ovlos`,
  `Loenia`,
  `Deian`,

  // todo MORE
])
const planetNamePrefixes = [`Moon of`, `New`, `Old`]
const planetNameSuffixes = [
  ` Prime`,
  ` Beta`,
  ` II`,
  ` III`,
  ` IV`,
  ` V`,
  ` VI`,
  ` VII`,
  ` Base`,
  `'s Landing`,
  `'s World`,
]

const seaCreatures: {
  name: string
}[] = [
  { name: `crabs` },
  { name: `oysters` },
  { name: `clams` },
  { name: `abalones` },
  { name: `barnacles` },
  { name: `octopi` },
  { name: `squids` },
  { name: `lobsters` },
  { name: `anemones` },
  { name: `jellyfish` },
  { name: `urchins` },

  { name: `sharks` },
  { name: `seahorses` },
  { name: `starfish` },
  { name: `anglerfish` },
  { name: `eels` },
  { name: `shrimp` },
  { name: `corals` },
  { name: `narwhals` },
  { name: `cod` },
  { name: `mackerel` },
  { name: `tuna` },
  { name: `marlin` },
  { name: `swordfish` },
  { name: `angelfish` },
  { name: `clownfish` },

  { name: `walruses` },
  { name: `whales` },
  { name: `orcas` },
  { name: `seals` },
  { name: `blowfish` },
  { name: `narwhals` },
  { name: `dolphins` },
  { name: `sea otters` },
  { name: `sea turtles` },
  { name: `sea lions` },
]

const landCreatures: {
  name: string
}[] = [
  { name: `penguins` },
  { name: `seagulls` },
  { name: `pelicans` },
  { name: `parrots` },
  { name: `pigeons` },
  { name: `crows` },
  { name: `owls` },
  { name: `hawks` },
  { name: `ravens` },
  { name: `eagles` },
  { name: `falcons` },
  { name: `wolves` },
  { name: `foxes` },
  { name: `coyotes` },
  { name: `raccoons` },
  { name: `bears` },
  { name: `lions` },
  { name: `tigers` },
  { name: `brown bears` },
  { name: `black bears` },
  { name: `buffalos` },
  { name: `ants` },
  { name: `bees` },
  { name: `butterflies` },
  { name: `crickets` },
  { name: `caterpillars` },
  { name: `cicadas` },
  { name: `cockroaches` },
  { name: `spiders` },
  { name: `grasshoppers` },
  { name: `moths` },
  { name: `mice` },
  { name: `snakes` },
  { name: `snails` },
  { name: `slugs` },
  { name: `toads` },
  { name: `turtles` },
  { name: `pigs` },
  { name: `sheep` },
  { name: `chickens` },
  { name: `goats` },
  { name: `cows` },
  { name: `horses` },
  { name: `donkeys` },
  { name: `ponies` },
  { name: `rabbits` },
]
