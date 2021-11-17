import c from '../../../../../../common/dist'
import type { Game } from '../../../Game'

export default function generateBasicAI(
  game: Game,
): BaseAIShipData {
  let radius = game.gameSoftRadius
  let spawnPoint: CoordinatePair | undefined
  while (!spawnPoint) {
    let point = c.randomInsideCircle(radius)
    // c.log(point)
    const tooClose = game.ships.find((hs) =>
      c.pointIsInsideCircle(point, hs.location, 0.2),
    )
    if (tooClose) spawnPoint = undefined
    else spawnPoint = point
    radius += 0.001
  }

  const isInSafeZone =
    c.distance([0, 0], spawnPoint) <
    game.settings.safeZoneRadius
  const level =
    c.distance([0, 0], spawnPoint) *
      2 *
      Number(isInSafeZone ? 0.5 : 1) +
    1

  const species = c.randomFromArray(
    Object.values(c.species).filter((s) => s.aiOnly),
  ) as BaseSpeciesData

  const name = `${c.randomFromArray(
    possibleAINames,
  )} the ${c.capitalize(species.singular)}`

  return {
    location: spawnPoint,
    name,
    guildId: `fowl`,
    speciesId: species.id,
    level,
  }
}

const possibleAINames = [
  `Alfred`,
  `Bert`,
  `Cecil`,
  `Dennis`,
  `Eddie`,
  `Freddie`,
  `Gus`,
  `Hank`,
  `Ike`,
  `Jack`,
  `Jasper`,
  `Kenny`,
  `Lenny`,
  `Lenny`,
  `Manny`,
  `Ned`,
  `Oscar`,
  `Pete`,
  `Quincy`,
  `Randy`,
  `Sid`,
  `Teddy`,
  `Ulysses`,
  `Vincent`,
  `Wally`,
  `Xander`,
  `Yogi`,
  `Zach`,
  `Annie`,
  `Bessie`,
  `Cindy`,
  `Chloe`,
  `Dixie`,
  `Ella`,
  `Fay`,
  `Gabby`,
  `Hannah`,
  `Ida`,
  `Jenny`,
  `Kitty`,
  `Lena`,
  `Maggie`,
  `Nellie`,
  `Opal`,
  `Peg`,
  `Queenie`,
  `Rita`,
  `Sue`,
  `Tess`,
  `Una`,
  `Vera`,
  `Wendy`,
  `Xena`,
  `Yetta`,
  `Zula`,
]
