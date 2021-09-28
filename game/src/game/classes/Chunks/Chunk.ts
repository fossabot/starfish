import c from '../../../../../common/dist'

export class Chunk {
  readonly x: number
  readonly y: number
  readonly width: number

  readonly elements: any[] = []

  constructor({ x, y, width }) {
    this.x = x
    this.y = y
    this.width = width
  }

  add(element: any) {
    if (!this.elements.includes(element))
      this.elements.push(element)
  }

  remove(element: any) {
    if (this.elements.includes(element))
      this.elements.splice(
        this.elements.indexOf(element),
        1,
      )
  }

  has(element: any): boolean {
    return this.elements.includes(element)
  }
}
