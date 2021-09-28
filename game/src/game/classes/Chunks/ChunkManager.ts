import c from '../../../../../common/dist'
import type { AttackRemnant } from '../AttackRemnant'
import type { Cache } from '../Cache'
import type { Planet } from '../Planet/Planet'
import type { Zone } from '../Zone'
import type { Ship } from '../Ship/Ship'
import { Chunk } from './Chunk'

type HasUsableLocation =
  | { location: CoordinatePair }
  | { start: CoordinatePair; end: CoordinatePair }

function isInRadius(
  el: HasUsableLocation,
  center: CoordinatePair,
  radius: number,
): boolean {
  return c.pointIsInsideCircle(
    center,
    getLocation(el),
    radius,
  )
}

function getLocation(
  el: HasUsableLocation,
): CoordinatePair {
  return `location` in el
    ? el.location
    : ([
        (el.start[0] + el.end[0]) / 2,
        (el.start[1] + el.end[1]) / 2,
      ] as CoordinatePair)
}

export class ChunkManager {
  readonly chunkSize = 0.25
  readonly chunks: Chunk[][] = []

  getElementsWithinRadius(
    location: CoordinatePair,
    radius: number,
  ): (Ship | AttackRemnant | Cache | Planet | Zone)[] {
    const chunkX = Math.floor(location[0] / this.chunkSize)
    const chunkY = Math.floor(location[1] / this.chunkSize)
    const radiusInChunks = Math.ceil(
      radius / this.chunkSize,
    )
    const elements: any[] = []
    for (
      let x = chunkX - radiusInChunks;
      x <= chunkX + radiusInChunks;
      x++
    ) {
      for (
        let y = chunkY - radiusInChunks;
        y <= chunkY + radiusInChunks;
        y++
      ) {
        elements.push(
          ...(this.chunks[x]?.[y]?.elements || []),
        )
      }
    }
    const finalElements = elements.filter((el) =>
      isInRadius(el, location, radius),
    )
    // if (Math.random() > 0.999)
    //   c.log(
    //     `considered`,
    //     elements.length,
    //     `elements, ended up with`,
    //     finalElements.length,
    //   )
    return finalElements
  }

  remove(element: HasUsableLocation) {
    const location = getLocation(element)
    const chunkX = Math.floor(location[0] / this.chunkSize)
    const chunkY = Math.floor(location[1] / this.chunkSize)
    ;(
      this.chunks[chunkX]?.[chunkY] as Chunk | undefined
    )?.remove(element)
  }

  addOrUpdate(
    element: HasUsableLocation,
    previousLocation?: CoordinatePair,
  ) {
    let previousChunkX, previousChunkY
    if (previousLocation) {
      previousChunkX = Math.floor(
        previousLocation[0] / this.chunkSize,
      )
      previousChunkY = Math.floor(
        previousLocation[1] / this.chunkSize,
      )
    }

    const location = getLocation(element)

    const destinationChunkX = Math.floor(
      location[0] / this.chunkSize,
    )
    const destinationChunkY = Math.floor(
      location[1] / this.chunkSize,
    )

    if (
      previousChunkX === destinationChunkX &&
      previousChunkY === destinationChunkY
    )
      return // remove from previous chunk
    ;(
      this.chunks[previousChunkX]?.[previousChunkY] as
        | Chunk
        | undefined
    )?.remove(element)

    // add to new chunk

    if (!this.chunks[destinationChunkX]) {
      // c.log(
      //   `creating new chunk row at ${destinationChunkX}`,
      // )
      this.chunks[destinationChunkX] = []
    }
    if (
      !this.chunks[destinationChunkX][destinationChunkY]
    ) {
      // c.log(
      //   `creating new chunk at`,
      //   destinationChunkX,
      //   destinationChunkY,
      // )
      this.chunks[destinationChunkX][destinationChunkY] =
        new Chunk({
          width: this.chunkSize,
          x: destinationChunkX,
          y: destinationChunkY,
        })
    }

    const destinationChunk =
      this.chunks[destinationChunkX][destinationChunkY]

    destinationChunk.add(element)
  }
}
