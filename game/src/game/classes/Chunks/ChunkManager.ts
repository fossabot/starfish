import c from '../../../../../common/dist'
import type { AttackRemnant } from '../AttackRemnant'
import type { Cache } from '../Cache'
import type { Planet } from '../Planet/Planet'
import type { Zone } from '../Zone'
import type { Ship } from '../Ship/Ship'
import { Chunk } from './Chunk'
import { log } from 'console'

type HasUsableLocation = (
  | { location: CoordinatePair }
  | { start: CoordinatePair; end: CoordinatePair }
) & { radius?: number }

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
  readonly chunkSize = 0.35
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
    const elements: Set<any> = new Set()
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
        for (let el of this.chunks[x]?.[y]?.elements || [])
          elements.add(el)
      }
    }
    const finalElements = Array.from(elements).filter(
      (el) =>
        isInRadius(
          el,
          location,
          radius +
            (((el.radius || 0) < this.chunkSize * 100
              ? el.radius
              : 0) || 0),
        ),
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

  remove(
    element: HasUsableLocation,
    previousLocation?: CoordinatePair,
  ) {
    const location = previousLocation
      ? getLocation({ location: previousLocation })
      : getLocation(element)
    const radius =
      ((element.radius || 0) < this.chunkSize * 100
        ? element.radius
        : 0) || 0
    const chunkX = Math.floor(location[0] / this.chunkSize)
    const chunkY = Math.floor(location[1] / this.chunkSize)
    const radiusInChunks = Math.ceil(
      radius / this.chunkSize,
    )

    if (radiusInChunks === 0) {
      ;(
        this.chunks[chunkX]?.[chunkY] as Chunk | undefined
      )?.remove(element)
      return
    }

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
        ;(this.chunks[x]?.[y] as Chunk | undefined)?.remove(
          element,
        )
      }
    }
  }

  addOrUpdate(
    element: HasUsableLocation,
    previousLocation?: CoordinatePair,
    previousRadius?: number,
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

    // didn't move chunks, we're done
    if (
      previousChunkX === destinationChunkX &&
      previousChunkY === destinationChunkY &&
      previousRadius === element.radius
    )
      return

    // remove from previous chunk/s
    if (previousLocation)
      this.remove(element, previousLocation)

    const radius =
      ((element.radius || 0) < this.chunkSize * 100
        ? element.radius
        : 0) || 0
    const radiusInChunks = Math.ceil(
      radius / this.chunkSize,
    )

    // add to all chunks it touches

    // no radius case
    if (radiusInChunks === 0) {
      // new row
      if (!this.chunks[destinationChunkX]) {
        this.chunks[destinationChunkX] = []
      }
      // new chunk
      if (
        !this.chunks[destinationChunkX][destinationChunkY]
      ) {
        this.chunks[destinationChunkX][destinationChunkY] =
          new Chunk({
            width: this.chunkSize,
            x: destinationChunkX,
            y: destinationChunkY,
          })
      }
      // add
      this.chunks[destinationChunkX][destinationChunkY].add(
        element,
      )
      return
    }

    // radius case
    for (
      let x = destinationChunkX - radiusInChunks;
      x <= destinationChunkX + radiusInChunks;
      x++
    ) {
      // add to chunk/s
      // new row
      if (!this.chunks[x]) {
        this.chunks[x] = []
      }
      for (
        let y = destinationChunkY - radiusInChunks;
        y <= destinationChunkY + radiusInChunks;
        y++
      ) {
        // new chunk
        if (!this.chunks[x][y]) {
          this.chunks[x][y] = new Chunk({
            width: this.chunkSize,
            x: x,
            y: y,
          })
        }
        // add
        this.chunks[x][y].add(element)
      }
    }
  }
}
