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

  const name = `${c.capitalize(
    species.singular,
  )} ${c.capitalize(c.randomFromArray(possibleAINames))}`

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
  `Fred`,
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
  `Ted`,
  `Vince`,
  `Wally`,
  `Xander`,
  `Yogi`,
  `Zach`,
  `Annie`,
  `Cindy`,
  `Chloe`,
  `Dixie`,
  `Ella`,
  `Fay`,
  `Gabby`,
  `Hana`,
  `Ida`,
  `Jenny`,
  `Kitty`,
  `Lena`,
  `Meg`,
  `Nelly`,
  `Opal`,
  `Peg`,
  `Rita`,
  `Sue`,
  `Tess`,
  `Una`,
  `Vera`,
  `Wendy`,
  `Xena`,
  `Yetta`,
  `Zula`,
  `OLIVER`,
  `WILLOW`,
  `DECLAN`,
  `AURORA`,
  `EZRA`,
  `VIOLET`,
  `ROWAN`,
  `HAZEL`,
  `JAMES`,
  `SILAS`,
  `LUNA`,
  `QUINN`,
  `LIAM`,
  `AMELIA`,
  `LOGAN`,
  `ASHER`,
  `ARIA`,
  `KAI`,
  `FINN`,
  `AVA`,
  `RIVER`,
  `OWEN`,
  `AVERY`,
  `ETHAN`,
  `ISLA`,
  `LUCA`,
  `IVY`,
  `SAGE`,
  `FELIX`,
  `FREYA`,
  `HARPER`,
  `HENRY`,
  `NORA`,
  `EDEN`,
  `WREN`,
  `RILEY`,
  `ELIJAH`,
  `EVELYN`,
  `ARTEMIS`,
  `LEO`,
  `OLIVIA`,
  `JADE`,
  `NOAH`,
  `AUDREY`,
  `JULIAN`,
  `AUGUST`,
  `IRIS`,
  `FINLEY`,
  `LEVI`,
  `ELEANOR`,
  `DARCY`,
  `ABIGAIL`,
  `BRIAR`,
]
